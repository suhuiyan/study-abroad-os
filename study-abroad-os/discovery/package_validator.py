"""Strict validator for Study Abroad OS research package contract v1."""

from __future__ import annotations

import hashlib
import json
import re
from datetime import date, datetime
from typing import Any
from urllib.parse import urlsplit


HEX64 = re.compile(r"^[0-9a-f]{64}$")
MOE_CODE = re.compile(r"^[0-9]{10}$")
_UNSET = object()

TOP_KEYS = {
    "schemaVersion", "packageId", "packageSha256", "taskId", "role", "runState",
    "inputVersion", "moeCode", "nameZh", "asOf", "officialHomepage",
    "recommendedStatus", "sources", "evidence", "scopes", "claims", "searchLog",
    "outputPaths", "checks", "unresolved", "nextAction",
}
SOURCE_KEYS = {
    "id", "url", "finalUrl", "title", "publisher", "officiality",
    "ownershipEvidenceIds", "publishedAt", "fetchedAt", "httpStatus",
    "retrievalMethod", "capturePath", "sha256", "error",
}
EVIDENCE_KEYS = {"id", "sourceId", "originalExcerpt", "locator", "language"}
SCOPE_KEYS = {"id", "kind", "label", "cycle", "degreeLevel", "applicantChannel", "programScope", "evidenceIds"}
CLAIM_KEYS = {"scopeId", "field", "value", "unit", "state", "evidenceIds", "notes"}
SEARCH_KEYS = {"query", "url", "action", "result", "fetchedAt", "targetDomain"}
REVIEW_KEYS = {
    "taskId", "moeCode", "inputVersion", "reviewer", "reviewType", "decision",
    "reviewedAt", "claimDecisions", "recommendedStatus", "cycle", "unresolved",
}
CLAIM_DECISION_KEYS = {"scopeId", "field", "decision", "evidenceIds", "reason"}
UNRESOLVED_KEYS = {"question", "reason", "nextAction"}
CHECK_KEYS = {"command", "result", "limitations"}
ENUMS = {
    "role": {"research", "extraction", "review"},
    "runState": {"complete", "partial", "blocked"},
    "recommendedStatus": {"not_checked", "source_found", "needs_review", "verified_admissions", "not_verified", "no_current_admissions"},
    "officiality": {"confirmed", "unconfirmed"},
    "retrievalMethod": {"html", "pdf_text", "ocr", "browser", "search_snippet"},
    "scope.kind": {"institution", "admission", "program", "scholarship"},
    "claim.state": {"supported", "unknown", "conflicting"},
    "reviewType": {"independent", "self", "human"},
    "reviewDecision": {"accepted", "changes_required", "rejected"},
    "claimDecision": {"accepted", "changes_required", "rejected"},
    "search.action": {"search", "open", "click", "fetch", "ocr"},
}


class PackageValidationError(ValueError):
    """Validation failure containing paths, never submitted values."""

    def __init__(self, errors: list[str]):
        self.errors = tuple(errors)
        super().__init__("; ".join(errors))


def canonical_json(value: Any) -> bytes:
    """Contract canonical JSON: Unicode key order, UTF-8, compact separators."""
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8")


def expected_package_id(moe_code: str, task_id: str, input_version: str) -> str:
    return hashlib.sha256(f"{moe_code}\n{task_id}\n{input_version}".encode("utf-8")).hexdigest()


def expected_package_sha256(package: dict[str, Any]) -> str:
    payload = dict(package)
    payload.pop("packageSha256", None)
    return hashlib.sha256(canonical_json(payload)).hexdigest()


def expected_input_version(dataset_id: str, source_hash: str, row_fields: dict[str, Any]) -> str:
    """Hash the explicit dataset identity/hash and exact researcher input row."""
    return hashlib.sha256(canonical_json({
        "datasetId": dataset_id,
        "sourceHash": source_hash,
        "row": row_fields,
    })).hexdigest()


def _obj(value: Any, path: str, allowed: set[str], required: set[str], errors: list[str]) -> bool:
    if not isinstance(value, dict):
        errors.append(f"{path}: expected object")
        return False
    unknown_count = len(value.keys() - allowed)
    if unknown_count:
        errors.append(f"{path}: contains {unknown_count} unknown propert{'y' if unknown_count == 1 else 'ies'}")
    for key in sorted(required - value.keys()):
        errors.append(f"{path}.{key}: required property missing")
    return True


