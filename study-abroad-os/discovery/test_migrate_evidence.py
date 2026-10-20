"""Temporary-database tests for the S5-A additive schema migration."""
import hashlib
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path

from discovery import migrate_evidence


EXPECTED_TABLES = {
    'research_schema_migrations', 'research_packages', 'research_scopes',
    'source_records', 'source_versions', 'source_ownership_evidence', 'evidence',
    'research_search_events', 'claims', 'claim_evidence', 'review_decisions', 'import_events',
}


def initialize_legacy(path):
    conn = sqlite3.connect(path)
    conn.executescript('''
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
        INSERT INTO datasets VALUES ('moe-test','test','https://example.test/moe','2026-01-01','2026-01-01','2026-01-01T00:00:00Z','abc123',1);
        INSERT INTO universities(moe_code,name_zh,name_en,region,level,verification_status)
        VALUES ('0000000001','测试大学','Test University','测试省','本科','not_checked');
        INSERT INTO review_events(moe_code,previous_status,next_status,note)
        VALUES ('0000000001','not_checked','not_checked','preserve me');
    ''')
    conn.commit()
    conn.close()


def legacy_fingerprint(path):
    with closing(sqlite3.connect(path)) as conn:
        schema = conn.execute("SELECT type,name,sql FROM sqlite_master WHERE name IN ('datasets','universities','review_events') ORDER BY type,name").fetchall()
        data = []
        for table in ('datasets', 'universities', 'review_events'):
            data.append((table, conn.execute(f'SELECT * FROM {table} ORDER BY 1').fetchall()))
        return hashlib.sha256(repr((schema, data)).encode()).hexdigest()


class EvidenceMigrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db = Path(self.temp.name) / 'discovery.sqlite3'
        initialize_legacy(self.db)

    def tearDown(self):
        self.temp.cleanup()

    def test_additive_schema_preserves_legacy_schema_and_rows(self):
        before = legacy_fingerprint(self.db)
        self.assertTrue(migrate_evidence.migrate(self.db))
        self.assertEqual(before, legacy_fingerprint(self.db))
        with closing(migrate_evidence.connect(self.db)) as conn:
            tables = {r['name'] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            self.assertTrue(EXPECTED_TABLES <= tables)
            indexes = {r['name'] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='index'")}
            self.assertTrue({
                'idx_research_packages_moe_asof', 'idx_research_scopes_kind_cycle_degree',
                'idx_claims_state', 'idx_source_records_url', 'idx_source_versions_source_hash',
                'idx_review_decisions_decision', 'idx_import_events_package',
            } <= indexes)
            self.assertEqual(1, conn.execute('PRAGMA foreign_keys').fetchone()[0])

    def test_foreign_keys_are_enforced(self):
        migrate_evidence.migrate(self.db)
        with closing(migrate_evidence.connect(self.db)) as conn:
            with self.assertRaises(sqlite3.IntegrityError):
                conn.execute('''INSERT INTO research_packages
                (package_id,moe_code,schema_version,input_version,dataset_source_sha256,run_id,as_of,run_state,created_at,
                 source_dataset_id,input_row_snapshot_json,package_sha256,contract_payload)
                    VALUES ('p','9999999999',1,'i','dataset-hash','r','2026-01-01','done',
                            '2026-01-01T00:00:00Z',NULL,'{}','s','{}')''')

    def test_rerun_is_noop(self):
        self.assertTrue(migrate_evidence.migrate(self.db))
        before = legacy_fingerprint(self.db)
        with closing(migrate_evidence.connect(self.db)) as conn:
            ledger_before = conn.execute('SELECT * FROM research_schema_migrations').fetchall()
        self.assertFalse(migrate_evidence.migrate(self.db))
        self.assertEqual(before, legacy_fingerprint(self.db))
        with closing(migrate_evidence.connect(self.db)) as conn:
            self.assertEqual(ledger_before, conn.execute('SELECT * FROM research_schema_migrations').fetchall())

    def test_failed_migration_rolls_back_every_ddl_statement(self):
        original = migrate_evidence.MIGRATION_PATH.read_text(encoding='utf-8')
        try:
            migrate_evidence.MIGRATION_PATH.write_text(original + '\nTHIS IS NOT VALID SQL;\n', encoding='utf-8')
            with self.assertRaises(sqlite3.OperationalError):
                migrate_evidence.migrate(self.db)
        finally:
            migrate_evidence.MIGRATION_PATH.write_text(original, encoding='utf-8')
        with closing(sqlite3.connect(self.db)) as conn:
            added = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'research_%'").fetchall()
            self.assertEqual([], added)
            self.assertIsNone(conn.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='source_records'").fetchone())

    def test_requires_existing_explicit_database_path(self):
        missing = Path(self.temp.name) / 'missing.sqlite3'
        with self.assertRaises(FileNotFoundError):
            migrate_evidence.migrate(missing)

    def test_import_event_rejects_review_for_different_package_or_hash(self):
        migrate_evidence.migrate(self.db)
        with closing(migrate_evidence.connect(self.db)) as conn:
            for package_id, package_hash in (('p1', 'hash1'), ('p2', 'hash2')):
                conn.execute('''INSERT INTO research_packages
                    (package_id,moe_code,schema_version,input_version,dataset_source_sha256,run_id,as_of,
                     run_state,created_at,source_dataset_id,input_row_snapshot_json,package_sha256,contract_payload)
                    VALUES (?, '0000000001', 1, 'input', 'dataset-hash', 'run', '2026-01-01',
                            'complete', '2026-01-01T00:00:00Z', 'moe-test', '{}', ?, '{}')''',
                    (package_id, package_hash))
                conn.execute('''INSERT INTO review_decisions
                    (review_decision_id,package_id,package_sha256,reviewer,review_type,decision,reviewed_at,
                     cycle,claim_decisions_json,evidence_references_json,unresolved_json)
                    VALUES (?, ?, ?, 'reviewer', 'human', 'accepted', '2026-01-01T00:00:00Z',
                            NULL, '[]', '[]', '[]')''',
                    (f'review-{package_id}', package_id, package_hash))

            with self.assertRaises(sqlite3.IntegrityError):
                conn.execute('''INSERT INTO import_events
                    (import_event_id,idempotency_key,package_id,package_sha256,review_decision_id,
                     applied_patch_json,backup_reference,backup_sha256,imported_at,before_hash,after_hash)
                    VALUES ('event-bad','idem-bad','p1','hash1','review-p2','{}','backup','backup-hash',
                            '2026-01-01T00:00:00Z','before','after')''')


if __name__ == '__main__':
    unittest.main()
