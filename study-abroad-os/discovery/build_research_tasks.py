"""Export existing bachelor rows as reproducible, input-versioned research tasks."""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
from collections import Counter
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from .package_validator import canonical_json, expected_input_version
except ImportError:  # Support direct `python discovery/build_research_tasks.py` execution.
    from package_validator import canonical_json, expected_input_version


ROOT = Path(__file__).resolve().parent
DEFAULT_DB = ROOT / "data" / "discovery.sqlite3"
ROW_FIELDS = (
    "moe_code", "name_zh", "name_en", "managing_authority", "region", "level", "notes",
    "official_homepage", "admissions_url", "verification_status", "review_note", "reviewed_at", "source_as_of",
)


def read_task_inputs(database: str | Path) -> tuple[list[dict[str, Any]], dict[str, str]]:
    path = Path(database).expanduser().resolve()
    if not path.is_file():
        raise FileNotFoundError(path)
    with closing(sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)) as connection:
        connection.row_factory = sqlite3.Row
        dataset = connection.execute(
            "SELECT dataset_id,source_sha256,source_as_of FROM datasets "
            "ORDER BY source_as_of DESC,retrieved_at DESC,rowid DESC LIMIT 1"
        ).fetchone()
        if dataset is None:
            raise ValueError("The register has no MOE dataset provenance")
        rows = connection.execute(
            "SELECT " + ",".join(ROW_FIELDS) + " FROM universities WHERE level='本科' ORDER BY moe_code"
        ).fetchall()
    records: list[dict[str, Any]] = []
    seen: set[str] = set()
    dataset = dict(dataset)
    for raw in rows:
        row = dict(raw)
        code = row["moe_code"]
        if not isinstance(code, str) or len(code) != 10 or not code.isdigit():
            raise ValueError("A bachelor row has an invalid MOE code")
        if code in seen:
            raise ValueError(f"Duplicate MOE code in bachelor register: {code}")
        seen.add(code)
        input_version = expected_input_version(dataset["dataset_id"], dataset["source_sha256"], row)
        task_id = f"R-{code}-{input_version[:12]}"
        records.append({
            "taskId": task_id,
            "inputVersion": input_version,
            "dataset": {
                "datasetId": dataset["dataset_id"],
                "sourceSha256": dataset["source_sha256"],
                "sourceAsOf": dataset["source_as_of"],
            },
            "university": {
                "moeCode": code,
                "nameZh": row["name_zh"],
                "region": row["region"],
                "degreeLevel": row["level"],
            },
            "rowSnapshot": row,
            "outputPath": f"results/{task_id}.json",
            "researchScope": "Verify official international undergraduate admissions and scholarships for mainland China; unknown is not negative evidence.",
        })
    return records, dataset


def build(database: str | Path, output_dir: str | Path, *, overwrite: bool = False, generated_at: str | None = None) -> dict[str, Any]:
    records, dataset = read_task_inputs(database)
    destination = Path(output_dir).expanduser().resolve()
    destination.mkdir(parents=True, exist_ok=True)
    tasks_path = destination / "research-tasks.jsonl"
    manifest_path = destination / "research-tasks-manifest.json"
    if not overwrite and (tasks_path.exists() or manifest_path.exists()):
        raise FileExistsError("Task export exists; pass overwrite=True to regenerate it")

    task_bytes = b"".join(canonical_json(record) + b"\n" for record in records)
    status_counts = Counter(record["rowSnapshot"]["verification_status"] for record in records)
    manifest = {
        "generatedAt": generated_at or datetime.now(timezone.utc).isoformat(),
        "sourceDatabase": str(Path(database).expanduser().resolve()),
        "databaseMode": "read-only",
        "datasetId": dataset["dataset_id"],
        "datasetSourceSha256": dataset["source_sha256"],
        "datasetAsOf": dataset["source_as_of"],
        "rowCount": len(records),
        "taskSetSha256": hashlib.sha256(task_bytes).hexdigest(),
        "byStatus": dict(sorted(status_counts.items())),
        "selection": "Existing universities rows where level=本科; identities are neither discovered nor modified.",
        "file": tasks_path.name,
    }
    # Stage both files first so failed serialization/write does not leave a partial export.
    tasks_temp = destination / f".{tasks_path.name}.tmp"
    manifest_temp = destination / f".{manifest_path.name}.tmp"
    try:
        tasks_temp.write_bytes(task_bytes)
        manifest_temp.write_text(json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
        if not overwrite and (tasks_path.exists() or manifest_path.exists()):
            raise FileExistsError("Task export appeared while preparing output; refusing to overwrite")
        tasks_temp.replace(tasks_path)
        manifest_temp.replace(manifest_path)
    finally:
        tasks_temp.unlink(missing_ok=True)
        manifest_temp.unlink(missing_ok=True)
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, default=DEFAULT_DB)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    print(json.dumps(build(args.database, args.output_dir, overwrite=args.overwrite), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
