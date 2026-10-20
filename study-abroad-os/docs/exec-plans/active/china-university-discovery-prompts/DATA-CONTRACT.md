# สัญญาข้อมูลและหลักฐาน v1

นี่เป็นสัญญาผลลัพธ์สำหรับ prompt ไม่ใช่ schema ที่ migrate ลง SQLite แล้ว ก่อน implementation ต้องทำ validator/schema ตาม S4/S5 เก็บ UTF-8 จีน/ไทยได้ ไม่ทิ้งข้อความต้นฉบับ

## JSON package

Research/extraction รวมใน package ต่อมหาวิทยาลัยโดย coordinator; IDs ภายในต้องไม่ซ้ำ references ต้อง resolve ข้าม package ให้ใช้ global source key หรือ explicit index

Package identity/integrity metadata:

- `packageId` is coordinator-generated as lowercase hex SHA-256 of UTF-8 `moeCode + "\n" + taskId + "\n" + inputVersion`. A new research task or input snapshot creates a new ID.
- `packageSha256` is SHA-256 of canonical UTF-8 JSON for the complete package with the `packageSha256` property omitted; serialize object keys in Unicode codepoint order, arrays in declared order, with no insignificant whitespace. This avoids a self-referential digest.
- `inputVersion` is SHA-256 of canonical JSON containing `datasetId`, `sourceHash`, and the exact university-register row fields given to the researcher. The row uses these database column names: `moe_code`, `name_zh`, `name_en`, `managing_authority`, `region`, `level`, `notes`, `official_homepage`, `admissions_url`, `verification_status`, `review_note`, `reviewed_at`, `source_as_of`. Hash the complete row, including existing URLs/status/notes; do not use a filename or `asOf` date alone.
- The importer recomputes these values. Same `packageId` + same `packageSha256` is an idempotent replay. Same `packageId` + different hash is a conflict and must be rejected without overwriting the earlier package.

| Key | รูปแบบ / ความหมาย |
| --- | --- |
| schemaVersion | `1` |
| packageId, packageSha256 | ตาม integrity metadata ข้างต้น |
| taskId, role, runState | ตาม TASK-TEMPLATE.md |
| inputVersion | checksum/version ของ inputs ไม่ใช้เพียงชื่อไฟล์ |
| moeCode, nameZh | ตรงทะเบียน code เป็น string ไม่ใช่เลข |
| asOf | วันที่ตรวจจริง `YYYY-MM-DD` ไม่ hardcode วันในตัวอย่าง |
| officialHomepage | object `{url: HTTPS URL, ownershipEvidenceIds: [...]}` หรือ `null`; ownership evidence ต้อง resolve ไปยัง evidence record |
| recommendedStatus | สถานะตามตารางด้านล่าง ห้าม worker อนุมัติ verified |
| sources | array ของ sources ที่เปิดหรือพยายามเปิดจริง |
| evidence | array ของ excerpts สั้นและ locator |
| scopes | array แยก institution/admission/program/scholarship |
| claims | array ข้อเท็จจริงที่มี scope/evidence หรือ unknown |
| searchLog | query/URL/action/result สำหรับการตรวจซ้ำ |
| outputPaths, checks, unresolved, nextAction | envelope; unresolved มี question/reason/nextAction ไม่ซ่อนเป็น default |

Source: `id`, `url`, `finalUrl` (null ถ้ายัง resolve ไม่ได้), `title` (null ถ้าอ่านไม่ได้), `publisher`, `officiality` (`confirmed`/`unconfirmed`), `ownershipEvidenceIds`, `publishedAt` (ISO date หรือ null), `fetchedAt` (ISO timestamp พร้อม offset/UTC), `httpStatus` (integer/null), `retrievalMethod` (`html`/`pdf_text`/`ocr`/`browser`/`search_snippet`), `capturePath`, `sha256`, `error` (nullable)

Evidence: `id`, `sourceId`, `originalExcerpt`, `locator` (section/paragraph/PDF page 1-based), `language` ข้อความสั้นพอพิสูจน์ claim ไม่คัดเอกสารทั้งฉบับ
Ownership evidence ต้องระบุความเชื่อมโยงจริง เช่น หน้า MOE/หน่วยงานทางการชี้โดเมน หรือหน้า official university ชี้ international office/third-party portal ไม่ใช้ cycle ownership evidence วนกลับอ้างกันเอง

Scope: `id`, `kind`, `label`, `cycle` (source wording หรือ null), `degreeLevel` (nullable), `applicantChannel` (nullable), `programScope` (nullable), `evidenceIds`
Claim: `scopeId`, `field`, `value` (string/null), `unit` (nullable), `state` (`supported`/`unknown`/`conflicting`), `evidenceIds`, `notes`
supported ต้องมี evidenceIds ที่อ่านได้จริงและตรง scope; unknown ต้อง value null; conflicting แสดง competing values/evidence ใน notes ไม่เลือกโดยเดา

## Fields ที่ต้องค้น แยกตาม source/scope

- University: identity/official homepage/international office/official admission source/application portal/contact
- Admission: foreign_applicant_eligibility, thai_applicant_restrictions, degree_level, intake_cycle, application_open, application_deadline, timezone, application_route, age, qualification, nationality/residency, documents, application_fee
- Program: program_name/code, teaching_language, duration, HSK, IELTS/TOEFL, CSCA subjects/thresholds/exemptions, prerequisites, tuition/currency/payment_period, additional fees
- Scholarship: name/provider, eligible_degree/nationality/program/cycle, coverage/amount/currency, quota, deadline, route, agency_code ถ้ามีทางการ, nomination/selection, renewal_conditions, exclusions