def _str(value: Any, path: str, errors: list[str], *, nullable: bool = False, nonempty: bool = True) -> bool:
    if value is None and nullable:
        return True
    if not isinstance(value, str) or (nonempty and not value.strip()):
        errors.append(f"{path}: expected {'non-empty ' if nonempty else ''}string" + (" or null" if nullable else ""))
        return False
    return True


def _enum(value: Any, key: str, path: str, errors: list[str]) -> None:
    if not isinstance(value, str) or value not in ENUMS[key]:
        errors.append(f"{path}: invalid {key} enum")


def _url(value: Any, path: str, errors: list[str], *, nullable: bool = False) -> None:
    if value is None and nullable:
        return
    if not isinstance(value, str):
        errors.append(f"{path}: expected HTTPS URL" + (" or null" if nullable else ""))
        return
    try:
        parts = urlsplit(value)
        if parts.scheme != "https" or not parts.hostname or parts.username or parts.password:
            raise ValueError
        _ = parts.port
    except (ValueError, TypeError):
        errors.append(f"{path}: invalid HTTPS URL")


def _timestamp(value: Any, path: str, errors: list[str]) -> None:
    if not isinstance(value, str):
        errors.append(f"{path}: expected ISO timestamp with timezone")
        return
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None or parsed.utcoffset() is None:
            raise ValueError
    except ValueError:
        errors.append(f"{path}: invalid ISO timestamp with timezone")


def _date(value: Any, path: str, errors: list[str], *, nullable: bool = False) -> None:
    if value is None and nullable:
        return
    if not isinstance(value, str):
        errors.append(f"{path}: expected YYYY-MM-DD" + (" or null" if nullable else ""))
        return
    try:
        if date.fromisoformat(value).isoformat() != value:
            raise ValueError
    except ValueError:
        errors.append(f"{path}: invalid YYYY-MM-DD")


def _ids(value: Any, path: str, errors: list[str]) -> list[str]:
    if not isinstance(value, list):
        errors.append(f"{path}: expected array of IDs")
        return []
    out: list[str] = []
    for index, item in enumerate(value):
        if _str(item, f"{path}[{index}]", errors):
            out.append(item)
    if len(out) != len(set(out)):
        errors.append(f"{path}: duplicate ID")
    return out


def _unique(items: Any, path: str, errors: list[str], *, require_ids: bool = True) -> dict[str, dict[str, Any]]:
    if not isinstance(items, list):
        errors.append(f"{path}: expected array")
        return {}
    result: dict[str, dict[str, Any]] = {}
    for index, item in enumerate(items):
        p = f"{path}[{index}]"
        if not isinstance(item, dict):
            errors.append(f"{p}: expected object")
            continue
        ident = item.get("id")
        if not require_ids:
            continue
        if not isinstance(ident, str) or not ident:
            errors.append(f"{p}.id: required non-empty string")
            continue
        if ident in result:
            errors.append(f"{p}.id: duplicate ID")
        else:
            result[ident] = item
    return result


def _no_secret_echo(value: Any, path: str, errors: list[str]) -> None:
    # Errors contain paths only; never stringify offending values.
    return


