"""Render explicit, one-institution research cards from the verified pilot queue."""

import json
from pathlib import Path


RUN = Path(__file__).resolve().parent
ROOT = RUN.parents[3]
state = json.loads((RUN / "state.json").read_text(encoding="utf-8"))
task_dir = RUN / "tasks"
task_dir.mkdir(exist_ok=True)

for row in state["tasks"]:
    task = f'''# {row["taskId"]}: ค้นหลักฐานทางการหนึ่งมหาวิทยาลัย

TASK ID: {row["taskId"]}
ชื่อสั้นของงาน: ยืนยันเว็บไซต์และประกาศปริญญาตรีนักศึกษาต่างชาติของ {row["nameZh"]}
บทบาท: Research

เป้าหมาย:
ค้นเว็บไซต์หลัก สำนักงานนักศึกษาต่างชาติ ประกาศรับสมัครระดับปริญญาตรี และประกาศทุนที่หาได้จากแหล่งทางการ สำหรับ MOE code {row["moeCode"]} เท่านั้น

ขอบเขต:
มหาวิทยาลัย {row["nameZh"]}, MOE code {row["moeCode"]}, 甘肃省, 本科; รอบประกาศล่าสุดที่เผยแพร่จริง ณ 2026-09-27 รวม source ownership และแยก historical/current/upcoming intake

นอกขอบเขต:
มหาวิทยาลัยอื่น; ยืนยันข้อมูลด้วยความจำ; แก้ source database หรือ main app; เข้าถึง production, secret, login/CAPTCHA หรือใช้ service เสียเงิน; ทำเครื่องหมาย verified_admissions; ยืนยันว่ากำลังเปิดรับโดยไม่มีหลักฐานช่วงวัน

บริบทที่จำเป็น:
ฐานแยกคือ {ROOT.as_posix()}/discovery/data/discovery.sqlite3. Snapshot read-only ก่อนเริ่มแสดง status not_checked, official_homepage ว่าง และ admissions_url ว่าง. Candidate จาก MOE ไม่ใช่ข้อพิสูจน์ว่ารับชาวต่างชาติ. ใช้ Chinese name + 国际学生/留学生 + 本科 + 招生简章/奖学金; MOE code ใช้ตรวจ identity.

ไฟล์ที่ต้องอ่าน:
{ROOT.as_posix()}/docs/exec-plans/active/china-university-discovery-prompts/WORKER-PROMPTS.md (Research)
{ROOT.as_posix()}/docs/exec-plans/active/china-university-discovery-prompts/DATA-CONTRACT.md
{ROOT.as_posix()}/docs/exec-plans/active/china-university-discovery-prompts/TASK-TEMPLATE.md
{ROOT.as_posix()}/discovery/data/agent-runs/2026-09-27-pilot/state.json

ไฟล์ที่อนุญาตให้แก้:
{ROOT.as_posix()}/discovery/data/agent-runs/2026-09-27-pilot/results/{row["taskId"]}.json (ผลค้นของ task นี้เท่านั้น)

ไฟล์ที่ห้ามแก้:
ฐาน SQLite/CSV, task อื่น, state.json, docs/, source code, .env*, production configuration และไฟล์นอก write-set

ขั้นตอนปฏิบัติ:
1. ยืนยัน MOE identity ก่อนค้น ไม่ค้นเฉพาะชื่ออังกฤษ.
2. ใช้ไม่เกิน 8 query และ 12 source pages. เปิดแหล่งจริง; search snippets ใช้เป็น lead เท่านั้น.
3. หา homepage/officiality proof, international office, foreign-undergraduate notice, admission route, program list และ scholarship source. บันทึก direct HTTPS URLs, final URL, title, publisher, cycle, publication date, access time, quote สั้น และ section/page.
4. แยก facts ตาม degree/program/cycle/nationality; ระบุ historical, unknown, conflict และสิ่งที่ยังไม่พบ. ไม่พบหน้าไม่ใช่หลักฐานว่าไม่รับ.
5. ส่ง JSON ตาม DATA-CONTRACT.md พร้อม runState, sources, evidence, scopes, claims, searchLog, unresolved, checks, nextAction. แนะนำได้เพียง source_found/needs_review/not_verified/no_current_admissions; ห้ามใช้ verified_admissions.

ผลลัพธ์ที่ต้องส่ง:
JSON UTF-8 ที่ output path ข้างต้น และสรุปในคำตอบว่า homepage/admission/scholarship ใดตรวจพบหรือยังไม่พบพร้อม citations.

Acceptance Criteria:
- MOE code กับชื่อจีนตรงรายการที่ได้รับ.
- ทุก supported claim อ้าง evidence ID ที่เปิด URL จริงได้และชี้ข้อความ/locator ตรง claim.
- ownership ยืนยันจาก official link chain หรือระบุ unconfirmed; .edu.cn อย่างเดียวไม่พอ.
- degree, cycle, audience และทุนแยก scope; ไม่ยกระดับปีเก่าเป็น current/open.
- unknown/conflict/failed access แสดงตรงไปตรงมาและไม่แปลงเป็น no_current_admissions.
- JSON parse ได้ ไม่มี URL หรือข้อมูลที่แต่งขึ้น.

คำสั่งตรวจสอบ:
ส่ง JSON เท่านั้นเป็น artifact; coordinator จะรัน JSON parse และ independent review. ตรวจ HTTP/page ด้วย browser/search tool ที่มีจริง; หากเปิดไม่ได้บันทึก error และ mark not_run.

กรณีผิดพลาด:
identity mismatch, official source หาไม่ได้ใน budget, access block, conflict, OCR ambiguity หรือไม่มี browsing tool ให้ส่ง partial/blocked reason และ nextAction ห้ามเดา.

ความเสี่ยง:
ข้อมูลผิดเรื่องสิทธิ์ต่างชาติ/ระดับ/รอบสมัคร/ทุนอาจทำให้นักเรียนไทยพลาดโอกาสหรือเสียค่าใช้จ่าย.

Dependency:
S0 baseline ตรวจผ่านแล้ว; research package นี้ต้องผ่าน independent review ก่อน import.

สามารถทำพร้อมกับ:
Research task code อื่นที่มี write-set คนละไฟล์.

ระดับความสำคัญ: P0
ประมาณการ: เล็ก
'''
    (task_dir / f"{row['taskId']}.md").write_text(task, encoding="utf-8", newline="\n")

print(json.dumps({"generated": len(state["tasks"]), "directory": str(task_dir)}, ensure_ascii=False))
