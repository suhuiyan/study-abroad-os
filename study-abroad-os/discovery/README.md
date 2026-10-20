# discovery — ฐานวิจัยมหาวิทยาลัยจีน

ข้อมูลวิจัย 1,412 สถาบันปริญญาตรีจากทะเบียน MOE 2026 แยกจาก catalog ในแอป (`web/src/lib/catalog.ts`) การมีข้อมูลที่นี่ไม่ได้แปลว่าเผยแพร่ในแอปแล้ว

## ไฟล์ล่าสุด

| ไฟล์ | ที่อยู่ |
|---|---|
| ทะเบียน v349 (ไฟล์หลักล่าสุด, ตรวจ 2026-10-08 ถึง 10-10) | `../../HANDOFF-CLAUDE-2026-10-07/university-register-v349.xlsx` และรายงาน `report-v349.md` |
| ทะเบียน v348 (ต้นฉบับของ v349) | `data/agent-runs/2026-09-27-pilot/source-capture-2026-10-05/excel-output-2026-10-05/china-university-directory-1412-official-links-2026-10-06-v348.xlsx` |
| หลักฐานลิงก์ทางการ | `.../excel-output-2026-10-05/official-source-evidence-2026-10-06.jsonl` |
| SQLite (baseline เก่า ไม่ synchronized กับ Excel) | `data/discovery.sqlite3` |
| ทะเบียน MOE ต้นทาง | `data/moe-2026-29c40f083b63.xls`, `data/moe-2026.json` |
| capture หน้าเว็บ/PDF และผลวิจัย | `data/agent-runs/2026-09-27-pilot/` |

## ที่ย้ายออกไป

Excel v1–v347 และ `__pycache__` ถูกย้ายไป
`ChatGPT/Bring me _archive/2026-10-18/` เมื่อ 2026-10-18 (ดู `MANIFEST.csv` และ `RESTORE.md` ในโฟลเดอร์นั้น)

## ข้อควรรู้

- **กู้ต้นฉบับ `.py` คืนแล้ว (2026-10-20, KAN-34):** `extract_registry`, `build_coverage_queue`, `build_research_tasks`, `fast_source_sweep`, `import_package`, `migrate_evidence`, `package_validator`, `backup_restore`, `server`, `migrations/001_research_evidence.sql`, test 7 ไฟล์ และเอกสาร contract อยู่ใน git stash ของ repo (snapshot 6 ต.ค. 2026 15:33 +08:00, stash `a5ca1ce`) ตรวจแล้ว: ตรงกับ git blob ทุก byte, คอมไพล์ได้โค้ดเหมือน `.pyc` เดิมทุกไฟล์ที่มี `.pyc`, และ test 39 ข้อผ่าน (รันในสำเนาแยก) ยังไม่ได้รัน pipeline กับ `data/discovery.sqlite3` จริง
  - README เดิมของ pipeline (วิธีรัน server, สถานะ review): `README-PIPELINE-2026-10-06.md` (ตัวเลขในนั้นเป็นของ 25 ก.ย. 2026)
  - ไม่พบ `test_server.py` และ `test_extract_registry.py` ใน snapshot (ไม่เคยมี หรือไม่ได้อยู่ใน stash ไม่ทราบ)
  - ไม่ได้นำเข้า: `wiki.html` (สำเนา Wikipedia) และ `evidence/ecnu/admission.md` (มีอีเมลเจ้าหน้าที่ระบุชื่อ) สองไฟล์นี้ยังอยู่ใน `RECOVERED-DISCOVERY-2026-10-20/`
  - ชุดงาน 10 มหาวิทยาลัย: `../docs/exec-plans/active/china-10-agent-plan/` และสัญญาข้อมูล: `../docs/exec-plans/active/china-university-discovery-prompts/`
- สคริปต์ `build-vN.mjs` / `verify-vN.mjs` ใน `excel-output-2026-10-05/` ถูก version ใน git ไว้เป็นประวัติการแก้แต่ละเวอร์ชัน แต่ต้องใช้ `@oai/artifact-tool` ของ Codex จึงรันใน environment อื่นไม่ได้
