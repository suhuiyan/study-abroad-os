"""Temporary-database tests for backup creation and restore verification."""

import hashlib
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path

from discovery.backup_restore import create_backup, restore_and_verify


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def initialize(path: Path, *, wal: bool = False) -> None:
    with closing(sqlite3.connect(path)) as connection:
        with connection:
            connection.execute("CREATE TABLE universities (moe_code TEXT PRIMARY KEY, name_zh TEXT NOT NULL)")
            connection.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, moe_code TEXT REFERENCES universities(moe_code))")
            connection.execute("INSERT INTO universities VALUES ('0000000001', '测试大学')")
            connection.execute("INSERT INTO notes(moe_code) VALUES ('0000000001')")
            if wal:
                connection.execute("PRAGMA journal_mode=WAL")
                connection.execute("INSERT INTO universities VALUES ('0000000002', '甘肃大学')")


class BackupRestoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.source = self.root / "source.sqlite3"
        initialize(self.source)

    def tearDown(self):
        self.temp.cleanup()

    def test_backup_manifest_and_restore_round_trip(self):
        source_before = digest(self.source)
        backup = self.root / "backup.sqlite3"
        restore = self.root / "restored.sqlite3"
        report = create_backup(self.source, backup)
        self.assertEqual(source_before, digest(self.source))
        self.assertEqual(digest(backup), report["backupSha256"])
        self.assertEqual(report["backupSha256"], report["sourceSnapshotSha256"])
        self.assertEqual({"notes": 1, "universities": 1}, report["tableRowCounts"])
        manifest = json.loads(Path(str(backup) + ".manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(report, manifest)

        restored = restore_and_verify(backup, restore, expected_backup_sha256=report["backupSha256"])
        self.assertEqual(report["tableRowCounts"], restored["tableRowCounts"])
        self.assertEqual("ok", restored["integrity"])
        with closing(sqlite3.connect(restore)) as connection:
            self.assertEqual("测试大学", connection.execute("SELECT name_zh FROM universities").fetchone()[0])

    def test_backup_api_includes_committed_wal_rows(self):
        source = self.root / "wal.sqlite3"
        initialize(source, wal=True)
        report = create_backup(source, self.root / "wal-backup.sqlite3")
        self.assertEqual(2, report["tableRowCounts"]["universities"])
        with closing(sqlite3.connect(self.root / "wal-backup.sqlite3")) as connection:
            self.assertEqual(2, connection.execute("SELECT count(*) FROM universities").fetchone()[0])

    def test_refuses_to_overwrite_any_existing_input_or_output(self):
        backup = self.root / "backup.sqlite3"
        create_backup(self.source, backup)
        with self.assertRaises(FileExistsError):
            create_backup(self.source, backup)
        with self.assertRaises(FileExistsError):
            restore_and_verify(backup, self.source)
        with self.assertRaises(FileExistsError):
            restore_and_verify(backup, self.root / "backup.sqlite3.manifest.json")

    def test_rejects_tampered_backup_and_leaves_inputs_unchanged(self):
        backup = self.root / "backup.sqlite3"
        create_backup(self.source, backup)
        backup_before = digest(backup)
        source_before = digest(self.source)
        with self.assertRaisesRegex(ValueError, "does not match"):
            restore_and_verify(backup, self.root / "restore.sqlite3", expected_backup_sha256="0" * 64)
        self.assertFalse((self.root / "restore.sqlite3").exists())
        self.assertEqual(backup_before, digest(backup))
        self.assertEqual(source_before, digest(self.source))

    def test_invalid_backup_never_publishes_restore(self):
        broken = self.root / "broken.sqlite3"
        broken.write_bytes(b"not a sqlite database")
        with self.assertRaises(sqlite3.DatabaseError):
            restore_and_verify(broken, self.root / "restore.sqlite3")
        self.assertFalse((self.root / "restore.sqlite3").exists())


if __name__ == "__main__":
    unittest.main()
