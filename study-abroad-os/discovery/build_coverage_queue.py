"""Export a reproducible bachelor coverage queue from the local MOE register."""
import argparse
import csv
from contextlib import closing
import hashlib
import json
import sqlite3
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DEFAULT_DB = ROOT / "data" / "discovery.sqlite3"
FIELDS = [
    "moe_code", "name_zh", "name_en", "province", "current_status",
    "official_homepage", "admissions_url", "review_note", "reviewed_at",
    "source_as_of", "queue_action",
]
QUEUE_ACTIONS = {
    "not_checked": "initial_research",
    "source_found": "recheck_scope_and_current_cycle",
    "needs_review": "resolve_existing_review_gaps",
    "not_verified": "targeted_follow_up",
    "no_current_admissions": "recheck_named_cycle_and_newer_cycles",
    "verified_admissions": "refresh_and_check_scope",
}


def safe_cell(value):
    value = str(value or "")
    return "'" + value if value.startswith(("=", "+", "-", "@", "\t", "\r")) else value


def read_bachelor_rows(database):
    database = Path(database).resolve()
    if not database.is_file():
        raise FileNotFoundError(database)
    uri = database.as_uri() + "?mode=ro"
    with closing(sqlite3.connect(uri, uri=True)) as conn:
        conn.row_factory = sqlite3.Row
        dataset = conn.execute(
            "SELECT dataset_id,source_sha256,source_as_of FROM datasets ORDER BY dataset_id LIMIT 1"
        ).fetchone()
        if dataset is None:
            raise ValueError("The register has no dataset provenance row")
        rows = conn.execute(
            """SELECT moe_code,name_zh,name_en,region,verification_status,
                      official_homepage,admissions_url,review_note,reviewed_at,source_as_of
               FROM universities WHERE level='本科' ORDER BY region,verification_status,moe_code"""
        ).fetchall()
    codes = [row["moe_code"] for row in rows]
    if len(codes) != len(set(codes)):
        raise ValueError("Duplicate MOE code in bachelor coverage rows")
    return [dict(row) for row in rows], dict(dataset)


def build(database, output_dir, *, overwrite=False, generated_at=None):
    rows, dataset = read_bachelor_rows(database)
    output_dir = Path(output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    csv_path = output_dir / "coverage-queue.csv"
    manifest_path = output_dir / "coverage-manifest.json"
    if not overwrite and (csv_path.exists() or manifest_path.exists()):
        raise FileExistsError("Output exists; pass overwrite=True to replace the queue artifacts")

    selection_bytes = json.dumps(
        {"dataset": dataset, "rows": rows}, ensure_ascii=False, sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    status_counts = Counter(row["verification_status"] for row in rows)
    province_counts = Counter(row["region"] for row in rows)
    timestamp = generated_at or datetime.now(timezone.utc).isoformat()

    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        for row in rows:
            writer.writerow({
                "moe_code": safe_cell(row["moe_code"]),
                "name_zh": safe_cell(row["name_zh"]),
                "name_en": safe_cell(row["name_en"]),
                "province": safe_cell(row["region"]),
                "current_status": safe_cell(row["verification_status"]),
                "official_homepage": safe_cell(row["official_homepage"]),
                "admissions_url": safe_cell(row["admissions_url"]),
                "review_note": safe_cell(row["review_note"]),
                "reviewed_at": safe_cell(row["reviewed_at"]),
                "source_as_of": safe_cell(row["source_as_of"]),
                "queue_action": QUEUE_ACTIONS.get(row["verification_status"], "review_status"),
            })

    manifest = {
        "generatedAt": timestamp,
        "sourceDatabase": str(Path(database).resolve()),
        "datasetId": dataset["dataset_id"],
        "datasetSourceSha256": dataset["source_sha256"],
        "datasetAsOf": dataset["source_as_of"],
        "selectionSha256": hashlib.sha256(selection_bytes).hexdigest(),
        "selection": "Existing universities rows where level=本科; no institution identities were rebuilt or imported.",
        "rowCount": len(rows),
        "provinceCount": len(province_counts),
        "byStatus": dict(sorted(status_counts.items())),
        "byProvince": dict(sorted(province_counts.items())),
        "file": csv_path.name,
        "databaseMode": "read-only",
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, default=DEFAULT_DB)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    print(json.dumps(build(args.database, args.output_dir, overwrite=args.overwrite), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
