import csv
from contextlib import closing
import hashlib
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

from discovery.build_coverage_queue import build


class CoverageQueueTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.database = self.root / "register.sqlite3"
        with closing(sqlite3.connect(self.database)) as conn:
            conn.executescript("""
                CREATE TABLE datasets(dataset_id TEXT, source_sha256 TEXT, source_as_of TEXT);
                INSERT INTO datasets VALUES('test-dataset','abc123','2026-06-17');
                CREATE TABLE universities(
                    moe_code TEXT PRIMARY KEY, name_zh TEXT, name_en TEXT, region TEXT,
                    level TEXT, verification_status TEXT, official_homepage TEXT,
                    admissions_url TEXT, review_note TEXT, reviewed_at TEXT, source_as_of TEXT
                );
                INSERT INTO universities VALUES
                    ('0000000001','学校甲','','甲省','本科','not_checked','','','','','2026-06-17'),
                    ('0000000002','学校乙','','乙省','本科','source_found','https://example.edu.cn','https://example.edu.cn/admissions','','2026-09-01','2026-06-17'),
                    ('0000000003','=学校丙','','乙省','本科','not_checked','','','','','2026-06-17'),
                    ('0000000004','学校丁','','丙省','专科','not_checked','','','','','2026-06-17');
            """)

    def tearDown(self):
        self.temp.cleanup()

    def test_exports_existing_bachelor_rows_and_provenance(self):
        before = hashlib.sha256(self.database.read_bytes()).hexdigest()
        output = self.root / "queue"
        manifest = build(self.database, output, generated_at="2026-09-27T00:00:00+00:00")
        with (output / "coverage-queue.csv").open(encoding="utf-8-sig", newline="") as handle:
            rows = list(csv.DictReader(handle))
        self.assertEqual([row["moe_code"] for row in rows], ["0000000003", "0000000002", "0000000001"])
        self.assertEqual(rows[0]["queue_action"], "initial_research")
        self.assertEqual(rows[1]["queue_action"], "recheck_scope_and_current_cycle")
        self.assertEqual(manifest["rowCount"], 3)
        self.assertEqual(manifest["provinceCount"], 2)
        self.assertEqual(manifest["datasetId"], "test-dataset")
        self.assertEqual(len(manifest["selectionSha256"]), 64)
        self.assertEqual(hashlib.sha256(self.database.read_bytes()).hexdigest(), before)

    def test_formula_leading_values_are_escaped(self):
        output = self.root / "queue"
        build(self.database, output)
        with (output / "coverage-queue.csv").open(encoding="utf-8-sig", newline="") as handle:
            rows = list(csv.DictReader(handle))
        self.assertEqual([row["name_zh"] for row in rows if row["moe_code"] == "0000000003"], ["'=学校丙"])

    def test_existing_output_is_not_overwritten_without_explicit_flag(self):
        output = self.root / "queue"
        build(self.database, output)
        with self.assertRaises(FileExistsError):
            build(self.database, output)
        build(self.database, output, overwrite=True)

    def test_manifest_is_json_and_tracks_status_counts(self):
        output = self.root / "queue"
        build(self.database, output)
        manifest = json.loads((output / "coverage-manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["byStatus"], {"not_checked": 2, "source_found": 1})


if __name__ == "__main__":
    unittest.main(verbosity=2)
