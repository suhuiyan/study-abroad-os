# ชุดพรอมป์ต์งานมหาวิทยาลัยจีน

ชุดนี้ออกแบบให้ Astra คุมงานและตรวจรับ ส่วน Agent โมเดลเล็กทำงานขอบเขตแคบ ใช้รายชื่อมหาวิทยาลัยที่นำเข้าไว้แล้วเป็นคิวหลัก ไม่เสียงานไปสร้างรายชื่อซ้ำ ไม่ใช่ระบบ crawler ที่ติดตั้งแล้ว และไม่ใช่รายงานว่าการวิจัยทั้งประเทศเสร็จแล้ว

## เริ่มใช้งาน

ใน workspace `study-abroad-os` สั่ง Astra ว่า:

> อ่าน `docs/exec-plans/active/china-university-discovery-prompts/START-ASTRA.md` และเอกสารที่อ้างถึง แล้วดำเนินงานตามพรอมป์ต์นั้น เริ่มจากตรวจสถานะจริงและสร้างคิวงาน ใช้ Agent ย่อยสำหรับงานที่แยกได้ตามสิทธิ์และเครื่องมือที่มี ห้ามทำ MVP เดิมซ้ำ ห้ามยืนยันข้อมูลที่ไม่มีหลักฐาน ห้ามแตะ production secret

ไม่จำเป็นต้องเปลี่ยนแชท ไม่ต้องซื้อเครื่องมือเพื่อเริ่ม และไม่ต้องเลือกผู้ให้บริการใหม่ก่อนเริ่มงานที่ทำได้ด้วยเครื่องมือปัจจุบัน

## สถานะตรวจจากฐานจริง 2026-09-27

- ฐานแยก: `discovery/data/discovery.sqlite3`, SQLite ในเครื่อง ไม่ใช่ Neon production
- รายชื่อ MOE: 2,952 สถาบัน; ระดับ本科 1,412 แห่ง เป็นจักรวาลผู้สมัครตรวจ ไม่ใช่รายชื่อที่รับต่างชาติแล้ว
- bachelor: `not_checked` 1,060; `source_found` 192; `not_verified` 159; `no_current_admissions` 1; `verified_admissions` 0
- ขอบเขตครั้งนี้: จีนแผ่นดินใหญ่ นักเรียนต่างชาติระดับปริญญาตรี โดยต้องแยกเงื่อนไขสำหรับนักเรียนไทย
- ไม่มีข้ออ้างว่าทุกมหาวิทยาลัยรับต่างชาติ หรือรับสมัครอยู่ ณ วันนี้
- ตัวเลขเป็น snapshot ต้องอ่านฐานใหม่เมื่อเริ่มและเมื่อรายงานผล

## ไฟล์ในชุด

| ไฟล์ | ใช้ทำอะไร |
| --- | --- |
| [START-ASTRA.md](START-ASTRA.md) | พรอมป์ต์หลักพร้อมใช้ ลำดับงาน กราฟ dependency และเกณฑ์จบจริง |
| [WORKER-PROMPTS.md](WORKER-PROMPTS.md) | Research, Extraction, Review, Import, Coding, Testing และ Monitoring |
| [TASK-TEMPLATE.md](TASK-TEMPLATE.md) | รูปแบบบัตรงานที่ผู้ประสานต้องกรอกก่อนจ่ายงาน |
| [DATA-CONTRACT.md](DATA-CONTRACT.md) | รูปแบบข้อมูล หลักฐาน และความหมายสถานะ |
| [PILOT.md](PILOT.md) | การทดลอง 10 แห่ง การวัดเวลา ความแม่นยำ และค่าใช้จ่าย |
| [pilot-batch.json](pilot-batch.json) | 10 รายการที่ยังไม่ได้ตรวจจริง ไม่ใส่ URL เดา |
| [eval-cases.json](eval-cases.json) | กรณีจำลองสำหรับประเมินพฤติกรรม Agent ไม่ใช่ข้อมูลมหาวิทยาลัยจริง |
| [workflow.json](workflow.json) | Stage dependency ที่ตรวจเทียบกับพรอมป์ต์หลักได้ |
| [audit_pack.py](audit_pack.py) | ตรวจความครบของชุดเอกสาร JSON dependency และ pilot เทียบฐานแบบอ่านอย่างเดียว |
| [test_audit_pack.py](test_audit_pack.py) | ทดสอบตัว audit รวมกรณีเอกสารผิดและตรวจว่าฐานไม่เปลี่ยน |

## ตรวจชุดเอกสาร

รันจาก repository root:

```powershell
& 'C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' -X utf8 docs/exec-plans/active/china-university-discovery-prompts/audit_pack.py
& 'C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' -X utf8 -B docs/exec-plans/active/china-university-discovery-prompts/test_audit_pack.py
```

คำสั่งนี้ไม่เรียกโมเดล ไม่ค้นเว็บ ไม่เขียนฐาน และไม่พิสูจน์ความแม่นยำของ Agent จริง การผ่าน static audit ต้องไม่รายงานเป็นการผ่าน live pilot

## แนวทางที่ใช้

กำหนดบทบาท งานแคบ บริบทเฉพาะงาน ตัวอย่าง และตรวจรับตาม [OpenAI Docs: Prompt Engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)
ข้อมูล JSON ที่รูปแบบถูกต้องยังอาจมีข้อเท็จจริงผิดได้ จึงแยกตรวจรูปแบบออกจากตรวจหลักฐาน ตาม [OpenAI Docs: Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

การดึงซ้ำตามเวลาไม่ใช่ realtime ทันที การลดเวลา/โทเคนเป็นสมมติฐานที่ต้องวัดใน pilot ห้ามรับรองเปอร์เซ็นต์ล่วงหน้า
