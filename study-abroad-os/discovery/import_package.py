"""Transactional, explicitly targeted importer for reviewed discovery packages."""

from __future__ import annotations

import hashlib
import json
import os
import sqlite3
import tempfile
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from discovery.backup_restore import restore_and_verify
from discovery.migrate_evidence import connect
from discovery.package_validator import (
    PackageValidationError,
    canonical_json,
    expected_input_version,
    validate_package,
)


SUMMARY_FIELDS = {"official_homepage", "admissions_url", "verification_status", "review_note"}
STATUS_VALUES = {
    "not_checked", "source_found", "needs_review", "verified_admissions",
    "not_verified", "no_current_admissions",
}
ROW_FIELDS = (
    "moe_code", "name_zh", "name_en", "managing_authority", "region", "level", "notes",
    "official_homepage", "admissions_url", "verification_status", "review_note", "reviewed_at", "source_as_of",
)


class ImportRejected(ValueError):
    """A package failed a precondition; its transaction has been rolled back."""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _sha(text: bytes) -> str:
    return hashlib.sha256(text).hexdigest()


def _file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _db_hash(connection: sqlite3.Connection) -> str:
    schema = [tuple(row) for row in connection.execute(
        "SELECT type,name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' AND name!='import_events' ORDER BY type,name"
    ).fetchall()]
    data: list[tuple[str, list[tuple[Any, ...]]]] = []
    for kind, name, _ in schema:
        if kind != "table":
            continue
        escaped = name.replace('"', '""')
        rows = connection.execute(f'SELECT * FROM "{escaped}" ORDER BY rowid').fetchall()
        data.append((name, [tuple(row) for row in rows]))
    return _sha(repr((schema, data)).encode("utf-8"))


def _source_id(url: str) -> str:
    return "src:" + _sha(url.encode("utf-8"))


def _source_version_id(source: dict[str, Any]) -> str:
    observation = {key: value for key, value in source.items() if key not in {"id", "ownershipEvidenceIds"}}
    return "sv:" + _sha(canonical_json(observation))


def _stable_id(*parts: str) -> str:
    return _sha("\n".join(parts).encode("utf-8"))


def _latest_snapshot(connection: sqlite3.Connection, moe_code: str) -> tuple[str, str, dict[str, Any]]:
    dataset = connection.execute(
        "SELECT dataset_id,source_sha256 FROM datasets ORDER BY source_as_of DESC,retrieved_at DESC,rowid DESC LIMIT 1"
    ).fetchone()
    if dataset is None:
        raise ImportRejected("No MOE dataset snapshot is available")
    row = connection.execute(
        "SELECT " + ",".join(ROW_FIELDS) + " FROM universities WHERE moe_code=?", (moe_code,)
    ).fetchone()
    if row is None:
        raise ImportRejected("MOE code is not present in the target register")
    return dataset["dataset_id"], dataset["source_sha256"], dict(row)


def _assert_replay_fresh(connection: sqlite3.Connection, package_id: str, package_row: sqlite3.Row) -> None:
    dataset_id, source_hash, current_row = _latest_snapshot(connection, package_row["moe_code"])
    if dataset_id != package_row["source_dataset_id"] or source_hash != package_row["dataset_source_sha256"]:
        raise ImportRejected("Package input is stale because the MOE dataset snapshot has changed")
    try:
        expected_row = dict(json.loads(package_row["input_row_snapshot_json"]))
        event = connection.execute(
            "SELECT applied_patch_json FROM import_events WHERE package_id=? AND package_sha256=?",
            (package_id, package_row["package_sha256"]),
        ).fetchone()
        applied = json.loads(event["applied_patch_json"])
        for column, value in applied.get("fields", {}).items():
            expected_row[column] = value
        if applied.get("resultingReviewedAt") is not None:
            expected_row["reviewed_at"] = applied["resultingReviewedAt"]
    except (TypeError, KeyError, json.JSONDecodeError) as exc:
        raise ImportRejected("Stored package input snapshot or applied patch is invalid") from exc
    if current_row != expected_row:
        raise ImportRejected("Package input is stale because the MOE row changed after import")


