"""Test static audit behavior; these tests do not evaluate an AI model."""

import copy
import hashlib
import unittest
from unittest.mock import patch

import audit_pack


class PromptPackAuditTests(unittest.TestCase):
    def test_pack_passes_without_changing_database(self):
        db = audit_pack.ROOT / "discovery/data/discovery.sqlite3"
        before = hashlib.sha256(db.read_bytes()).hexdigest()
        result = audit_pack.audit()
        after = hashlib.sha256(db.read_bytes()).hexdigest()
        self.assertEqual(before, after)
        self.assertEqual(result["result"], "static_pack_audit_passed")
        self.assertEqual(result["pilotIdentitiesMatched"], 11)

    def audit_with_changed_json(self, name, change):
        original = audit_pack.load_json
        fixture = copy.deepcopy(original(name))
        change(fixture)
        with patch.object(audit_pack, "load_json", side_effect=lambda key: fixture if key == name else original(key)):
            audit_pack.audit()

    def test_dependency_cycle_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "dependency or cycle"):
            self.audit_with_changed_json("workflow.json", lambda data: data["stages"][0]["dependencies"].append("S12"))

    def test_document_and_manifest_dependency_drift_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "Dependency mismatch"):
            self.audit_with_changed_json("workflow.json", lambda data: data["stages"][9]["dependencies"].remove("S6"))

    def test_duplicate_pilot_identity_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "Duplicate pilot identity"):
            self.audit_with_changed_json("pilot-batch.json", lambda data: data["candidates"].__setitem__(1, data["candidates"][0]))

    def test_wrong_school_identity_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "Pilot identity mismatch"):
            self.audit_with_changed_json("pilot-batch.json", lambda data: data["candidates"][0].__setitem__("nameZh", "Wrong identity"))

    def test_invented_pilot_url_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "invent pilot URLs"):
            self.audit_with_changed_json("pilot-batch.json", lambda data: data["candidates"][0].__setitem__("officialHomepage", "https://example.com"))

    def test_unlabelled_synthetic_cases_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "labelled synthetic"):
            self.audit_with_changed_json("eval-cases.json", lambda data: data.__setitem__("synthetic", False))


if __name__ == "__main__":
    unittest.main(verbosity=2)
