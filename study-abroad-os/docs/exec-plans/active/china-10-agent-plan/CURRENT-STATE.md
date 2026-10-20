# ภาพรวมที่ตรวจพบจริง
ตรวจเพื่อวางแผนวันที่ 2026-09-22; ไม่ได้เปลี่ยน application หรือ production ในรอบนี้.

## หลักฐาน baseline
- Git local และ remote main ตรงกัน: 630a2b1995f207d3cc96621d7618336d5741adda.
- Working tree สะอาดก่อนเพิ่มเอกสารแผนชุดนี้.
- npm test รันใหม่: 5 tests ผ่าน 5; ไม่ได้รัน lint/build/E2E ใหม่ในงานวางแผนนี้.
- GET https://study-abroad-web-gray.vercel.app/api/workspace ตอบ configured=true, programs=10, unique universities=10.
- ทั้ง 10 records ที่ API ส่งมี verification=partial, checkedAt=2026-09-16.
- configured=true และจำนวนข้อมูลไม่ใช่หลักฐานว่า program table มี 10 rows เพราะ API มี fallback เมื่อ query ได้ array ว่าง.
- repository public: https://github.com/suhuiyan/study-abroad-os ; GitHub About ยังมี deployment URL เก่าอีกชื่อ จึงใช้ URL ที่ผู้ใช้ระบุเป็นเป้าหมาย.
- เครื่องมือเว็บเปิด production page ไม่ได้ในครั้งนี้ แต่ public API ผ่าน HTTP request ตรวจได้. ไม่อ้างว่า browser UI/E2E ผ่านรอบใหม่.
- Neon provider/configuration, cron run history, backup restore, admin identity และจำนวนผู้ใช้จริง: ต้องตรวจเพิ่มโดยผู้มีสิทธิ์; ไม่อ่าน production secret.

## สิ่งที่มีแล้วและใช้ต่อ
Next.js 16.3.5 + React + TypeScript + Tailwind/CSS; Zod validation; pg Pool; Better Auth email/password.
Search/filter, 10 catalog entries, scholarship display, HSK/IELTS/CSCA preliminary checks, profile, shortlist, application tasks/notes.
Public/authenticated workspace API และ auth catch-all; PostgreSQL JSONB ใช้กับ program/profile/application.
admin_user, program_revision, activity_event มีใน schema แล้ว. Source documents และ SHA-256 body snapshots เก็บใน PostgreSQL bytea.
cron route มี bearer secret check และ vercel.json ตั้ง 0 1 * * * (01:00 UTC หรือประมาณ 09:00 จีนตาม schedule; ไม่ยืนยันเวลารันจริงหรือทุก run สำเร็จ).
ไม่ต้องสร้าง frontend/auth/DB/provider/deployment ใหม่. Prisma/Auth.js ในเอกสารเก่าไม่ใช่ stack ที่ใช้อยู่จริง.

