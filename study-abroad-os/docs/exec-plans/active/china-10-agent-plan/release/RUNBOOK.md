# Release Runbook

## Hard Stop Conditions

ห้าม deploy production หากข้อใดข้อหนึ่งยังไม่ยืนยัน:

- Q04 usability test ผู้ใช้เป้าหมายจริง 5 คนและ Q05 independent acceptance ยังไม่ผ่าน
- ยังไม่ได้ระบุ release owner
- staging ใช้ฐานข้อมูลเดียวกับ production
- owner ยังไม่ได้ยืนยัน backup และทดลอง restore ใน test environment
- ไม่มี last-good Vercel deployment ID

ห้ามใส่ connection string, token หรือ secret ในเอกสาร, issue, prompt หรือ command history ที่แชร์

## Candidate Checks

รันจาก `study-abroad-os/web`:

```powershell
npm ci
npm test
npm run test:integration:local
npm run lint
npm run build
```

ผลที่คาด: exit code 0 ทุกคำสั่ง, unit tests และ integration tests ไม่มี fail, Next.js แสดง route table สำเร็จ

## Staging Order

1. Owner ตรวจชื่อ project และยืนยันว่า `DATABASE_URL` ของ staging ไม่ใช่ production โดยไม่เปิดเผยค่า
2. ทำ backup ของ staging และ restore ไปยังฐานทดสอบใหม่
3. รัน `npm run db:migrate` ด้วย staging environment
4. รัน `npm run db:seed` หนึ่งครั้ง แล้วรันซ้ำ; รอบสองต้องไม่เปลี่ยน program revision หรือข้อมูลที่ review แล้ว
5. Deploy candidate ไป staging
6. ผู้ดูแลทำ source changed -> draft -> publish หนึ่งรายการสังเคราะห์
7. นักเรียนทดสอบ profile -> shortlist -> application plan -> reload ด้วย test account
8. ตรวจ cron history: completed/error count ตรงกับ source_document และ source error ไม่เปลี่ยน public catalog

## Production Order

1. บันทึก backup ID, เวลา, ผู้รับผิดชอบ และ last-good deployment ID ในระบบส่วนตัวของ owner
2. รัน additive migration ก่อน deploy; หยุดทันทีหาก migration exit code ไม่เป็น 0
3. Deploy candidate commit ที่ผ่าน Q05 เท่านั้น
4. Smoke test แบบ read-only: หน้าแรก 10 รายการ, detail source link, login, admin guard, cron endpoint authorization
5. ใช้ test account ทำหนึ่ง profile/shortlist/application mutation แล้ว reload
6. เฝ้าดู API 5xx, auth error, cron error และ database connection ภายใน release window

## Rollback Triggers

- login หรือ workspace ใช้งานไม่ได้
- cross-user data exposure หรือ non-admin อ่าน admin data ได้
- application save สูญโน้ต/งานหลัง reload
- migration/cron เขียนข้อมูล public โดยไม่ผ่าน review
- error rate เพิ่มจน core flow ใช้งานไม่ได้

Rollback frontend ไป last-good deployment ได้ แต่ห้ามสมมติว่า database rollback อัตโนมัติ ห้าม DROP column/table ใหม่ ให้หยุด write path ที่มีปัญหาและ restore เฉพาะเมื่อ owner ตรวจผลกระทบและมี backup ที่ทดสอบแล้ว