def _validate_backup(connection: sqlite3.Connection, db_path: Path, backup_path: Path, backup_sha256: str) -> None:
    if not backup_path.is_file():
        raise ImportRejected("Verified backup file is missing")
    manifest_path = Path(str(backup_path) + ".manifest.json")
    if not manifest_path.is_file():
        raise ImportRejected("Verified backup manifest is missing")
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ImportRejected("Backup manifest cannot be read") from exc
    if (manifest.get("backupSha256") != backup_sha256
            or manifest.get("sourceSnapshotSha256") != backup_sha256
            or manifest.get("backupPath") is None
            or Path(manifest["backupPath"]).resolve() != backup_path
            or _file_sha256(backup_path) != backup_sha256):
        raise ImportRejected("Backup digest does not match its manifest")
    if Path(manifest.get("sourcePath", "")).resolve() != db_path:
        raise ImportRejected("Backup was not created from this database path")

    with tempfile.TemporaryDirectory(prefix="study-abroad-restore-check-") as temp_dir:
        restored_path = Path(temp_dir) / "verified.sqlite3"
        try:
            restore_report = restore_and_verify(backup_path, restored_path, expected_backup_sha256=backup_sha256)
        except (OSError, sqlite3.Error, ValueError) as exc:
            raise ImportRejected("Backup restore verification failed") from exc
        if manifest.get("tableRowCounts") != restore_report["tableRowCounts"]:
            raise ImportRejected("Backup manifest row counts do not match the restored database")
        with closing(connect(restored_path)) as restored:
            if _db_hash(connection) != _db_hash(restored):
                raise ImportRejected("Backup does not match the current target database snapshot")


