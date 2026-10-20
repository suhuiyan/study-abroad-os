"""Read-only static audit of prompt artifacts, not a live agent evaluation."""

import json
import re
import sqlite3
from pathlib import Path


PACK = Path(__file__).resolve().parent
ROOT = PACK.parents[3]
REQUIRED = (
    "README.md", "START-ASTRA.md", "WORKER-PROMPTS.md", "TASK-TEMPLATE.md",
    "DATA-CONTRACT.md", "PILOT.md", "pilot-batch.json", "workflow.json",
    "eval-cases.json",
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def load_json(name):
    return json.loads((PACK / name).read_text(encoding="utf-8"))


def audit():
    for name in REQUIRED:
        require((PACK / name).is_file(), f"Missing artifact: {name}")
        require((PACK / name).stat().st_size > 0, f"Empty artifact: {name}")

    for path in PACK.glob("*.md"):
        text = path.read_text(encoding="utf-8")
        for target in re.findall(r"\]\(([^)]+)\)", text):
            if "://" not in target:
                require((PACK / target.split("#")[0]).is_file(), f"Broken link: {target}")

    template = (PACK / "TASK-TEMPLATE.md").read_text(encoding="utf-8")
    fields = (
        "TASK ID:", "ชื่อสั้นของงาน:", "เป้าหมาย:", "ขอบเขต:", "นอกขอบเขต:",
        "บริบทที่จำเป็น:", "ไฟล์ที่ต้องอ่าน:", "ไฟล์ที่อนุญาตให้แก้:", "ไฟล์ที่ห้ามแก้:",
        "ขั้นตอนปฏิบัติ:", "ผลลัพธ์ที่ต้องส่ง:", "Acceptance Criteria:", "คำสั่งตรวจสอบ:",
        "กรณีผิดพลาด:", "ความเสี่ยง:", "Dependency:", "สามารถทำพร้อมกับ:",
        "ระดับความสำคัญ:", "ประมาณการ:",
    )
    for field in fields:
        require(field in template, f"Missing task field: {field}")

    stages = load_json("workflow.json")["stages"]
    dependencies = {stage["id"]: stage["dependencies"] for stage in stages}
    require(len(dependencies) == len(stages) == 13, "Stage IDs must be unique and complete")
    master = (PACK / "START-ASTRA.md").read_text(encoding="utf-8")
    done = set()
    while len(done) < len(stages):
        ready = [key for key, deps in dependencies.items() if key not in done and set(deps) <= done]
        require(bool(ready), "Unresolved dependency or cycle")
        done.update(ready)
    for stage in stages:
        require(f'| {stage["id"]} |' in master, f'Missing stage in master: {stage["id"]}')
        row = next(line for line in master.splitlines() if line.startswith(f'| {stage["id"]} |'))
        declared = row.split("|")[3].strip()
        actual = [] if declared == "ไม่มี" else [item.strip() for item in declared.split(",")]
        require(actual == stage["dependencies"], f'Dependency mismatch: {stage["id"]}')

    cases = load_json("eval-cases.json")
    require(cases["synthetic"] is True, "Eval cases must be labelled synthetic")
    require(len(cases["cases"]) == 12, "Missing eval coverage")
    case_ids = set()
    for case in cases["cases"]:
        require(case["id"] not in case_ids, "Duplicate eval ID")
        case_ids.add(case["id"])
        require(bool(case["scenario"]), "Empty eval input")
        expected = case["expected"]
        require(type(expected["allowVerified"]) is bool, "Invalid eval expectation")
        require(type(expected["allowNoCurrent"]) is bool, "Invalid negative expectation")
        require(bool(expected["requiredAction"]), "Missing eval acceptance action")

    pilot = load_json("pilot-batch.json")
    require(len(pilot["candidates"]) == 10, "Pilot must contain ten candidates")
    schools = pilot["candidates"] + [pilot["reserve"]]
    require(len({school["moeCode"] for school in schools}) == 11, "Duplicate pilot identity")
    db = ROOT / pilot["database"]
    require(db.is_file(), "Local database missing; cannot prove pilot identity")
    current_statuses = {}
    with sqlite3.connect(db.as_uri() + "?mode=ro", uri=True) as conn:
        for school in schools:
            row = conn.execute(
                "SELECT name_zh, region, level, verification_status FROM universities WHERE moe_code=?",
                (school["moeCode"],),
            ).fetchone()
            require(row is not None, f'Unknown MOE code: {school["moeCode"]}')
            require(row[:3] == (school["nameZh"], pilot["region"], pilot["expectedLevel"]), "Pilot identity mismatch")
            require(school["officialHomepage"] is None, "Do not invent pilot URLs")
            current_statuses[school["moeCode"]] = row[3]
        total = conn.execute("SELECT COUNT(*) FROM universities").fetchone()[0]
        bachelor = conn.execute("SELECT COUNT(*) FROM universities WHERE level=?", (pilot["expectedLevel"],)).fetchone()[0]

    return {
        "result": "static_pack_audit_passed",
        "artifactsChecked": len(REQUIRED),
        "taskFieldsChecked": len(fields),
        "dependencyStagesChecked": len(stages),
        "syntheticCasesPresent": len(cases["cases"]),
        "pilotIdentitiesMatched": len(schools),
        "pilotCurrentStatuses": current_statuses,
        "registryCounts": {"total": total, "bachelor": bachelor},
        "limitations": [
            "No live model execution or factual source verification",
            "No speed, accuracy or cost benchmark",
            "No database writes or nationwide monitoring setup",
            "Revalidate pending pilot status before dispatch",
        ],
    }


if __name__ == "__main__":
    print(json.dumps(audit(), ensure_ascii=False, indent=2))
