"""Transactional importer tests use isolated temporary SQLite databases only."""

import copy
import hashlib
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path
import shutil

from discovery.backup_restore import create_backup, restore_and_verify
from discovery.import_package import ImportRejected, ROW_FIELDS, _db_hash, import_package
from discovery.migrate_evidence import connect, migrate
from discovery.package_validator import (
    expected_input_version,
    expected_package_id,
    expected_package_sha256,
)


FIXTURE = Path(__file__).parent / "tests" / "fixtures" / "package-validator" / "valid_v1.json"


def init_db(path: Path):
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
                CREATE TABLE review_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, moe_code TEXT NOT NULL REFERENCES universities(moe_code),
                    previous_status TEXT NOT NULL, next_status TEXT NOT NULL, note TEXT NOT NULL,
                    changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
                INSERT INTO datasets VALUES ('moe-test','MOE test','https://example.cn/moe','2026-01-01','2026-06-17',
                    '2026-06-17T00:00:00Z','aabbccdd',1);
                INSERT INTO universities(moe_code,name_zh,name_en,managing_authority,region,level,notes,
                    official_homepage,admissions_url,verification_status,review_note,reviewed_at,source_as_of)
                VALUES ('4162010001','测试大学','Test University','MOE','甘肃省','本科','',
                    '','','not_checked','','','2026-06-17');
            """)
    migrate(path)


def package_and_review(path: Path):
    package = json.loads(FIXTURE.read_text(encoding="utf-8"))
    with closing(connect(path)) as connection:
        row = connection.execute("SELECT " + ",".join(ROW_FIELDS) + " FROM universities WHERE moe_code=?",
                                 (package["moeCode"],)).fetchone()
        dataset = connection.execute("SELECT dataset_id,source_sha256 FROM datasets ORDER BY source_as_of DESC,retrieved_at DESC,rowid DESC LIMIT 1").fetchone()
    package["inputVersion"] = expected_input_version(dataset["dataset_id"], dataset["source_sha256"], dict(row))
    package["packageId"] = expected_package_id(package["moeCode"], package["taskId"], package["inputVersion"])
    package["packageSha256"] = expected_package_sha256(package)
    review = {
        "taskId": package["taskId"], "moeCode": package["moeCode"], "inputVersion": package["inputVersion"],
        "reviewer": "Independent reviewer", "reviewType": "independent", "decision": "accepted",
        "reviewedAt": "2026-09-27T12:00:00+08:00",
        "claimDecisions": [{"scopeId": "scope-admission-2027", "field": "application_open",
                            "decision": "accepted", "evidenceIds": ["ev-cycle"], "reason": "Official notice"}],
        "recommendedStatus": package["recommendedStatus"], "cycle": "2027", "unresolved": [],
    }
    return package, review


def make_backup(path: Path):
    base = path.stem + "-pre-import"
    index = 1
    backup = path.parent / f"{base}-{index}.sqlite3"
    while backup.exists() or Path(str(backup) + ".manifest.json").exists():
        index += 1
        backup = path.parent / f"{base}-{index}.sqlite3"
    report = create_backup(path, backup)
    return backup, report["backupSha256"]


class ImportPackageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.db = self.root / "discovery.sqlite3"
        init_db(self.db)

    def tearDown(self):
        self.temp.cleanup()

    def test_imports_transactionally_and_reimport_is_noop(self):
        package, review = package_and_review(self.db)
        backup, backup_hash = make_backup(self.db)
        result = import_package(self.db, package, review, backup_reference=backup, backup_sha256=backup_hash)
        self.assertEqual("imported", result["status"])
        with closing(connect(self.db)) as connection:
            self.assertEqual(1, connection.execute("SELECT count(*) FROM research_packages").fetchone()[0])
            self.assertEqual(2, connection.execute("SELECT count(*) FROM claims").fetchone()[0])
            self.assertEqual(1, connection.execute("SELECT count(*) FROM review_decisions").fetchone()[0])
            self.assertEqual(1, connection.execute("SELECT count(*) FROM import_events").fetchone()[0])
            self.assertEqual("", connection.execute("SELECT admissions_url FROM universities WHERE moe_code=?", (package["moeCode"],)).fetchone()[0])
        repeated = import_package(self.db, package, review, backup_reference=backup, backup_sha256=backup_hash)
        self.assertEqual("already_imported", repeated["status"])
        self.assertEqual(result["importEventId"], repeated["importEventId"])

    def test_explicit_human_patch_updates_only_approved_fields_and_logs_event(self):
        package, review = package_and_review(self.db)
        review["reviewType"] = "human"
        review["reviewer"] = "Human reviewer"
        backup, backup_hash = make_backup(self.db)
        result = import_package(
            self.db, package, review, backup_reference=backup, backup_sha256=backup_hash,
            summary_patch={"admissions_url": "https://university.example.cn/admission", "verification_status": "source_found"},
            patch_approval={"reviewer": "Human reviewer", "approvedAt": review["reviewedAt"],
                            "reason": "Official admissions source confirmed", "evidenceIds": ["ev-cycle"],
                            "packageSha256": package["packageSha256"],
                            "approvedFields": {"admissions_url": "https://university.example.cn/admission", "verification_status": "source_found"}},
        )
        self.assertEqual("imported", result["status"])
        with closing(connect(self.db)) as connection:
            row = connection.execute("SELECT admissions_url,verification_status,official_homepage FROM universities WHERE moe_code=?",
                                     (package["moeCode"],)).fetchone()
            self.assertEqual(("https://university.example.cn/admission", "source_found", ""), tuple(row))
            self.assertEqual(1, connection.execute("SELECT count(*) FROM review_events").fetchone()[0])
            patch = json.loads(connection.execute("SELECT applied_patch_json FROM import_events").fetchone()[0])
            self.assertEqual("Human reviewer", patch["approval"]["reviewer"])

    def test_patch_approval_rejects_other_package_or_different_approved_values(self):
        package, review = package_and_review(self.db)
        review["reviewType"] = "human"
        review["reviewer"] = "Human reviewer"
        backup, backup_hash = make_backup(self.db)
        patch = {"admissions_url": "https://university.example.cn/admission"}
        approval = {"reviewer": "Human reviewer", "approvedAt": review["reviewedAt"],
                    "reason": "Source is an official international admissions page", "evidenceIds": ["ev-cycle"],
                    "packageSha256": "0" * 64, "approvedFields": patch}
        with self.assertRaisesRegex(ImportRejected, "package hash and exact field values"):
            import_package(self.db, package, review, backup_reference=backup, backup_sha256=backup_hash,
                           summary_patch=patch, patch_approval=approval)
        approval["packageSha256"] = package["packageSha256"]
        approval["approvedFields"] = {"admissions_url": "https://other.example.cn/"}
        with self.assertRaisesRegex(ImportRejected, "package hash and exact field values"):
            import_package(self.db, package, review, backup_reference=backup, backup_sha256=backup_hash,
                           summary_patch=patch, patch_approval=approval)
        with closing(connect(self.db)) as connection:
            self.assertEqual(0, connection.execute("SELECT count(*) FROM research_packages").fetchone()[0])

    def test_omitted_fields_never_clear_existing_summary_urls(self):
        with closing(connect(self.db)) as connection:
            with connection:
                connection.execute(
                    "UPDATE universities SET official_homepage=?,admissions_url=? WHERE moe_code=?",
                    ("https://existing.example.cn/", "https://existing.example.cn/apply", "4162010001"),
                )
        package, review = package_and_review(self.db)
        backup, backup_hash = make_backup(self.db)
        import_package(self.db, package, review, backup_reference=backup, backup_sha256=backup_hash)
        with closing(connect(self.db)) as connection:
            row = connection.execute("SELECT official_homepage,admissions_url FROM universities WHERE moe_code='4162010001'").fetchone()
            self.assertEqual(("https://existing.example.cn/", "https://existing.example.cn/apply"), tuple(row))

    def test_stale_input_is_rejected_without_any_import_rows(self):
        package, review = package_and_review(self.db)
        backup, backup_hash = make_backup(self.db)
        with closing(connect(self.db)) as connection:
            with connection:
                connection.execute("UPDATE universities SET notes='changed after research' WHERE moe_code=?", (package["moeCode"],))
        before = None
        with closing(connect(self.db)) as connection:
            before = _db_hash(connection)
        with self.assertRaisesRegex(ImportRejected, "stale"):
            import_package(self.db, package, review, backup_reference=backup, backup_sha256=backup_hash)
        with closing(connect(self.db)) as connection:
            self.assertEqual(before, _db_hash(connection))
            self.assertEqual(0, connection.execute("SELECT count(*) FROM research_packages").fetchone()[0])

    def test_wrong_backup_and_unapproved_clearing_are_rejected(self):
        package, review = package_and_review(self.db)
        backup, backup_hash = make_backup(self.db)
        with self.assertRaisesRegex(ImportRejected, "digest"):
            import_package(self.db, package, review, backup_reference=backup, backup_sha256="0" * 64)
        with self.assertRaisesRegex(ImportRejected, "human review"):
            import_package(self.db, package, review, backup_reference=backup, backup_sha256=backup_hash,
                           summary_patch={"admissions_url": ""},
                           patch_approval={"reviewer": review["reviewer"], "approvedAt": review["reviewedAt"],
                                           "reason": "clear", "evidenceIds": ["ev-cycle"],
                                           "packageSha256": package["packageSha256"], "approvedFields": {"admissions_url": ""}})
        with closing(connect(self.db)) as connection:
            self.assertEqual(0, connection.execute("SELECT count(*) FROM research_packages").fetchone()[0])

    def test_backup_file_substitution_is_detected_even_with_same_logical_contents(self):
        package, review = package_and_review(self.db)
        backup, backup_hash = make_backup(self.db)
        alternate = self.root / "alternate.sqlite3"
        restore_and_verify(backup, alternate, expected_backup_sha256=backup_hash)
        with closing(sqlite3.connect(alternate)) as connection:
            with connection:
                connection.execute("PRAGMA user_version=9")
                connection.execute("PRAGMA user_version=0")
        self.assertNotEqual(backup_hash, hashlib.sha256(alternate.read_bytes()).hexdigest())
        shutil.copyfile(alternate, backup)
        with self.assertRaisesRegex(ImportRejected, "digest"):
            import_package(self.db, package, review, backup_reference=backup, backup_sha256=backup_hash)

    def test_package_hash_conflict_and_injected_failure_roll_back(self):
        package, review = package_and_review(self.db)
        backup, backup_hash = make_backup(self.db)
        result = import_package(self.db, package, review, backup_reference=backup, backup_sha256=backup_hash)
        changed = copy.deepcopy(package)
        changed["nextAction"] = "different content"
        changed["packageSha256"] = expected_package_sha256(changed)
        with self.assertRaisesRegex(ImportRejected, "different package hash"):
            import_package(self.db, changed, review, backup_reference=backup, backup_sha256=backup_hash)
        self.assertEqual("imported", result["status"])

        changed_db = self.root / "replay-stale.sqlite3"
        init_db(changed_db)
        changed_package, changed_review = package_and_review(changed_db)
        changed_backup, changed_hash = make_backup(changed_db)
        import_package(changed_db, changed_package, changed_review,
                       backup_reference=changed_backup, backup_sha256=changed_hash)
        with closing(connect(changed_db)) as connection:
            with connection:
                connection.execute("UPDATE universities SET notes='later external change' WHERE moe_code=?",
                                   (changed_package["moeCode"],))
        with self.assertRaisesRegex(ImportRejected, "stale"):
            import_package(changed_db, changed_package, changed_review,
                           backup_reference=changed_backup, backup_sha256=changed_hash)

        fresh_db = self.root / "rollback.sqlite3"
        init_db(fresh_db)
        fresh_package, fresh_review = package_and_review(fresh_db)
        with closing(connect(fresh_db)) as connection:
            connection.execute("CREATE TRIGGER fail_import BEFORE INSERT ON import_events BEGIN SELECT RAISE(ABORT,'injected'); END")
        fresh_backup, fresh_hash = make_backup(fresh_db)
        before = None
        with closing(connect(fresh_db)) as connection:
            before = _db_hash(connection)
        with self.assertRaises(sqlite3.IntegrityError):
            import_package(fresh_db, fresh_package, fresh_review, backup_reference=fresh_backup, backup_sha256=fresh_hash)
        with closing(connect(fresh_db)) as connection:
            self.assertEqual(before, _db_hash(connection))
            self.assertEqual(0, connection.execute("SELECT count(*) FROM research_packages").fetchone()[0])

    def test_same_content_hash_with_new_capture_metadata_keeps_both_observations(self):
        package, review = package_and_review(self.db)
        backup, backup_hash = make_backup(self.db)
        import_package(self.db, package, review, backup_reference=backup, backup_sha256=backup_hash)

        later = copy.deepcopy(package)
        later["taskId"] = "R-4162010001-later-capture"
        later["sources"][1]["title"] = "International admissions notice, rechecked"
        later["sources"][1]["fetchedAt"] = "2026-09-27T11:00:00+08:00"
        later["packageId"] = expected_package_id(later["moeCode"], later["taskId"], later["inputVersion"])
        later["packageSha256"] = expected_package_sha256(later)
        later_review = copy.deepcopy(review)
        later_review["taskId"] = later["taskId"]
        later_review["reviewedAt"] = "2026-09-27T13:00:00+08:00"
        newer_backup, newer_hash = make_backup(self.db)
        import_package(self.db, later, later_review, backup_reference=newer_backup, backup_sha256=newer_hash)

        with closing(connect(self.db)) as connection:
            observations = connection.execute(
                "SELECT title,fetched_at FROM source_versions WHERE sha256=? ORDER BY fetched_at", ("2" * 64,)
            ).fetchall()
            self.assertEqual(2, len(observations))
            self.assertEqual("2026-09-27T11:00:00+08:00", observations[1]["fetched_at"])
            self.assertEqual("International admissions notice, rechecked", observations[1]["title"])


if __name__ == "__main__":
    unittest.main()
