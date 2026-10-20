# ผลตรวจแผนก่อนส่งต่อ

วันที่: 2026-09-22. นี่เป็น validation ของแผน ไม่ใช่การปิด implementation tasks.

| รายการตรวจ | ผล |
|---|---|
| TASKS.json parse จากไฟล์บนดิสก์ | ผ่าน |
| จำนวนใบงานใน manifest / ไฟล์จริง | 52 / 52 |
| ID ซ้ำ / ไฟล์ใบงานหาย | 0 / 0 |
| หัวข้อที่ผู้ใช้กำหนด | 19 หัวข้อครบทุกใบ |
| Dependency อ้าง ID ไม่มีจริง | 0 |
| Dependency graph cycle | 0 |
| Shared write allowlist ไม่มีลำดับ dependency รองรับ | 0 คู่ |
| Read path ที่ไม่มีไฟล์และไม่มี ancestor task สร้าง | 0 |
| Implementation task status | PLANNED ทั้งหมด |
| Application code changed ในรอบทำแผน | ไม่มี |
| Local/remote baseline | 630a2b1995f207d3cc96621d7618336d5741adda |
| Domain tests รันใหม่ | 5 ผ่าน / 5 ทั้งหมด |
| Fresh lint/build/integration/E2E | ไม่ได้รันในรอบเอกสาร |
| Public API | 10 records / 10 universities / partial ทั้งหมด |
| Fresh production auth/cron/backup verification | ยังไม่ได้ตรวจ |

## ประเด็นที่ต้องใช้คนหรือสิทธิ์เพิ่มภายหลัง
- B01: ระบุผู้ตรวจรับและกำหนดนโยบายข้อมูลที่ทีมจะใช้; local/research เริ่มจากข้อเสนอใน DATA-CONTRACT ได้ตามลำดับ.
- Q04: ผู้ใช้เป้าหมายจริง 5 คน; ผู้ใช้โปรเจกต์เป็นผู้จัดผู้ทดลอง. ห้ามให้ AI สร้างผลแทน.
- Q05: reviewer ตรวจงานที่ไม่ได้ทำเอง.
- L01/L02: release owner ที่มีสิทธิ์ staging/production, backup/restore และ cron run history; worker ไม่เห็น production secrets.
- ถ้าเพิ่ม Jev/AI extraction provider/email/file upload/multi-intake ต้องออก scope decision แยก ไม่ปนใน task เดิม.

## ขอบเขตการตรวจอัตโนมัติ
การตรวจ graph/allowlist/path ช่วยลดงานชนและ prerequisite ที่หาย ไม่ได้พิสูจน์ว่า business contract หรือข้อมูลมหาวิทยาลัยถูกต้อง.
ความถูกต้องของ admission/scholarship ต้องมาจาก Rxx/Vxx และการทดสอบผลใน task ถัดไป.
หาก implementation เปลี่ยน paths/contract ต้องตรวจแผนซ้ำเฉพาะส่วนที่ได้รับผล.