def validate_package(package: Any, review_decision: Any = None) -> dict[str, Any]:
    """Validate a v1 package, raising PackageValidationError on any loss/ambiguity.

    Returns the original package unchanged on success. Validation is structural;
    it does not establish factual truth or perform network/database operations.
    """
    errors: list[str] = []
    required = TOP_KEYS - {"reviewDecision"}
    if not _obj(package, "$", TOP_KEYS, required, errors):
        raise PackageValidationError(errors)

    if package.get("schemaVersion") != 1 or isinstance(package.get("schemaVersion"), bool):
        errors.append("$.schemaVersion: expected integer 1")
    for field in ("taskId", "nameZh", "nextAction"):
        _str(package.get(field), f"$.{field}", errors)
    for field in ("inputVersion", "packageId", "packageSha256"):
        value = package.get(field)
        if not isinstance(value, str) or not HEX64.fullmatch(value):
            errors.append(f"$.{field}: expected lowercase SHA-256 hex")
    code = package.get("moeCode")
    if not isinstance(code, str) or not MOE_CODE.fullmatch(code):
        errors.append("$.moeCode: expected 10-digit string")
    _date(package.get("asOf"), "$.asOf", errors)
    for field in ("role", "runState", "recommendedStatus"):
        _enum(package.get(field), field, f"$.{field}", errors)
    if package.get("officialHomepage") is not None:
        _obj(package["officialHomepage"], "$.officialHomepage", {"url", "ownershipEvidenceIds"}, {"url", "ownershipEvidenceIds"}, errors)
        if isinstance(package["officialHomepage"], dict):
            _url(package["officialHomepage"].get("url"), "$.officialHomepage.url", errors)
            _ids(package["officialHomepage"].get("ownershipEvidenceIds"), "$.officialHomepage.ownershipEvidenceIds", errors)
    elif "officialHomepage" not in package:
        errors.append("$.officialHomepage: required property missing")

    sources = _unique(package.get("sources"), "$.sources", errors)
    evidence = _unique(package.get("evidence"), "$.evidence", errors)
    scopes = _unique(package.get("scopes"), "$.scopes", errors)
    claims: dict[str, dict[str, Any]] = {}
    if not isinstance(package.get("claims"), list):
        errors.append("$.claims: expected array")
    else:
        seen_claim_keys: set[tuple[Any, Any]] = set()
        for i, item in enumerate(package["claims"]):
            if not isinstance(item, dict):
                errors.append(f"$.claims[{i}]: expected object")
                continue
            key = (item.get("scopeId"), item.get("field"))
            if key in seen_claim_keys:
                errors.append(f"$.claims[{i}]: duplicate claim for scope and field")
            seen_claim_keys.add(key)
            if isinstance(key[0], str) and isinstance(key[1], str):
                claims[f"{key[0]}\n{key[1]}"] = item

    for i, item in enumerate(package.get("sources", []) if isinstance(package.get("sources"), list) else []):
        p = f"$.sources[{i}]"
        if not _obj(item, p, SOURCE_KEYS, SOURCE_KEYS, errors):
            continue
        _url(item.get("url"), p + ".url", errors)
        _url(item.get("finalUrl"), p + ".finalUrl", errors, nullable=True)
        _str(item.get("title"), p + ".title", errors, nullable=True)
        _str(item.get("publisher"), p + ".publisher", errors)
        _enum(item.get("officiality"), "officiality", p + ".officiality", errors)
        _ids(item.get("ownershipEvidenceIds"), p + ".ownershipEvidenceIds", errors)
        _date(item.get("publishedAt"), p + ".publishedAt", errors, nullable=True)
        _timestamp(item.get("fetchedAt"), p + ".fetchedAt", errors)
        status = item.get("httpStatus")
        if status is not None and (not isinstance(status, int) or isinstance(status, bool) or not 100 <= status <= 599):
            errors.append(p + ".httpStatus: expected HTTP status 100..599 or null")
        _enum(item.get("retrievalMethod"), "retrievalMethod", p + ".retrievalMethod", errors)
        _str(item.get("capturePath"), p + ".capturePath", errors, nullable=True)
        sha = item.get("sha256")
        if sha is not None and (not isinstance(sha, str) or not HEX64.fullmatch(sha)):
            errors.append(p + ".sha256: expected lowercase SHA-256 hex or null")
        _str(item.get("error"), p + ".error", errors, nullable=True)

    for i, item in enumerate(package.get("evidence", []) if isinstance(package.get("evidence"), list) else []):
        p = f"$.evidence[{i}]"
        if not _obj(item, p, EVIDENCE_KEYS, EVIDENCE_KEYS, errors):
            continue
        _str(item.get("sourceId"), p + ".sourceId", errors)
        _str(item.get("originalExcerpt"), p + ".originalExcerpt", errors)
        _str(item.get("locator"), p + ".locator", errors)
        _str(item.get("language"), p + ".language", errors)
        if item.get("sourceId") not in sources:
            errors.append(p + ".sourceId: reference not found")

    for i, item in enumerate(package.get("scopes", []) if isinstance(package.get("scopes"), list) else []):
        p = f"$.scopes[{i}]"
        if not _obj(item, p, SCOPE_KEYS, SCOPE_KEYS, errors):
            continue
        _enum(item.get("kind"), "scope.kind", p + ".kind", errors)
        _str(item.get("label"), p + ".label", errors)
        for field in ("cycle", "degreeLevel", "applicantChannel", "programScope"):
            _str(item.get(field), p + "." + field, errors, nullable=True)
        ids = _ids(item.get("evidenceIds"), p + ".evidenceIds", errors)
        for ident in ids:
            if ident not in evidence:
                errors.append(p + ".evidenceIds: reference not found")
        if item.get("kind") in {"program", "scholarship"} and item.get("degreeLevel") is None:
            errors.append(p + ".degreeLevel: program and scholarship scopes require explicit degree level")

    for i, item in enumerate(package.get("claims", []) if isinstance(package.get("claims"), list) else []):
        p = f"$.claims[{i}]"
        if not _obj(item, p, CLAIM_KEYS, CLAIM_KEYS, errors):
            continue
        scope_id = item.get("scopeId")
        scope = scopes.get(scope_id) if isinstance(scope_id, str) else None
        if scope is None:
            errors.append(p + ".scopeId: reference not found")
        _str(item.get("field"), p + ".field", errors)
        _enum(item.get("state"), "claim.state", p + ".state", errors)
        _str(item.get("unit"), p + ".unit", errors, nullable=True)
        _str(item.get("notes"), p + ".notes", errors, nullable=True)
        value = item.get("value", _UNSET)
        if value is _UNSET:
            errors.append(p + ".value: required property missing")
        elif item.get("state") == "unknown" and value is not None:
            errors.append(p + ".value: unknown claim value must be null")
        elif item.get("state") == "supported" and value is None:
            errors.append(p + ".value: supported claim value must not be null")
        elif value is not None and not isinstance(value, str):
            errors.append(p + ".value: expected string or null")
        ids = _ids(item.get("evidenceIds"), p + ".evidenceIds", errors)
        if item.get("state") == "supported" and not ids:
            errors.append(p + ".evidenceIds: supported claim requires evidence")
        for ident in ids:
            ev = evidence.get(ident)
            if ev is None:
                errors.append(p + ".evidenceIds: reference not found")
            elif not ev.get("originalExcerpt") or not ev.get("locator"):
                errors.append(p + ".evidenceIds: evidence requires readable excerpt and locator")
        if item.get("state") == "conflicting":
            if not isinstance(item.get("notes"), str) or not item.get("notes", "").strip() or len(ids) < 2:
                errors.append(p + ": conflicting claim requires notes and at least two evidence IDs")
        if scope is not None:
            for ident in ids:
                ev = evidence.get(ident)
                if ev is not None and ev.get("id") not in scope.get("evidenceIds", []):
                    errors.append(p + ".evidenceIds: evidence is outside claim scope")

    for i, item in enumerate(package.get("sources", []) if isinstance(package.get("sources"), list) else []):
        for ident in item.get("ownershipEvidenceIds", []) if isinstance(item, dict) and isinstance(item.get("ownershipEvidenceIds"), list) else []:
            ev = evidence.get(ident)
            if ev is None:
                errors.append(f"$.sources[{i}].ownershipEvidenceIds: reference not found")
            elif ev.get("sourceId") == item.get("id"):
                errors.append(f"$.sources[{i}].ownershipEvidenceIds: circular ownership evidence")

    for i, item in enumerate(package.get("scopes", []) if isinstance(package.get("scopes"), list) else []):
        if isinstance(item, dict):
            for ident in item.get("evidenceIds", []) if isinstance(item.get("evidenceIds"), list) else []:
                if ident not in evidence:
                    errors.append(f"$.scopes[{i}].evidenceIds: reference not found")

    search = package.get("searchLog")
    if not isinstance(search, list):
        errors.append("$.searchLog: expected array")
    else:
        seen_search_ids: set[str] = set()
        for i, item in enumerate(search):
            p = f"$.searchLog[{i}]"
            if not _obj(item, p, SEARCH_KEYS, {"query", "url", "action", "result"}, errors):
                continue
            _str(item.get("query"), p + ".query", errors, nonempty=False)
            _url(item.get("url"), p + ".url", errors, nullable=True)
            _enum(item.get("action"), "search.action", p + ".action", errors)
            _str(item.get("result"), p + ".result", errors)
            if "fetchedAt" in item:
                _timestamp(item.get("fetchedAt"), p + ".fetchedAt", errors)
            if "targetDomain" in item:
                _str(item.get("targetDomain"), p + ".targetDomain", errors, nullable=True)

    for field in ("outputPaths", "unresolved", "checks"):
        value = package.get(field)
        if not isinstance(value, list):
            errors.append(f"$.{field}: expected array")
    for i, item in enumerate(package.get("unresolved", []) if isinstance(package.get("unresolved"), list) else []):
        p = f"$.unresolved[{i}]"
        if _obj(item, p, UNRESOLVED_KEYS, UNRESOLVED_KEYS, errors):
            for key in UNRESOLVED_KEYS:
                _str(item.get(key), p + "." + key, errors)
    for i, item in enumerate(package.get("checks", []) if isinstance(package.get("checks"), list) else []):
        p = f"$.checks[{i}]"
        if _obj(item, p, CHECK_KEYS, CHECK_KEYS, errors):
            for key in CHECK_KEYS:
                _str(item.get(key), p + "." + key, errors, nonempty=False)

    if review_decision is not None:
        review = review_decision
        if _obj(review, "$review", REVIEW_KEYS, REVIEW_KEYS, errors):
            for field in ("taskId", "moeCode", "inputVersion", "reviewer", "cycle"):
                _str(review.get(field), "$review." + field, errors, nullable=(field == "cycle"))
            if review.get("taskId") != package.get("taskId") or review.get("moeCode") != package.get("moeCode") or review.get("inputVersion") != package.get("inputVersion"):
                errors.append("$review: package binding mismatch")
            _enum(review.get("reviewType"), "reviewType", "$review.reviewType", errors)
            _enum(review.get("decision"), "reviewDecision", "$review.decision", errors)
            _timestamp(review.get("reviewedAt"), "$review.reviewedAt", errors)
            _enum(review.get("recommendedStatus"), "recommendedStatus", "$review.recommendedStatus", errors)
            if review.get("recommendedStatus") != package.get("recommendedStatus"):
                errors.append("$review.recommendedStatus: must match package recommendation")
            decisions = review.get("claimDecisions")
            if not isinstance(decisions, list):
                errors.append("$review.claimDecisions: expected array")
                decisions = []
            for i, decision in enumerate(decisions):
                p = f"$review.claimDecisions[{i}]"
                if _obj(decision, p, CLAIM_DECISION_KEYS, CLAIM_DECISION_KEYS, errors):
                    if decision.get("scopeId") not in scopes:
                        errors.append(p + ".scopeId: reference not found")
                    _str(decision.get("field"), p + ".field", errors)
                    _enum(decision.get("decision"), "claimDecision", p + ".decision", errors)
                    _str(decision.get("reason"), p + ".reason", errors)
                    if not any(decision.get("scopeId") == claim.get("scopeId")
                               and decision.get("field") == claim.get("field") for claim in claims.values()):
                        errors.append(p + ": claim reference not found")
                    for ident in _ids(decision.get("evidenceIds"), p + ".evidenceIds", errors):
                        if ident not in evidence:
                            errors.append(p + ".evidenceIds: reference not found")
            review_unresolved = review.get("unresolved")
            if not isinstance(review_unresolved, list):
                errors.append("$review.unresolved: expected array")
                review_unresolved = []
            for i, unresolved in enumerate(review_unresolved):
                if _obj(unresolved, f"$review.unresolved[{i}]", UNRESOLVED_KEYS, UNRESOLVED_KEYS, errors):
                    for key in UNRESOLVED_KEYS:
                        _str(unresolved.get(key), f"$review.unresolved[{i}].{key}", errors)

    homepage = package.get("officialHomepage")
    if isinstance(homepage, dict):
        for ident in homepage.get("ownershipEvidenceIds", []) if isinstance(homepage.get("ownershipEvidenceIds"), list) else []:
            ev = evidence.get(ident)
            if ev is None:
                errors.append("$.officialHomepage.ownershipEvidenceIds: reference not found")
            elif not isinstance(ev.get("originalExcerpt"), str) or not ev.get("locator"):
                errors.append("$.officialHomepage.ownershipEvidenceIds: ownership evidence requires excerpt and locator")

    if package.get("recommendedStatus") == "no_current_admissions":
        qualifying = False
        for claim in claims.values():
            scope = scopes.get(claim.get("scopeId"))
            excerpt_text = " ".join(evidence.get(eid, {}).get("originalExcerpt", "") for eid in claim.get("evidenceIds", []))
            explicit_negative = any(term in excerpt_text.casefold() for term in (
                "不招收国际本科生", "不招收外国本科生", "不接收国际本科生", "不接收外国本科生",
                "不招收来华留学生本科", "本年度不招收", "not accepting international undergraduate",
                "does not accept international undergraduate", "no international undergraduate intake",
            ))
            if (claim.get("field") == "foreign_applicant_eligibility" and claim.get("state") == "supported"
                    and claim.get("value") in {"not_admitted", "not_accepting"} and explicit_negative
                    and scope and scope.get("kind") == "admission" and scope.get("cycle")
                    and str(scope.get("degreeLevel", "")).casefold() in {"bachelor", "undergraduate", "本科"}
                    and str(scope.get("applicantChannel", "")).casefold() in {"international", "foreign_applicant", "foreign_student", "international_student", "国际学生", "外国申请人"}
                    and claim.get("evidenceIds")):
                if all((evidence.get(eid, {}).get("sourceId") in sources
                        and sources[evidence[eid]["sourceId"]].get("officiality") == "confirmed"
                        and sources[evidence[eid]["sourceId"]].get("retrievalMethod") != "search_snippet"
                        and isinstance(sources[evidence[eid]["sourceId"]].get("httpStatus"), int)
                        and 200 <= sources[evidence[eid]["sourceId"]]["httpStatus"] < 300
                        and sources[evidence[eid]["sourceId"]].get("error") is None)
                       for eid in claim["evidenceIds"] if eid in evidence):
                    qualifying = True
        if not qualifying:
            errors.append("$.recommendedStatus: no_current_admissions requires official cycle-scoped international bachelor negative evidence")
        if not isinstance(review_decision, dict) or review_decision.get("decision") != "accepted" or review_decision.get("reviewType") not in {"independent", "human"}:
            errors.append("$review: no_current_admissions requires accepted independent or human review")
        elif review_decision.get("cycle") not in {scope.get("cycle") for scope in scopes.values() if scope.get("kind") == "admission"}:
            errors.append("$review.cycle: must match a named admission scope cycle")
        else:
            negative_claims = []
            for claim in claims.values():
                claim_scope = scopes.get(claim.get("scopeId")) if isinstance(claim.get("scopeId"), str) else None
                if (claim.get("field") == "foreign_applicant_eligibility"
                        and claim.get("state") == "supported"
                        and claim.get("value") in {"not_admitted", "not_accepting"}
                        and claim_scope and claim_scope.get("cycle") == review_decision.get("cycle")):
                    negative_claims.append(claim)
            accepted_negative_claims = {
                (decision.get("scopeId"), decision.get("field"), tuple(sorted(decision.get("evidenceIds", []))))
                for decision in review_decision.get("claimDecisions", [])
                if isinstance(decision, dict)
                and decision.get("decision") == "accepted"
                and isinstance(decision.get("evidenceIds"), list)
                and all(isinstance(ident, str) for ident in decision["evidenceIds"])
            }
            if not any(
                (claim.get("scopeId"), claim.get("field"), tuple(sorted(claim.get("evidenceIds", []))))
                in accepted_negative_claims
                for claim in negative_claims
            ):
                errors.append("$review.claimDecisions: exact named-cycle negative claim and evidence must be accepted")

    if isinstance(package.get("packageId"), str) and isinstance(code, str) and isinstance(package.get("taskId"), str) and isinstance(package.get("inputVersion"), str):
        if HEX64.fullmatch(package["inputVersion"]) and package["packageId"] != expected_package_id(code, package["taskId"], package["inputVersion"]):
            errors.append("$.packageId: checksum mismatch")
    if isinstance(package.get("packageSha256"), str) and HEX64.fullmatch(package["packageSha256"]):
        if package["packageSha256"] != expected_package_sha256(package):
            errors.append("$.packageSha256: checksum mismatch")

    if errors:
        raise PackageValidationError(errors)
    return package
