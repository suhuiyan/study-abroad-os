"""Apply the additive research evidence schema to an explicit SQLite path."""
import argparse
import sqlite3
from contextlib import closing
from pathlib import Path


MIGRATION_VERSION = 1
MIGRATION_NAME = '001_research_evidence'
MIGRATION_PATH = Path(__file__).resolve().parent / 'migrations' / f'{MIGRATION_NAME}.sql'


def connect(db_path):
    """Open a caller-selected database and enforce foreign keys on this connection."""
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys=ON')
    enabled = conn.execute('PRAGMA foreign_keys').fetchone()[0]
    if enabled != 1:
        conn.close()
        raise sqlite3.DatabaseError('SQLite foreign-key enforcement could not be enabled')
    return conn


def migrate(db_path):
    path = Path(db_path).expanduser().resolve()
    if not path.is_file():
        raise FileNotFoundError(f'Database must already exist: {path}')
    sql = MIGRATION_PATH.read_text(encoding='utf-8')
    with closing(connect(path)) as conn:
        existing = conn.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='universities'"
        ).fetchone()
        if existing is None:
            raise sqlite3.DatabaseError('Target is not an initialized discovery database (universities missing)')

        ledger = conn.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='research_schema_migrations'"
        ).fetchone()
        if ledger is not None:
            applied = conn.execute(
                'SELECT name FROM research_schema_migrations WHERE version=?', (MIGRATION_VERSION,)
            ).fetchone()
            if applied is not None:
                if applied['name'] != MIGRATION_NAME:
                    raise sqlite3.DatabaseError('Migration version is recorded with a different name')
                return False

        # executescript commits implicitly before running; explicit transaction SQL keeps
        # DDL and the ledger row atomic, including when a statement fails midway.
        try:
            conn.executescript('BEGIN IMMEDIATE;\n' + sql + '\nCOMMIT;')
        except sqlite3.Error:
            if conn.in_transaction:
                conn.rollback()
            raise
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('db_path', help='Existing SQLite database path; no default is used')
    args = parser.parse_args()
    changed = migrate(args.db_path)
    print('applied' if changed else 'already applied')


if __name__ == '__main__':
    main()
