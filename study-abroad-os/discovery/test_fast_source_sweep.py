import json
import tempfile
import unittest
from pathlib import Path

from discovery.fast_source_sweep import _row_status, run


class FastSourceSweepTests(unittest.TestCase):
    def test_status_never_promotes_to_verified(self):
        status, action = _row_status([
            {"httpStatus": 200, "keywordHits": ["国际学生", "本科", "招生"], "error": None},
        ], True)
        self.assertEqual(status, "candidate_relevant_source")
        self.assertIn("extract", action)

    def test_missing_urls_get_follow_up_without_fetching(self):
        record = {
            "taskId": "R-1234567890-test",
            "inputVersion": "a" * 64,
            "university": {"moeCode": "1234567890", "nameZh": "测试大学", "region": "测试省"},
            "rowSnapshot": {"official_homepage": "", "admissions_url": ""},
        }
        with tempfile.TemporaryDirectory() as temp:
            queue = Path(temp) / "queue.jsonl"
            output = Path(temp) / "output"
            queue.write_text(json.dumps(record, ensure_ascii=False) + "\n", encoding="utf-8")
            manifest = run(queue, output, workers=1, timeout=0.1)
            self.assertEqual(manifest["queueRows"], 1)
            rows = [json.loads(line) for line in (output / "fast-source-sweep.jsonl").read_text(encoding="utf-8").splitlines()]
            self.assertEqual(rows[0]["discoveryStatus"], "no_existing_source")
            self.assertFalse(rows[0]["importReady"])
            follow = [json.loads(line) for line in (output / "fast-follow-up-queue.jsonl").read_text(encoding="utf-8").splitlines()]
            self.assertEqual(follow[0]["stage"], "discovery")
            self.assertTrue((output / "fast-source-sweep.csv").is_file())


if __name__ == "__main__":
    unittest.main()
