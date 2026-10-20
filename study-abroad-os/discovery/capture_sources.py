"""Capture already-known source URLs for independent evidence review.

This command is read-only with respect to SQLite and production. It accepts the
existing research-task JSONL queue, fetches only URLs already present in each
row, saves bounded response bytes, and records redirect, status, content type,
retrieval time, and SHA-256 in an append-only JSONL manifest.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from time import monotonic
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from fast_source_sweep import _canonical_url, _host

DEFAULT_TIMEOUT = 20.0
DEFAULT_MAX_BYTES = 5_000_000
DEFAULT_WORKERS = 8
USER_AGENT = "Study-Abroad-OS-source-capture/1.0 (read-only research)"
URL_KEYS = ("official_homepage", "admissions_url")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _read_queue(path: Path) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, 1):
            if not line.strip():
                continue
            row = json.loads(line)
            if not row.get("taskId") or not row.get("inputVersion"):
                raise ValueError(f"Missing task identity at line {line_number}")
            rows.append(row)
    return rows


def _fetch(url: str, output_dir: Path, timeout: float, max_bytes: int) -> dict[str, object]:
    started = monotonic()
    record: dict[str, object] = {
        "requestedUrl": url,
        "finalUrl": None,
        "fetchedAt": _now(),
        "httpStatus": None,
        "contentType": None,
        "bytesRead": 0,
        "truncated": False,
        "capturePath": None,
        "sha256": None,
        "error": None,
        "elapsedMs": None,
    }
    try:
        request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml,application/pdf,text/plain;q=0.8"})
        with urlopen(request, timeout=timeout) as response:
            chunks: list[bytes] = []
            remaining = max_bytes
            while remaining > 0:
                chunk = response.read(min(64 * 1024, remaining + 1))
                if not chunk:
                    break
                if len(chunk) > remaining:
                    chunks.append(chunk[:remaining])
                    record["truncated"] = True
                    break
                chunks.append(chunk)
                remaining -= len(chunk)
            body = b"".join(chunks)
            final_url = response.geturl()
            digest = hashlib.sha256(body).hexdigest()
            ext = ".bin"
            content_type = response.headers.get_content_type().lower()
            if content_type in {"text/html", "application/xhtml+xml"}:
                ext = ".html"
            elif content_type == "application/pdf":
                ext = ".pdf"
            elif content_type.startswith("text/"):
                ext = ".txt"
            capture_name = f"{digest}{ext}"
            (output_dir / capture_name).write_bytes(body)
            record.update({
                "finalUrl": final_url,
                "httpStatus": int(response.status),
                "contentType": content_type,
                "bytesRead": len(body),
                "capturePath": str(Path("captures") / capture_name).replace("\\", "/"),
                "sha256": digest,
            })
    except HTTPError as exc:
        record.update({"httpStatus": int(exc.code), "error": f"http_{exc.code}"})
    except (URLError, TimeoutError, OSError) as exc:
        record["error"] = type(exc).__name__
    except Exception as exc:
        record["error"] = type(exc).__name__
    record["elapsedMs"] = round((monotonic() - started) * 1000, 1)
    return record


def run(queue_path: str | Path, output_dir: str | Path, *, workers: int = DEFAULT_WORKERS, timeout: float = DEFAULT_TIMEOUT, max_bytes: int = DEFAULT_MAX_BYTES) -> dict[str, object]:
    queue = _read_queue(Path(queue_path).resolve())
    root = Path(output_dir).resolve()
    captures = root / "captures"
    captures.mkdir(parents=True, exist_ok=True)
    urls: dict[str, None] = {}
    for row in queue:
        snapshot = row.get("rowSnapshot") or {}
        for key in URL_KEYS:
            url = _canonical_url(snapshot.get(key))
            if url:
                urls[url] = None
    host_locks: dict[str, threading.Lock] = {}
    host_lock_guard = threading.Lock()

    def fetch_one(url: str) -> tuple[str, dict[str, object]]:
        host = _host(url)
        with host_lock_guard:
            lock = host_locks.setdefault(host, threading.Lock())
        with lock:
            return url, _fetch(url, captures, timeout, max_bytes)

    observations: dict[str, dict[str, object]] = {}
    with ThreadPoolExecutor(max_workers=max(1, min(workers, 32))) as executor:
        futures = [executor.submit(fetch_one, url) for url in sorted(urls)]
        for future in as_completed(futures):
            url, result = future.result()
            observations[url] = result

    manifest_rows: list[dict[str, object]] = []
    for row in queue:
        university = row.get("university") or {}
        snapshot = row.get("rowSnapshot") or {}
        for key in URL_KEYS:
            url = _canonical_url(snapshot.get(key))
            if url and url in observations:
                manifest_rows.append({
                    "taskId": row["taskId"],
                    "inputVersion": row["inputVersion"],
                    "moeCode": university.get("moeCode"),
                    "nameZh": university.get("nameZh"),
                    "urlField": key,
                    **observations[url],
                })
    manifest_rows.sort(key=lambda row: (str(row.get("moeCode")), str(row.get("urlField"))))
    (root / "source-captures.jsonl").write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in manifest_rows), encoding="utf-8")
    summary = {
        "schemaVersion": 1,
        "kind": "source_capture",
        "generatedAt": _now(),
        "queueRows": len(queue),
        "uniqueUrls": len(urls),
        "capturedResponses": sum(1 for row in observations.values() if row.get("capturePath")),
        "observations": len(manifest_rows),
        "config": {"workers": workers, "timeoutSeconds": timeout, "maxBytes": max_bytes, "oneRequestAtATimePerHost": True},
        "outputs": {"manifest": "source-captures.jsonl", "captureDirectory": "captures"},
        "policy": "Existing URLs only; no SQLite writes; no admissions verification; captured bytes are evidence for review.",
    }
    (root / "source-capture-manifest.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return summary


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