def _validate_summary_patch(
    package: dict[str, Any],
    review: dict[str, Any],
    patch: dict[str, Any],
    approval: dict[str, Any] | None,
) -> dict[str, Any]:
    if not isinstance(patch, dict) or patch.keys() - SUMMARY_FIELDS:
        raise ImportRejected("Summary patch contains unsupported fields")
    if not patch:
        if approval not in (None, {}):
            raise ImportRejected("Patch approval was supplied without a summary patch")
        return {"fields": {}, "approval": None}
    approval_keys = {"reviewer", "approvedAt", "reason", "evidenceIds", "packageSha256", "approvedFields"}
    if not isinstance(approval, dict) or set(approval) != approval_keys:
        raise ImportRejected("A non-empty summary patch requires explicit approval metadata")
    if review.get("decision") != "accepted" or review.get("reviewType") != "human":
        raise ImportRejected("Summary patch requires an accepted human review")
    if approval["reviewer"] != review.get("reviewer"):
        raise ImportRejected("Patch approver must match the accepted human reviewer")
    if approval["packageSha256"] != package["packageSha256"] or approval["approvedFields"] != patch:
        raise ImportRejected("Patch approval must bind to this package hash and exact field values")
    if not isinstance(approval["approvedAt"], str):
        raise ImportRejected("Patch approval timestamp must include a timezone")
    try:
        approved_at = datetime.fromisoformat(approval["approvedAt"].replace("Z", "+00:00"))
        reviewed_at = datetime.fromisoformat(review["reviewedAt"].replace("Z", "+00:00"))
        if approved_at.tzinfo is None or approved_at.utcoffset() is None:
            raise ValueError
        if reviewed_at.tzinfo is None or reviewed_at.utcoffset() is None or approved_at < reviewed_at:
            raise ValueError
    except ValueError as exc:
        raise ImportRejected("Patch approval timestamp must include a timezone") from exc
    if not isinstance(approval["reason"], str) or not approval["reason"].strip():
        raise ImportRejected("Patch approval requires a reason")
    approved_evidence = set()
    for decision in review.get("claimDecisions", []):
        if isinstance(decision, dict) and decision.get("decision") == "accepted":
            approved_evidence.update(decision.get("evidenceIds", []))
    evidence_ids = approval["evidenceIds"]
    if not isinstance(evidence_ids, list) or not evidence_ids or not set(evidence_ids) <= approved_evidence:
        raise ImportRejected("Patch approval evidence must be cited by accepted human claim decisions")
    known_evidence = {item["id"] for item in package["evidence"]}
    if not set(evidence_ids) <= known_evidence:
        raise ImportRejected("Patch approval references evidence outside the package")

    for field, value in patch.items():
        if not isinstance(value, str):
            raise ImportRejected(f"Summary patch {field} must be a string")
        if value == "" and (review.get("reviewType") != "human" or not approval["reason"].strip()):
            raise ImportRejected(f"Clearing {field} requires explicit human approval and a reason")
    if "verification_status" in patch:
        if patch["verification_status"] not in STATUS_VALUES:
            raise ImportRejected("Summary verification_status is invalid")
        if patch["verification_status"] != package["recommendedStatus"]:
            raise ImportRejected("Summary status must match the reviewed package recommendation")
        if patch["verification_status"] in {"verified_admissions", "no_current_admissions"} and review.get("reviewType") != "human":
            raise ImportRejected("Publishing a conclusive admissions status requires human review")
    scope_by_id = {item["id"]: item for item in package["scopes"]}
    accepted_claim_evidence = {
        (decision["scopeId"], decision["field"]): set(decision["evidenceIds"])
        for decision in review["claimDecisions"]
        if decision["decision"] == "accepted"
    }
    for field in ("official_homepage", "admissions_url"):
        if field not in patch or patch[field] == "":
            continue
        package_url = package.get("officialHomepage", {}).get("url") if field == "official_homepage" and package.get("officialHomepage") else None
        matching_sources = [
            source for source in package["sources"]
            if source["officiality"] == "confirmed" and patch[field] in {source["url"], source["finalUrl"]}
        ]
        if field == "official_homepage" and patch[field] != package_url:
            raise ImportRejected("official_homepage patch must match the package's ownership-verified homepage")
        if not matching_sources:
            raise ImportRejected(f"{field} must match a confirmed official source URL")
        if field == "admissions_url":
            admission_evidence = {
                item["id"] for item in package["evidence"]
                if any(item["sourceId"] == source["id"] for source in matching_sources)
            }
            cited = any(
                claim["state"] == "supported"
                and scope_by_id[claim["scopeId"]]["kind"] == "admission"
                and (claim["scopeId"], claim["field"]) in accepted_claim_evidence
                and set(claim["evidenceIds"]) & admission_evidence
                and set(claim["evidenceIds"]) <= accepted_claim_evidence[(claim["scopeId"], claim["field"])]
                and set(claim["evidenceIds"]) <= set(evidence_ids)
                for claim in package["claims"]
            )
            if not cited:
                raise ImportRejected("admissions_url requires an accepted supported admission claim cited from that source")
        else:
            homepage_evidence = set(package["officialHomepage"]["ownershipEvidenceIds"])
            ownership_reviewed = any(
                claim["field"] == "official_homepage"
                and claim["state"] == "supported"
                and scope_by_id[claim["scopeId"]]["kind"] == "institution"
                and (claim["scopeId"], claim["field"]) in accepted_claim_evidence
                and set(claim["evidenceIds"]) & homepage_evidence
                and set(claim["evidenceIds"]) <= accepted_claim_evidence[(claim["scopeId"], claim["field"])]
                and set(claim["evidenceIds"]) <= set(evidence_ids)
                for claim in package["claims"]
            )
            if not ownership_reviewed:
                raise ImportRejected("official_homepage requires a reviewed supported institution-ownership claim")
    if "verification_status" in patch:
        status = patch["verification_status"]
        relevant = []
        for claim in package["claims"]:
            scope = scope_by_id[claim["scopeId"]]
            if scope["kind"] != "admission" or (claim["scopeId"], claim["field"]) not in accepted_claim_evidence:
                continue
            if status == "verified_admissions" and claim["field"] == "foreign_applicant_eligibility" and claim["state"] == "supported" and claim["value"] in {"eligible", "admitted", "accepting"}:
                relevant.append(claim)
            elif status == "no_current_admissions" and claim["field"] == "foreign_applicant_eligibility" and claim["state"] == "supported" and claim["value"] in {"not_admitted", "not_accepting"}:
                relevant.append(claim)
            elif status in {"source_found", "needs_review"} and claim["state"] in {"supported", "conflicting"}:
                relevant.append(claim)
        if status != "not_verified" and not any(set(claim["evidenceIds"]) <= set(evidence_ids) for claim in relevant):
            raise ImportRejected("verification_status approval evidence must support the reviewed admission status")
    return {"fields": {key: patch[key] for key in sorted(patch)}, "approval": approval}


