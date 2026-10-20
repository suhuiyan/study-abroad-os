"""Run a bounded, read-only source sweep over the existing bachelor queue.

This is a coverage pass, not an admissions verifier. It never writes SQLite and
does not promote a row to an admissions status. It fetches only URLs already
present in the input queue, deduplicates URL requests, records hashes/metadata,
and emits a prompt-ready follow-up queue for the next research stage.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import threading
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from time import monotonic
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


DEFAULT_TIMEOUT = 20.0
DEFAULT_MAX_BYTES = 2_000_000
DEFAULT_WORKERS = 8
USER_AGENT = "Study-Abroad-OS-source-sweep/1.0 (read-only research)"

URL_KEYS = ("official_homepage", "admissions_url")
TEXT_CONTENT_TYPES = ("text/html", "application/xhtml+xml", "text/plain")

# These words only classify a source for follow-up. They never prove admission.
INTERNATIONAL_TERMS = (
    "国际学生", "留学生", "外国留学生", "international student", "international students",
    "foreign student", "foreign students", "来华留学", "国际生",
)
BACHELOR_TERMS = (
    "本科", "本科生", "学士", "undergraduate", "bachelor", "bachelor's", "学位",
)
ADMISSION_TERMS = (
    "招生", "申请", "报名", "招生简章", "admission", "apply", "application", "prospectus",
)


class _TextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.text_parts: list[str] = []
        self._in_title = False
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag == "title":
            self._in_title = True
        if tag in {"script", "style", "noscript", "svg"}:
            self._skip_depth += 1

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title":
            self._in_title = False
        if tag in {"script", "style", "noscript", "svg"} and self._skip_depth:
            self._skip_depth -= 1

    def handle_data(self, data: str) -> None:
        if self._skip_depth:
            return
        cleaned = re.sub(r"\s+", " ", data).strip()
        if not cleaned:
            return
        if self._in_title:
            self.title_parts.append(cleaned)
        self.text_parts.append(cleaned)

    @property
    def title(self) -> str | None:
        value = " ".join(self.title_parts).strip()
        return value[:500] or None

    @property
    def text(self) -> str:
        return " ".join(self.text_parts)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _canonical_url(value: object) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None
    value = value.strip()
    parsed = urlsplit(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return None
    return value


def _matches(text: str, terms: tuple[str, ...]) -> list[str]:
    lowered = text.lower()
    return [term for term in terms if term.lower() in lowered]


def _extract_html(body: bytes, content_type: str) -> tuple[str | None, str, list[str]]:
    parser = _TextParser()
    try:
        parser.feed(body.decode("utf-8", errors="replace"))
    except Exception:
        return None, "", []
    text = parser.text
    hits = sorted(set(_matches(text, INTERNATIONAL_TERMS + BACHELOR_TERMS + ADMISSION_TERMS)))
    return parser.title, text[:10_000], hits


def _fetch(url: str, timeout: float, max_bytes: int) -> dict[str, object]:
    started = monotonic()
    fetched_at = _now()
    base: dict[str, object] = {
        "requestedUrl": url,
        "finalUrl": None,
        "title": None,
        "fetchedAt": fetched_at,
        "httpStatus": None,
        "contentType": None,
        "bytesRead": 0,
        "truncated": False,
        "sha256": None,
        "keywordHits": [],
        "officialDomainSignal": False,
        "retrievalMethod": "html",
        "error": None,
        "elapsedMs": None,
    }
    try:
        request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml,application/pdf,text/plain;q=0.8"})
        with urlopen(request, timeout=timeout) as response:
            content_type = response.headers.get_content_type().lower()
            chunks: list[bytes] = []
            remaining = max_bytes
            while remaining > 0:
                chunk = response.read(min(64 * 1024, remaining + 1))
                if not chunk:
                    break
                if len(chunk) > remaining:
                    chunks.append(chunk[:remaining])
                    base["truncated"] = True
                    break
                chunks.append(chunk)
                remaining -= len(chunk)
            body = b"".join(chunks)
            final_url = response.geturl()
            host = (urlsplit(final_url).hostname or "").lower()
            base.update({
                "finalUrl": final_url,
                "httpStatus": int(response.status),
                "contentType": content_type,
                "bytesRead": len(body),
                "sha256": hashlib.sha256(body).hexdigest(),
                "officialDomainSignal": host.endswith(".edu.cn") or host.endswith(".ac.cn"),
            })
            if content_type in TEXT_CONTENT_TYPES:
                title, text, hits = _extract_html(body, content_type)
                base.update({"title": title, "keywordHits": hits, "textPreview": text[:800]})
            elif content_type == "application/pdf":
                base["retrievalMethod"] = "pdf_text"
                base["error"] = "pdf_capture_requires_extraction_stage"
            else:
                base["retrievalMethod"] = "browser"
                base["error"] = "non_text_content_requires_extraction_stage"
    except HTTPError as exc:
        base.update({"httpStatus": int(exc.code), "error": f"http_{exc.code}"})
    except (URLError, TimeoutError, OSError) as exc:
        base["error"] = type(exc).__name__
    except Exception as exc:  # Keep one bad site from stopping the sweep.
        base["error"] = type(exc).__name__
    base["elapsedMs"] = round((monotonic() - started) * 1000, 1)
    return base


def _host(url: str) -> str:
    return (urlsplit(url).hostname or "").lower()


def _read_queue(path: Path) -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, 1):
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid queue JSON at line {line_number}") from exc
            if not record.get("taskId") or not record.get("inputVersion"):
                raise ValueError(f"Missing task identity at line {line_number}")
            records.append(record)
    return records


def _row_status(observations: list[dict[str, object]], has_urls: bool) -> tuple[str, str]:
    if not has_urls:
        return "no_existing_source", "find_official_homepage_and_international_admissions_url"
    successful = [o for o in observations if isinstance(o.get("httpStatus"), int) and 200 <= int(o["httpStatus"]) < 400]
    relevant = [o for o in successful if set(o.get("keywordHits", [])) & set(INTERNATIONAL_TERMS) and set(o.get("keywordHits", [])) & set(BACHELOR_TERMS)]
    if relevant:
        return "candidate_relevant_source", "extract_cycle_program_requirements_and_scholarship_scopes"
    if successful:
        unreadable = [o for o in successful if o.get("error")]
        if unreadable:
            return "source_reachable_unreadable", "extract_pdf_or_image_source_with_locator"
        return "source_reachable_needs_review", "locate_international_undergraduate_notice"
    return "fetch_failed_or_blocked", "retry_with_source_capture_or_find_official_cross_link"


def _follow_up(record: dict[str, object], status: str, next_action: str) -> dict[str, object]:
    university = record.get("university") or {}
    row = record.get("rowSnapshot") or {}
    requested_fields = {
        "no_existing_source": ["official_homepage", "international_office", "undergraduate_admissions_url"],
        "fetch_failed_or_blocked": ["source_retrieval", "official_cross_link"],
        "source_reachable_unreadable": ["document_capture", "degree_level", "intake_cycle"],
        "source_reachable_needs_review": ["foreign_applicant_eligibility", "degree_level", "intake_cycle"],
        "candidate_relevant_source": ["intake_cycle", "application_deadline", "programs", "language", "CSCA", "tuition", "scholarships"],
    }.get(status, ["official_admissions_evidence"])
    queries = [
        f"{university.get('nameZh', '')} 国际学生 本科 招生简章",
        f"{university.get('nameZh', '')} 来华留学 本科 招生",
    ]
    if row.get("official_homepage"):
        queries.insert(1, f"site:{_host(str(row['official_homepage']))} 国际学生 本科 招生")
    stage = {
        "candidate_relevant_source": "extraction",
        "source_reachable_unreadable": "repair",
        "fetch_failed_or_blocked": "repair",
    }.get(status, "discovery")
    return {
        "taskId": record["taskId"],
        "inputVersion": record["inputVersion"],
        "moeCode": university.get("moeCode"),
        "nameZh": university.get("nameZh"),
        "region": university.get("region"),
        "stage": stage,
        "status": status,
        "requestedFields": requested_fields,
        "queries": queries[:3],
        "nextAction": next_action,
    }


def run(queue_path: str | Path, output_dir: str | Path, *, workers: int = DEFAULT_WORKERS, timeout: float = DEFAULT_TIMEOUT, max_bytes: int = DEFAULT_MAX_BYTES) -> dict[str, object]:
    queue = _read_queue(Path(queue_path).resolve())
    destination = Path(output_dir).resolve()
    destination.mkdir(parents=True, exist_ok=True)
    observations_path = destination / "fast-source-sweep.jsonl"
    follow_up_path = destination / "fast-follow-up-queue.jsonl"
    csv_path = destination / "fast-source-sweep.csv"
    manifest_path = destination / "fast-source-sweep-manifest.json"

    urls: dict[str, None] = {}
    row_urls: dict[str, list[str]] = {}
    for record in queue:
        row_id = str(record["taskId"])
        row_urls[row_id] = []
        row = record.get("rowSnapshot") or {}
        for key in URL_KEYS:
            url = _canonical_url(row.get(key))
            if url and url not in row_urls[row_id]:
                row_urls[row_id].append(url)
                urls[url] = None

    host_locks: dict[str, threading.Lock] = defaultdict(threading.Lock)
    fetched: dict[str, dict[str, object]] = {}

    def fetch_one(url: str) -> tuple[str, dict[str, object]]:
        lock = host_locks[_host(url)]
        with lock:
            return url, _fetch(url, timeout, max_bytes)

    with ThreadPoolExecutor(max_workers=max(1, min(workers, 32))) as executor:
        futures = [executor.submit(fetch_one, url) for url in sorted(urls)]
        for future in as_completed(futures):
            url, observation = future.result()
            fetched[url] = observation

    output_rows: list[dict[str, object]] = []
    follow_ups: list[dict[str, object]] = []
    counts: Counter[str] = Counter()
    for record in queue:
        row_id = str(record["taskId"])
        observations = [fetched[url] for url in row_urls[row_id] if url in fetched]
        status, next_action = _row_status(observations, bool(row_urls[row_id]))
        university = record.get("university") or {}
        output_rows.append({
            "taskId": record["taskId"],
            "inputVersion": record["inputVersion"],
            "moeCode": university.get("moeCode"),
            "nameZh": university.get("nameZh"),
            "region": university.get("region"),
            "asOf": _now()[:10],
            "discoveryStatus": status,
            "sourceInputs": row_urls[row_id],
            "observations": observations,
            "nextAction": next_action,
            "importReady": False,
        })
        follow_up = _follow_up(record, status, next_action)
        follow_ups.append(follow_up)
        counts[status] += 1

    def write_jsonl(path: Path, rows: list[dict[str, object]]) -> None:
        path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows), encoding="utf-8")

    write_jsonl(observations_path, output_rows)
    write_jsonl(follow_up_path, follow_ups)
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["taskId", "inputVersion", "moeCode", "nameZh", "region", "asOf", "discoveryStatus", "sourceInputs", "nextAction", "importReady"])
        writer.writeheader()
        for row in output_rows:
            writer.writerow({
                **{key: row.get(key) for key in writer.fieldnames if key not in {"sourceInputs"}},
                "sourceInputs": " | ".join(row["sourceInputs"]),
            })
    manifest = {
        "schemaVersion": 1,
        "kind": "fast_source_sweep",
        "generatedAt": _now(),
        "queuePath": str(Path(queue_path).resolve()),
        "queueRows": len(queue),
        "uniqueUrls": len(urls),
        "fetchedUrls": len(fetched),
        "config": {"workers": workers, "timeoutSeconds": timeout, "maxBytes": max_bytes, "oneRequestAtATimePerHost": True},
        "byDiscoveryStatus": dict(sorted(counts.items())),
        "outputs": {"observations": observations_path.name, "followUp": follow_up_path.name, "coverageCsv": csv_path.name},
        "policy": "Coverage discovery only; no admissions verification, no SQLite writes, no production writes.",
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--queue", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--workers", type=int, default=DEFAULT_WORKERS)
    parser.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT)
    parser.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES)
    args = parser.parse_args()
    if args.workers < 1 or args.timeout <= 0 or args.max_bytes < 1024:
        raise SystemExit("workers, timeout, and max-bytes must be positive")
    print(json.dumps(run(args.queue, args.output_dir, workers=args.workers, timeout=args.timeout, max_bytes=args.max_bytes), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
