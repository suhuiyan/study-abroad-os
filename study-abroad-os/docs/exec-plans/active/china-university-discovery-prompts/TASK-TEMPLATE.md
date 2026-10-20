# บัตรงานมาตรฐาน

Coordinator ต้องแทนข้อความในวงเล็บทุกช่องก่อน dispatch และ resolve path เป็น absolute ตาม repo จริง ช่องไม่มีรายการให้เขียน `ไม่มี` พร้อมเหตุผล ห้ามใช้ `อ่านทั้ง repo` หรือ `แก้ไฟล์ตามจำเป็น`

TASK ID: [ID ที่ไม่ซ้ำ]
ชื่อสั้นของงาน: [หนึ่งมหาวิทยาลัย / หนึ่ง source / หนึ่ง behavior]
บทบาท: [Research / Extraction / Review / Import / Coding / Testing / Monitoring]

เป้าหมาย:
[ปัญหาเดียวที่ต้องแก้ ไม่รวมทั้ง stage]

ขอบเขต:
[MOE code / source ID / ช่วง PDF / behavior และ cycle ที่ต้องตรวจ]

นอกขอบเขต:
[งานที่ห้ามทำ โดยเฉพาะ production, secrets, unrelated files และอนุมัติเอง]

บริบทที่จำเป็น:
[ข้อมูลเดิมที่ยืนยันแล้ว ข้อไม่แน่ใจ snapshot timestamp และ parent task]

ไฟล์ที่ต้องอ่าน:
[absolute path ทีละไฟล์ พร้อม section ถ้าไฟล์ใหญ่]

ไฟล์ที่อนุญาตให้แก้:
[absolute path จำกัดเฉพาะ output ของ task หรือ write-set coding]

ไฟล์ที่ห้ามแก้:
[absolute SQLite path, web/.env*, source ที่อยู่นอก write-set และ state.json สำหรับ non-writer]

ขั้นตอนปฏิบัติ:

1. [ตรวจ input และ dependency]
2. [ทำงานเดียวตามบทบาท]
3. [ตรวจผลและส่ง artifacts ไม่อ้างผลที่ไม่รัน]

ผลลัพธ์ที่ต้องส่ง:
[ไฟล์ JSON/รายงาน/diff + unresolved + แหล่งหลักฐาน]

Acceptance Criteria:

- [เงื่อนไขที่พิสูจน์ได้จากผลลัพธ์ ไม่ใช่ "ข้อมูลครบและถูก"]
- [ตรวจ cycle/degree/source ownership หรือ regression behavior ที่เฉพาะงาน]
- [กรณี unknown/conflict และการคงข้อมูลเดิม]

คำสั่งตรวจสอบ:
[คำสั่งที่ coordinator ตรวจว่ามีจริง พร้อม cwd และ expected exit/result; research ที่ยังไม่มี validator ให้ JSON parse + reviewer เปิด sources โดยบอกข้อจำกัด ไม่แต่ง npm command]

กรณีผิดพลาด:
[input ไม่ตรง, identity ขัดแย้ง, quota/block, secret, source อ่านไม่ได้ ให้ส่ง partial/stop reason และ next action]

ความเสี่ยง:
[ผลต่อผู้สมัครและข้อมูล หากผิด]

Dependency:
[TASK ID ที่ต้องผ่าน ไม่ใช่เพียงเริ่ม]

สามารถทำพร้อมกับ:
[ID หรือชนิด task ที่ write-set ไม่ชน และ prerequisite พร้อม]

ระดับความสำคัญ: [P0 / P1 / P2]
ประมาณการ: [เล็ก / กลาง / ใหญ่; ใหญ่ให้แตกก่อน dispatch ไม่ประเมินชั่วโมงโดยไม่มีข้อมูล]

## Output envelope ทุกบทบาท

ส่ง `taskId`, `role`, `runState` (`complete`, `partial`, `blocked`), `inputVersion`, `outputPaths`, `checks` (command/result/ข้อจำกัด), `unresolved`, `nextAction` และข้อมูลเฉพาะบทบาทตาม DATA-CONTRACT.md
task complete หมายถึงส่งงานขอบเขตนั้นครบ ไม่ได้หมายถึงมหาวิทยาลัยยืนยันรับสมัครหรือโครงการทั้งประเทศเสร็จ