def _check_claim_approval(package: dict[str, Any], review: dict[str, Any]) -> None:
    if review.get("decision") != "accepted" or review.get("reviewType") not in {"independent", "human"}:
        raise ImportRejected("An accepted independent or human review is required")
    if package["recommendedStatus"] == "not_checked":
        raise ImportRejected("A package cannot be imported with not_checked status")
    if package["recommendedStatus"] == "verified_admissions":
        if review.get("reviewType") != "human":
            raise ImportRejected("verified_admissions requires human review")
        accepted = {
            (decision["scopeId"], decision["field"]): set(decision["evidenceIds"])
            for decision in review["claimDecisions"] if decision["decision"] == "accepted"
        }
        has_positive_admission = any(
            claim.get("field") == "foreign_applicant_eligibility"
            and claim.get("state") == "supported"
            and claim.get("value") in {"eligible", "admitted", "accepting"}
            and (scope := next((s for s in package["scopes"] if s["id"] == claim["scopeId"]), None))
            and scope.get("kind") == "admission"
            and scope.get("cycle")
            and scope.get("degreeLevel", "").casefold() in {"bachelor", "undergraduate", "本科"}
            and (claim["scopeId"], claim["field"]) in accepted
            and set(claim["evidenceIds"]) <= accepted[(claim["scopeId"], claim["field"])]
            for claim in package["claims"]
        )
        if not has_positive_admission:
            raise ImportRejected("verified_admissions requires a supported named-cycle international bachelor claim")


