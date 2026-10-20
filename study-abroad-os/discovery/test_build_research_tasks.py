"""Read-only tests for deterministic, row-bound research task export."""

import hashlib
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path

from discovery.build_research_tasks import build, read_task_inputs
from discovery.package_validator import expected_input_version


def make_db(path: Path):
    with closing(sqlite3.connect(path)) as connection:
        with connection:
            connection.executescript("""
                CREATE TABLE datasets (
                    dataset_id TEXT PRIMARY KEY, source_title TEXT NOT NULL, source_url TEXT NOT NULL,
                    published_at TEXT NOT NULL, source_as_of TEXT NOT NULL, retrieved_at TEXT NOT NULL,
                    source_sha256 TEXT NOT NULL, imported_count INTEGER NOT NULL);
                CREATE TABLE universities (
                    moe_code TEXT PRIMARY KEY, name_zh TEXT NOT NULL, name_en TEXT NOT NULL DEFAULT '',
                    managing_authority TEXT NOT NULL DEFAULT '', region TEXT NOT NULL DEFAULT '', level TEXT NOT NULL DEFAULT '',
                    notes TEXT NOT NULL DEFAULT '', official_homepage TEXT NOT NULL DEFAULT '', admissions_url TEXT NOT NULL DEFAULT '',
                    verification_status TEXT NOT NULL DEFAULT 'not_checked', review_note TEXT NOT NULL DEFAULT '',
                    reviewed_at TEXT NOT NULL DEFAULT '', source_as_of TEXT NOT NULL DEFAULT '2026-06-17');
                INSERT INTO datasets VALUES ('older','old','https://moe.cn/old','2025-01-01','2025-01-01','2025-01-01T00:00:00Z','oldhash',1);
                INSERT INTO datasets VALUES ('current','current','https://moe.cn/current','2026-06-18','2026-06-17','2026-06-18T00:00:00Z','newhash',2);
                INSERT INTO universities(moe_code,name_zh,region,level,verification_status)
                    VALUES ('0000000001','测试大学','测试省','本科','not_checked');
                INSERT INTO universities(moe_code,name_zh,region,level,verification_status)
                    VALUES ('0000000002','短期大学','测试省','专科','not_checked');
            """)


class BuildResearchTasksTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.db = self.root / "register.sqlite3"
        make_db(self.db)

    def tearDown(self):
        self.temp.cleanup()

    def test_exports_only_existing_bachelor_rows_with_recomputable_input_hash(self):
        records, dataset = read_task_inputs(self.db)
        self.assertEqual("current", dataset["dataset_id"])
        self.assertEqual(1, len(records))
        record = records[0]
        self.assertEqual("0000000001", record["university"]["moeCode"])
        self.assertEqual(record["inputVersion"], expected_input_version("current", "newhash", record["rowSnapshot"]))
        self.assertIn("rowSnapshot", record)

    def test_writes_stable_jsonl_and_integrity_manifest_without_changing_database(self):
        output = self.root / "tasks"
        before = hashlib.sha256(self.db.read_bytes()).hexdigest()
        first = build(self.db, output, generated_at="2026-09-27T00:00:00Z")
        content = (output / "research-tasks.jsonl").read_bytes()
        loaded = json.loads(content.decode("utf-8"))
        self.assertEqual(1, first["rowCount"])
        self.assertEqual(first["taskSetSha256"], hashlib.sha256(content).hexdigest())
        self.assertEqual("测试大学", loaded["university"]["nameZh"])
        self.assertEqual(before, hashlib.sha256(self.db.read_bytes()).hexdigest())
        with self.assertRaises(FileExistsError):
            build(self.db, output, generated_at="2026-09-27T00:00:00Z")
        second = build(self.db, output, overwrite=True, generated_at="2026-09-27T00:00:00Z")
        self.assertEqual(first["taskSetSha256"], second["taskSetSha256"])

    def test_row_change_produces_new_task_identity(self):
        first, _ = read_task_inputs(self.db)
        with closing(sqlite3.connect(self.db)) as connection:
            with connection:
                connection.execute("UPDATE universities SET review_note='new reviewed note' WHERE moe_code='0000000001'")
        second, _ = read_task_inputs(self.db)
        self.assertNotEqual(first[0]["inputVersion"], second[0]["inputVersion"])
        self.assertNotEqual(first[0]["taskId"], second[0]["taskId"])


if __name__ == "__main__":
    unittest.main()
