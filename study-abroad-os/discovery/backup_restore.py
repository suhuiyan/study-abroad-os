"""Create and verify non-overwriting SQLite backups using the online backup API."""

from __future__ import annotations

import hashlib
import json
import os
import sqlite3
import tempfile
from contextlib import closing
from pathlib import Path
from typing import Any


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _connect_readonly(path: Path) -> sqlite3.Connection:
    if not path.is_file():
        raise FileNotFoundError(f"SQLite input does not exist: {path}")
    connection = sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)
    connection.execute("PRAGMA query_only=ON")
    return connection


def _table_counts(connection: sqlite3.Connection) -> dict[str, int]:
    tables = connection.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    counts: dict[str, int] = {}
    for (name,) in tables:
        escaped = name.replace('"', '""')
        counts[name] = connection.execute(f'SELECT count(*) FROM "{escaped}"').fetchone()[0]
    return counts


def _validate_database(path: Path) -> tuple[dict[str, int], list[str]]:
    with closing(_connect_readonly(path)) as connection:
        integrity = [row[0] for row in connection.execute("PRAGMA integrity_check")]
        fk_errors = [repr(tuple(row)) for row in connection.execute("PRAGMA foreign_key_check")]
        if integrity != ["ok"]:
            raise sqlite3.DatabaseError(f"SQLite integrity check failed: {integrity}")
        if fk_errors:
            raise sqlite3.IntegrityError(f"SQLite foreign-key check failed: {fk_errors}")
        return _table_counts(connection), integrity


def _new_staging_path(parent: Path, stem: str) -> Path:
    fd, raw_path = tempfile.mkstemp(prefix=f".{stem}.", suffix=".tmp", dir=parent)
    os.close(fd)
    return Path(raw_path)


def _snapshot(source: Path, staging: Path) -> None:
    with closing(_connect_readonly(source)) as src, closing(sqlite3.connect(staging)) as dst:
        src.backup(dst)
        dst.commit()


def _publish_without_overwrite(staging: Path, destination: Path) -> None:
    # A hard link is an atomic create-if-absent on the same filesystem.
    os.link(staging, destination)
    staging.unlink()


def create_backup(source_path: str | os.PathLike[str], backup_path: str | os.PathLike[str]) -> dict[str, Any]:
    """Create a consistent backup and JSON manifest; neither output may already exist."""
    source = Path(source_path).expanduser().resolve(strict=True)
    destination = Path(backup_path).expanduser().resolve()
    manifest_path = Path(str(destination) + ".manifest.json")
    if not source.is_file():
        raise FileNotFoundError(f"SQLite source must be a file: {source}")
    if source == destination or source == manifest_path:
        raise ValueError("Backup output must differ from its source")
    if destination.exists() or manifest_path.exists():
        raise FileExistsError("Backup or its manifest already exists; refusing to overwrite")
    if not destination.parent.is_dir():
        raise FileNotFoundError(f"Backup directory does not exist: {destination.parent}")

    staging = _new_staging_path(destination.parent, destination.name)
    manifest_staging: Path | None = None
    published_backup = False
    try:
        _snapshot(source, staging)
        counts, _ = _validate_database(staging)
        snapshot_hash = _sha256(staging)
        report = {
            "schemaVersion": 1,
            "sourcePath": str(source),
            "backupPath": str(destination),
            "sourceSnapshotSha256": snapshot_hash,
            "backupSha256": snapshot_hash,
            "tableRowCounts": counts,
        }
        manifest_staging = _new_staging_path(destination.parent, manifest_path.name)
        manifest_staging.write_text(
            json.dumps(report, ensure_ascii=False, sort_keys=True, indent=2) + "\n",
            encoding="utf-8",
        )
        _publish_without_overwrite(staging, destination)
        published_backup = True
        _publish_without_overwrite(manifest_staging, manifest_path)
        return report
    except Exception:
        if published_backup:
            destination.unlink(missing_ok=True)
        raise
    finally:
        staging.unlink(missing_ok=True)
        if manifest_staging is not None:
            manifest_staging.unlink(missing_ok=True)


def restore_and_verify(
    backup_path: str | os.PathLike[str],
    restore_path: str | os.PathLike[str],
    *,
    expected_backup_sha256: str | None = None,
) -> dict[str, Any]:
    """Restore to a new path and verify digest (if supplied), integrity and row counts."""
    backup = Path(backup_path).expanduser().resolve(strict=True)
    destination = Path(restore_path).expanduser().resolve()
    if not backup.is_file():
        raise FileNotFoundError(f"Backup must be a file: {backup}")
    if backup == destination:
        raise ValueError("Restore output must differ from backup")
    if destination.exists():
        raise FileExistsError(f"Restore destination already exists: {destination}")
    if not destination.parent.is_dir():
        raise FileNotFoundError(f"Restore directory does not exist: {destination.parent}")
    backup_hash = _sha256(backup)
    if expected_backup_sha256 is not None and backup_hash != expected_backup_sha256:
        raise ValueError("Backup SHA-256 does not match the expected digest")

    staging = _new_staging_path(destination.parent, destination.name)
    try:
        _snapshot(backup, staging)
        backup_counts, _ = _validate_database(backup)
        restored_counts, _ = _validate_database(staging)
        if restored_counts != backup_counts:
            raise sqlite3.DatabaseError("Restored table row counts do not match backup")
        _publish_without_overwrite(staging, destination)
        return {
            "backupPath": str(backup),
            "restorePath": str(destination),
            "backupSha256": backup_hash,
            "tableRowCounts": restored_counts,
            "integrity": "ok",
        }
    finally:
        staging.unlink(missing_ok=True)