def _insert_package(connection: sqlite3.Connection, package: dict[str, Any], review: dict[str, Any], patch: dict[str, Any], imported_at: str) -> None:
    package_id = package["packageId"]
    package_hash = package["packageSha256"]
    source_ids: dict[str, str] = {}
    version_ids: dict[str, str] = {}
    for source in package["sources"]:
        url = source["url"]
        source_id = _source_id(url)
        source_ids[source["id"]] = source_id
        connection.execute(
            "INSERT INTO source_records(source_id,canonical_url,publisher,officiality,first_seen_at) VALUES(?,?,?,?,?) "
            "ON CONFLICT(canonical_url) DO NOTHING",
            (source_id, url, source["publisher"], source["officiality"], source["fetchedAt"]),
        )
        stored = connection.execute("SELECT source_id FROM source_records WHERE canonical_url=?", (url,)).fetchone()
        if stored["source_id"] != source_id:
            raise ImportRejected("Canonical source URL resolves to an inconsistent source identity")
        version_id = _source_version_id(source)
        version_ids[source["id"]] = version_id
        connection.execute(
            "INSERT OR IGNORE INTO source_versions(source_version_id,source_id,final_url,title,published_at,fetched_at,"
            "http_status,retrieval_method,capture_path,sha256,error) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            (version_id, source_id, source["finalUrl"], source["title"], source["publishedAt"], source["fetchedAt"],
             source["httpStatus"], source["retrievalMethod"], source["capturePath"], source["sha256"], source["error"]),
        )
        stored_version = connection.execute(
            "SELECT source_id,final_url,title,published_at,fetched_at,http_status,retrieval_method,capture_path,sha256,error "
            "FROM source_versions WHERE source_version_id=?", (version_id,)
        ).fetchone()
        expected_version = (source_id, source["finalUrl"], source["title"], source["publishedAt"], source["fetchedAt"],
                            source["httpStatus"], source["retrievalMethod"], source["capturePath"], source["sha256"], source["error"])
        if stored_version is None or tuple(stored_version) != expected_version:
            raise ImportRejected("Source-version identity conflict")

    connection.execute(
        "INSERT INTO research_packages(package_id,moe_code,schema_version,input_version,dataset_source_sha256,run_id,"
        "as_of,run_state,created_at,source_dataset_id,input_row_snapshot_json,package_sha256,contract_payload) "
        "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (package_id, package["moeCode"], package["schemaVersion"], package["inputVersion"],
         package["_datasetSourceSha256"], package["taskId"], package["asOf"], package["runState"],
         imported_at, package["_datasetId"], canonical_json(package["_inputRowSnapshot"]).decode("utf-8"),
         package_hash, canonical_json({k: v for k, v in package.items() if not k.startswith("_")}).decode("utf-8")),
    )

    for scope in package["scopes"]:
        connection.execute(
            "INSERT INTO research_scopes(package_id,scope_id,kind,label,cycle,degree_level,applicant_channel,program_scope) "
            "VALUES(?,?,?,?,?,?,?,?)",
            (package_id, scope["id"], scope["kind"], scope["label"], scope["cycle"], scope["degreeLevel"],
             scope["applicantChannel"], scope["programScope"]),
        )
    evidence_versions: dict[str, str] = {}
    for item in package["evidence"]:
        evidence_versions[item["id"]] = version_ids[item["sourceId"]]
        connection.execute(
            "INSERT INTO evidence(package_id,evidence_id,source_version_id,original_excerpt,locator,language) VALUES(?,?,?,?,?,?)",
            (package_id, item["id"], evidence_versions[item["id"]], item["originalExcerpt"], item["locator"], item["language"]),
        )
    for source in package["sources"]:
        source_id = source_ids[source["id"]]
        for evidence_id in source["ownershipEvidenceIds"]:
            connection.execute(
                "INSERT INTO source_ownership_evidence(source_id,package_id,evidence_id) VALUES(?,?,?)",
                (source_id, package_id, evidence_id),
            )
    for i, item in enumerate(package["searchLog"]):
        matching_source = next((s for s in package["sources"] if item.get("url") in {s["url"], s["finalUrl"]}), None)
        connection.execute(
            "INSERT INTO research_search_events(search_event_id,package_id,query_text,queried_at,target_domain,action,result,source_id) "
            "VALUES(?,?,?,?,?,?,?,?)",
            (_stable_id(package_id, "search", str(i), canonical_json(item).decode("utf-8")), package_id,
             item["query"], item.get("fetchedAt") or imported_at, item.get("targetDomain"), item["action"],
             item["result"], source_ids[matching_source["id"]] if matching_source else None),
        )

    claim_ids: dict[tuple[str, str], str] = {}
    for claim in package["claims"]:
        claim_id = _stable_id(package_id, claim["scopeId"], claim["field"])
        claim_ids[(claim["scopeId"], claim["field"])] = claim_id
        value_json = None if claim["value"] is None else canonical_json(claim["value"]).decode("utf-8")
        connection.execute(
            "INSERT INTO claims(claim_id,package_id,scope_id,field,value_json,unit,state,notes,created_at,updated_at) "
            "VALUES(?,?,?,?,?,?,?,?,?,?)",
            (claim_id, package_id, claim["scopeId"], claim["field"], value_json, claim["unit"], claim["state"],
             claim["notes"], imported_at, imported_at),
        )
        for evidence_id in claim["evidenceIds"]:
            connection.execute("INSERT INTO claim_evidence(claim_id,package_id,evidence_id) VALUES(?,?,?)",
                               (claim_id, package_id, evidence_id))

    review_id = _stable_id(package_id, package_hash, canonical_json(review).decode("utf-8"))
    review_evidence = sorted({
        evidence_id
        for decision in review["claimDecisions"]
        for evidence_id in decision["evidenceIds"]
    })
    connection.execute(
        "INSERT INTO review_decisions(review_decision_id,package_id,package_sha256,reviewer,review_type,decision,reviewed_at,"
        "cycle,claim_decisions_json,evidence_references_json,unresolved_json) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        (review_id, package_id, package_hash, review["reviewer"], review["reviewType"], review["decision"],
         review["reviewedAt"], review["cycle"], canonical_json(review["claimDecisions"]).decode("utf-8"),
         canonical_json(review_evidence).decode("utf-8"), canonical_json(review["unresolved"]).decode("utf-8")),
    )

    patch_fields = patch["fields"]
    if patch_fields:
        existing = connection.execute(
            "SELECT verification_status,official_homepage,admissions_url,review_note FROM universities WHERE moe_code=?",
            (package["moeCode"],),
        ).fetchone()
        changes = {key: value for key, value in patch_fields.items() if existing[key] != value}
        if changes:
            columns = ",".join(f'"{name}"=?' for name in changes)
            values = list(changes.values())
            if "verification_status" in changes:
                columns += ", reviewed_at=?"
                values.append(review["reviewedAt"])
                previous = existing["verification_status"]
                connection.execute(
                    "INSERT INTO review_events(moe_code,previous_status,next_status,note,changed_at) VALUES(?,?,?,?,?)",
                    (package["moeCode"], previous, changes["verification_status"],
                     f"Approved package {package['packageId']} by {review['reviewer']}", review["reviewedAt"]),
                )
            values.append(package["moeCode"])
            connection.execute(f"UPDATE universities SET {columns} WHERE moe_code=?", values)
    after_hash = _db_hash(connection)
    idempotency_key = package_id + ":" + package_hash
    connection.execute(
        "INSERT INTO import_events(import_event_id,idempotency_key,package_id,package_sha256,review_decision_id,"
        "applied_patch_json,backup_reference,backup_sha256,imported_at,before_hash,after_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        (_stable_id(package_id, package_hash, "import"), idempotency_key, package_id, package_hash, review_id,
        canonical_json(patch).decode("utf-8"), package["_backupReference"], package["_backupSha256"],
         imported_at, package["_beforeHash"], after_hash),
    )