รายการที่ไม่ประกาศต้องมี unknown หรือ unresolved ตาม scope ที่ตรวจแล้ว ไม่สร้าง program/scholarship entity สมมติ ทุกทุนมี requirements ของตัวเอง ห้าม inherit ว่าใช้ได้กับทุกหลักสูตร
deadline หลายรอบเก็บแยก round; timezone ไม่ประกาศให้ null เก็บ original wording ไม่แปลงเดา วันหมดเขตไม่ได้แปลว่าปีหน้าจะเหมือนเดิม
"ไม่กล่าวถึง CSCA" ไม่เท่ากับ "ไม่ต้องใช้ CSCA" และ scholarship membership ไม่เท่ากับมี bachelor scholarship เปิดรับ
derived intakeState (`open`, `closed`, `upcoming`, `unknown`) ต้องระบุ derived rule/asOf/evidence พร้อม uncertainty ใช้ unknown หากวันที่/timezone/route ไม่พอ

## Discovery summary status

| Status | ใช้เมื่อ | ห้ามตีความ |
| --- | --- | --- |
| not_checked | ยังไม่ได้ตรวจรายมหาวิทยาลัย | ไม่รับต่างชาติ |
| source_found | ยืนยันความเป็นแหล่งทางการและมี URL ที่เกี่ยวข้อง แต่ degree/cycle/detail ยังไม่ผ่าน reviewer | รับสมัครอยู่ตอนนี้ |
| needs_review | มี relevant official URL แต่ cycle/degree/facts ขัดแย้งหรือต้องตรวจเพิ่ม | ยืนยันผ่าน |
| verified_admissions | reviewer ตรวจ official international bachelor notice ของ cycle ล่าสุดที่พิสูจน์ได้ พร้อม cycle/detail/หลักฐาน ไม่มี critical conflict | ทุก program ผ่าน หรือ currently open |
| not_verified | พยายามตรวจแต่หลักฐานไม่พอ รวมกรณียังไม่มี qualifying official URL | มหาวิทยาลัยไม่รับต่างชาติ |
| no_current_admissions | มีคำยืนยันทางการชัดว่าไม่รับ international bachelor สำหรับ named cycle ที่ตรวจ | ไม่รับตลอดไป หรือค้นไม่เจอจึงไม่รับ |

ต้องมี admissionsUrl ใน source_found/needs_review/verified/no_current ตาม API ปัจจุบัน ถ้าไม่มี official URL ให้ not_verified พร้อม unresolved แทนการส่ง API ที่ผิด contract
Current/latest cycle ต้องอิงประกาศจริง: historical guide รับรองข้อเท็จจริงในอดีตได้ แต่ไม่ยก summary เป็น verified current เมื่อยังไม่มีหลักฐาน cycle ที่กำลังประเมิน แยก cycle coverage ของข้อมูลเก่า/ใหม่ใน detail
หลักฐาน PG-only/diploma/language-only ไม่ใช่ negative evidence ทั้งมหาวิทยาลัย อาจตรวจ scope นั้นแล้ว แต่ bachelor ยัง unknown
API เดิมแค่ตรวจปีใน note และ HTTPS จึงไม่ใช่ factual validator ห้ามถือ HTTP 200 ว่าหลักฐานผ่าน

## Review decision

`taskId`, `moeCode`, `inputVersion`, `reviewer`, `reviewType` (`independent`/`self`/`human`), `decision` (`accepted`/`changes_required`/`rejected`), `reviewedAt`, `claimDecisions` (scopeId/field/decision/evidenceIds/reason), `recommendedStatus`, `cycle`, `unresolved`. The importer stores the exact hashed row snapshot; it rejects changed input, and a replay is a no-op only while the source dataset and resulting MOE row still match the committed import.
รับ partial supported facts เก็บ historical ได้เมื่อแยก status/unknown ชัด; critical conflicting fact ห้าม approved/publish จนเคลียร์

## กรณีตัวอย่างจำลอง

ข้อความจำลอง: "International bachelor's applicants for 2026 must provide HSK Level 4. Deadline: 31 May 2026." อ่านวันที่ 2026-09-27
ผลที่ถูก: degree=bachelor, cycle=2026, HSK=4, deadline=2026-05-31 มี evidence เดียวที่ชี้ excerpt และ scope admission-2026; ไม่บอก open; ไม่มี 2027 proof จึง current cycle unknown ไม่เติม IELTS/ทุน
ตัวอย่างนี้ไม่มี university identity/URL จริง ห้ามนำเข้าเป็น university record

## การรักษาข้อมูลและความสด

null หมายถึง unknown ไม่ใช่คำสั่งล้าง fact เดิม ต้องมี explicit approved patch แยกจาก extracted package
เก็บ retrieved version/checksum/locator ไม่ทับ source versions; changed content สร้าง review ก่อนแก้ accepted claims
last-success กับ last-attempt แยกกัน fetch fail ไม่เปลี่ยน eligibility หรือ no_current และไม่ลบข้อมูลดี
source capture เป็นข้อมูลสาธารณะ แต่ไม่เก็บ credentials, student profile หรือ recovery codes ลง evidence/export