## ช่องว่างและ evidence จากโค้ด
| สิ่งที่เห็น | ตำแหน่ง baseline | ผลต่อแผน |
|---|---|---|
| source ID ขึ้นกับลำดับ array | web/src/lib/catalog.ts:61 | S01 ทำ identity คงที่; ป้องกันสลับประวัติเมื่อ reorder |
| seed update พิจารณา checkedAt อย่างเดียว | web/scripts/migrate.ts:11 | B03 แยก bootstrap กับ reviewed publication |
| vercel-build รัน migration ก่อน build | web/package.json:8 | B03/L01 แยกขั้น migration ที่ต้องควบคุมจาก build |
| โหลดทั้ง response ก่อนเช็ก byte length | web/src/lib/sources.ts:14 | S02 จำกัด stream memory และ error handling |
| hash checker ไม่ extract, review หรือ publish | web/src/lib/sources.ts | S03/S04/A01-A04 ต่อคิวผู้ดูแล ไม่กล่าวว่า realtime |
| source status changed อาจกลายเป็น same ในรอบถัดไป | web/src/lib/sources.ts | ต้อง persistent review item ไม่ใช้ latest status เป็นคิว |
| intake ใช้ includes และ validity เทียบ now | web/src/lib/domain.ts:54 | E01 เพิ่ม round/date semantics |
| CSCA มีเพียง taken/not-yet/unknown และวุฒิเป็นข้อความ | web/src/lib/domain.ts:67 | E02/E03 ประเมินเมื่อมี structured evidence เท่านั้น |
| start ระบุ targetIntake=2027 ตายตัว | web/src/app/api/workspace/route.ts:57 | P01 รับปีเป้าหมายที่ validate |
| application update ส่งทั้ง object ไม่มี expectedVersion | web/src/app/api/workspace/route.ts | P02/P03 ป้องกันทับ draft และข้อมูลพร้อมกัน |
| unique application ต่อ user/program | web/db/schema.sql:16 | รอบนี้คงข้อจำกัด ไม่อ้างว่าหลายใบสมัครต่าง intake ได้แล้ว |
| มี admin mutation แต่ไม่มีหน้า admin | web/src/app/api/workspace/route.ts:71, web/src/app/page.tsx | reuse guard, เพิ่ม review UI และปิด direct-publish bypass |
| npm test ชี้เพียง domain.test.ts | web/package.json:11 | B02 เพิ่ม discovery ก่อนเพิ่มหลาย test files |
| 5 domain tests ไม่มี integration/browser coverage ใน repo | web/src/lib/domain.test.ts | Q01/Q02 ขยายตามความเสี่ยงเฉพาะที่แก้ |

## สิ่งที่ยังไม่ตรวจและห้ามสรุปแทน
วันที่/ทุน/คะแนนใน catalog ยังไม่ได้เปิด official sources ทั้งหมดใหม่ระหว่างวางแผน. Research tasks มีหน้าที่ทำสิ่งนี้.
5 tests ไม่พิสูจน์ security, auth persistence, cron health หรือการใช้งานจริงครบ.
ก่อนหน้านี้มีรายงานทดสอบสมัครบัญชี/shortlist/plan; เป็นประวัติจากแชท ไม่ใช่ fresh validation ของรอบนี้.
ข้อมูล 10 แห่งไม่ใช่ฐานข้อมูลครบทุกโปรแกรม. แผนนี้รักษาขอบเขตสิบเส้นทางเดิมให้เชื่อถือได้.

## มหาวิทยาลัย/record ที่มอบหมาย
- R01A/B: Peking University (pku) — pku-undergraduate
- R02A/B: Fudan University (fudan) — fudan-data-science
- R03A/B: Shanghai Jiao Tong University (sjtu) — sjtu-engineering
- R04A/B: Zhejiang University (zju) — zju-chinese-undergraduate
- R05A/B: Xiamen University (xmu) — xmu-chinese-humanities
- R06A/B: Tongji University (tongji) — tongji-chinese-language
- R07A/B: East China Normal University (ecnu) — ecnu-chinese-undergraduate
- R08A/B: Beijing Language and Culture University (blcu) — blcu-chinese-language
- R09A/B: University of International Business and Economics (uibe) — uibe-international-business
- R10A/B: Shandong University of Finance and Economics (sdufe) — sdufe-international-trade

## เอกสารเก่าที่อาจทำให้ Agent หลง
AGENTS.md ส่วน current direction ยังระบุ backend-first/UX deferred; PROJECT_STATE.md มีของที่ implement แล้ว.
MVP-TODO.md ที่ repo root มี checklist ยังไม่ tick หลายส่วน; docs PRD/architecture กล่าวถึง Community/Mentor/Housing เป็นภาพเดิมกว้างกว่า request ปัจจุบัน.
ใช้คำสั่งผู้ใช้ล่าสุดและ implementation evidence ของชุดนี้เป็น active scope. ไม่ทำ social/marketplace/Singapore เพิ่มจาก roadmap เก่า.