def import_package(
    db_path: str | os.PathLike[str],
    package: dict[str, Any],
    review_decision: dict[str, Any],
    *,
    backup_reference: str | os.PathLike[str],
    backup_sha256: str,
    summary_patch: dict[str, Any] | None = None,
    patch_approval: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Validate, rebase-check, backup-check and atomically import one reviewed package."""
    if not isinstance(package, dict):
        raise ImportRejected("Package must be a JSON object")
    patch = summary_patch or {}
    path = Path(db_path).expanduser().resolve(strict=True)
    backup_path = Path(backup_reference).expanduser().resolve(strict=True)
    imported_at = _now()
    try:
        validate_package(package, review_decision)
    except PackageValidationError as exc:
        raise ImportRejected(str(exc)) from exc
    _check_claim_approval(package, review_decision)
    safe_patch = _validate_summary_patch(package, review_decision, patch, patch_approval)
    safe_patch["resultingReviewedAt"] = (
        review_decision["reviewedAt"] if "verification_status" in safe_patch["fields"] else None
    )

    with closing(connect(path)) as connection:
        try:
            if connection.execute(
                "SELECT 1 FROM sqlite_master WHERE type='table' AND name='research_schema_migrations'"
            ).fetchone() is None:
                raise ImportRejected("Evidence migration must be applied and backed up before importing")
            connection.execute("BEGIN IMMEDIATE")
            previous = connection.execute(
                "SELECT package_sha256,moe_code,source_dataset_id,dataset_source_sha256,input_version,input_row_snapshot_json "
                "FROM research_packages WHERE package_id=?", (package["packageId"],)
            ).fetchone()
            if previous is not None:
                if previous["package_sha256"] != package["packageSha256"]:
                    raise ImportRejected("Package ID already exists with a different package hash")
                event = connection.execute(
                    "SELECT import_event_id FROM import_events WHERE package_id=? AND package_sha256=?",
                    (package["packageId"], package["packageSha256"]),
                ).fetchone()
                if event is None:
                    raise ImportRejected("Package exists without a committed import event")
                _assert_replay_fresh(connection, package["packageId"], previous)
                connection.rollback()
                return {"status": "already_imported", "importEventId": event["import_event_id"]}

            dataset_id, source_hash, row = _latest_snapshot(connection, package["moeCode"])
            input_version = expected_input_version(dataset_id, source_hash, row)
            if input_version != package["inputVersion"]:
                raise ImportRejected("Package input is stale; rebase and review against the latest MOE row")
            if connection.execute(
                "SELECT 1 FROM research_schema_migrations WHERE version=1 AND name='001_research_evidence'"
            ).fetchone() is None:
                raise ImportRejected("The expected evidence schema migration is not recorded")
            _validate_backup(connection, path, backup_path, backup_sha256)
            package = dict(package)
            package["_datasetId"] = dataset_id
            package["_datasetSourceSha256"] = source_hash
            package["_inputRowSnapshot"] = row
            package["_backupReference"] = str(backup_path)
            package["_backupSha256"] = backup_sha256
            package["_beforeHash"] = _db_hash(connection)
            _insert_package(connection, package, review_decision, safe_patch, imported_at)
            connection.commit()
            return {
                "status": "imported",
                "packageId": package["packageId"],
                "importEventId": _stable_id(package["packageId"], package["packageSha256"], "import"),
            }
        except Exception:
            if connection.in_transaction:
                connection.rollback()
            raise
