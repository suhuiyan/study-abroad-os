import copy
import json
import unittest
from pathlib import Path

from discovery.package_validator import (
    PackageValidationError,
    expected_input_version,
    expected_package_id,
    expected_package_sha256,
    validate_package,
)


FIXTURE = Path(__file__).parent / "tests" / "fixtures" / "package-validator" / "valid_v1.json"


def valid_package():
    package = json.loads(FIXTURE.read_text(encoding="utf-8"))
    package["packageId"] = expected_package_id(package["moeCode"], package["taskId"], package["inputVersion"])
    package["packageSha256"] = expected_package_sha256(package)
    return package


def reseal(package):
    package["packageSha256"] = expected_package_sha256(package)
    return package


def valid_review(package, *, cycle="2027"):
    return {
        "taskId": package["taskId"],
        "moeCode": package["moeCode"],
        "inputVersion": package["inputVersion"],
        "reviewer": "Independent reviewer",
        "reviewType": "independent",
        "decision": "accepted",
        "reviewedAt": "2026-09-27T12:00:00+08:00",
        "claimDecisions": [{
            "scopeId": "scope-admission-2027",
            "field": "foreign_applicant_eligibility",
            "decision": "accepted",
            "evidenceIds": ["ev-cycle"],
            "reason": "Official statement explicitly names the cycle and applicant scope.",
        }],
        "recommendedStatus": "no_current_admissions",
        "cycle": cycle,
        "unresolved": [],
    }


class PackageValidatorTests(unittest.TestCase):
    def assert_invalid(self, package, path, review=None):
        with self.assertRaises(PackageValidationError) as caught:
            validate_package(package, review)
        self.assertTrue(any(path in error for error in caught.exception.errors), caught.exception.errors)
        self.assertNotIn("secret-value", str(caught.exception))

    def test_accepts_complete_v1_and_preserves_chinese(self):
        package = valid_package()
        package["nameZh"] = "西北师范大学"
        reseal(package)
        self.assertIs(validate_package(package), package)

    def test_hash_helpers_are_deterministic_and_input_version_uses_exact_row(self):
        row = {"moeCode": "4162010001", "nameZh": "测试大学", "province": "甘肃省"}
        a = expected_input_version("dataset-1", "a" * 64, row)
        self.assertEqual(a, expected_input_version("dataset-1", "a" * 64, row))
        self.assertNotEqual(a, expected_input_version("dataset-1", "b" * 64, row))
        self.assertEqual(64, len(a))

    def test_rejects_missing_and_unknown_envelope_properties(self):
        package = valid_package()
        del package["nextAction"]
        self.assert_invalid(package, "$.nextAction")
        package = valid_package()
        package["secret-value"] = "do-not-echo"
        self.assert_invalid(package, "unknown property")
        with self.assertRaises(PackageValidationError) as caught:
            validate_package(package)
        self.assertNotIn("do-not-echo", str(caught.exception))

    def test_rejects_hash_and_id_mismatch(self):
        package = valid_package()
        package["taskId"] = "changed"
        self.assert_invalid(package, "$.packageId")
        package = valid_package()
        package["nameZh"] = "changed"
        self.assert_invalid(package, "$.packageSha256")

    def test_rejects_duplicate_ids_and_broken_references(self):
        package = valid_package()
        package["evidence"].append(copy.deepcopy(package["evidence"][0]))
        self.assert_invalid(package, "duplicate ID")
        package = valid_package()
        package["claims"][0]["evidenceIds"] = ["missing"]
        reseal(package)
        self.assert_invalid(package, "reference not found")

    def test_unknown_requires_null_and_supported_requires_citable_readable_evidence(self):
        package = valid_package()
        package["claims"][1]["value"] = "eligible"
        reseal(package)
        self.assert_invalid(package, "unknown claim value must be null")
        package = valid_package()
        package["claims"][0]["evidenceIds"] = []
        reseal(package)
        self.assert_invalid(package, "supported claim requires evidence")
        package = valid_package()
        package["evidence"][1]["locator"] = ""
        package["claims"][0]["evidenceIds"] = ["ev-cycle"]
        reseal(package)
        self.assert_invalid(package, "expected non-empty string")

    def test_rejects_scope_inheritance_and_missing_program_degree(self):
        package = valid_package()
        package["claims"][0]["evidenceIds"] = ["ev-owner"]
        reseal(package)
        self.assert_invalid(package, "evidence is outside claim scope")
        package = valid_package()
        package["scopes"].append({
            "id": "scope-program", "kind": "program", "label": "Program", "cycle": None,
            "degreeLevel": None, "applicantChannel": None, "programScope": None, "evidenceIds": [],
        })
        reseal(package)
        self.assert_invalid(package, "program and scholarship scopes require explicit degree level")

    def test_rejects_bad_urls_dates_timestamps_enums_and_null_loss(self):
        package = valid_package()
        package["sources"][0]["url"] = "http://university.example.cn"
        reseal(package)
        self.assert_invalid(package, "$.sources[0].url")
        package = valid_package()
        package["sources"][0]["fetchedAt"] = "2026-09-27T10:00:00"
        reseal(package)
        self.assert_invalid(package, "timezone")
        package = valid_package()
        package["runState"] = "approved"
        reseal(package)
        self.assert_invalid(package, "invalid runState enum")

    def test_no_current_requires_explicit_official_negative_named_cycle_and_accepted_review(self):
        package = valid_package()
        package["recommendedStatus"] = "no_current_admissions"
        package["scopes"][1]["evidenceIds"] = ["ev-cycle"]
        package["claims"] = [{
            "scopeId": "scope-admission-2027", "field": "foreign_applicant_eligibility",
            "value": "not_accepting", "unit": None, "state": "supported",
            "evidenceIds": ["ev-cycle"], "notes": None,
        }]
        reseal(package)
        self.assert_invalid(package, "$review")
        self.assert_invalid(package, "official cycle-scoped", review=valid_review(package))
        package["evidence"][1]["originalExcerpt"] = "The university is not accepting international undergraduate applicants for 2027."
        reseal(package)
        self.assertIs(validate_package(package, valid_review(package)), package)
        unrelated_review = valid_review(package)
        unrelated_review["claimDecisions"][0]["evidenceIds"] = ["ev-owner"]
        self.assert_invalid(package, "exact named-cycle negative claim", review=unrelated_review)
        unrelated_review = valid_review(package)
        unrelated_review["claimDecisions"][0]["field"] = "application_open"
        self.assert_invalid(package, "exact named-cycle negative claim", review=unrelated_review)
        mismatched_status_review = valid_review(package)
        mismatched_status_review["recommendedStatus"] = "not_verified"
        self.assert_invalid(package, "must match package recommendation", review=mismatched_status_review)
        bad_review = valid_review(package, cycle="2026")
        self.assert_invalid(package, "$review.cycle", review=bad_review)

    def test_research_summary_pilot_is_not_a_v1_package(self):
        incomplete = {
            "moeCode": "4162010735", "nameZh": "甘肃中医药大学", "researchStatus": "needs_review",
            "currentCycleVerified": False,
        }
        with self.assertRaises(PackageValidationError):
            validate_package(incomplete)


if __name__ == "__main__":
    unittest.main()
