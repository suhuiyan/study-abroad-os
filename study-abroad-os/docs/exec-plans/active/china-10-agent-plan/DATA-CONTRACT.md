# Proposed Data Contract
สถานะ: ข้อกำหนดตั้งต้นสำหรับ B01; ยังไม่ใช่ schema ที่ implement แล้ว.
Version: proposed-v1. B01 สร้าง contracts/release-contract.md ที่ freeze แล้ว.

## ขอบเขต
หนึ่ง record ปัจจุบันต่อหนึ่งเส้นทางหรือหลักสูตรจากแต่ละมหาวิทยาลัย 10 แห่ง. ไม่เท่ากับทุกสาขา.
ปี 2027 เป็น target ที่ต้องค้นประกาศ; ไม่มีหลักฐานใหม่ให้คงปีเดิมและระบุ unknown ของปีใหม่. ไม่จำเป็นต้องมีครบทุกค่าเพื่อปิดงาน research แต่ทุกค่าต้องมีสถานะที่อธิบายได้.

## Evidence ledger
ทุก field เก็บ:
- record/program ID, fieldPath, originalText แบบสั้นเท่าที่จำเป็น, normalizedValue, unit/currency
- admissionYear, month/season, applicationRound, program/route scope, nationality scope, language
- status: verified | unknown | conflict | not_applicable
- unknownReason: not_announced | not_found_in_checked_sources | source_unreachable | contradictory | applicability_unclear
- sourceUrl, official organization/domain, documentTitle, publishedAt ถ้าพบ
- locator: heading/table row หรือ PDF page; retrievedAt พร้อมเขตเวลา
- verifiedAt, reviewer ID, review report path (เว้นว่างจน Vxx ตรวจรับ)
- previousValue, proposedValue, reasonForChange และ evidence references
fetchedAt บอกเวลาเข้าถึง ไม่ได้ยืนยันความจริง; verifiedAt บอกเวลาตรวจรับโดย reviewer.
Research worker ใส่ proposed status ได้ แต่ production verified ต้องมี review verdict.
บันทึก paraphrase และ short excerpt เท่าที่จำเป็น ไม่คัดทั้ง PDF ลงรายงาน.

## Admission checklist
ชื่อทางการอังกฤษ/จีน, ชื่อไทยที่แปล, city, degree level, admission route, program, language, duration.
ปี/รอบเปิดและปิดสมัคร พร้อมเวลาถ้ามี; date-only ต้องไม่สร้างเวลา 23:59 โดยไม่มี policy ที่อธิบาย.
วุฒิ ม.6/IB/A-Level/Foundation/other, GPA scale ถ้ามี, สัญชาติ/ประวัติสัญชาติตามประกาศ, อายุและ reference date, ผู้เยาว์.
HSK level/score, IELTS overall/min band, accepted alternatives/exemptions, score validity และ reference date.
CSCA role: admission-required / scholarship-only / not-required-with-evidence / unknown; subjects/language/date/score เฉพาะที่ประกาศ.
tuition, currency, per year/semester/total, academic year, application fee, bundles. ห้ามแยก tuition จาก bundle โดยเดา.
documents required/conditional, official application URL, contact/reference link ที่ประกาศ.
หลายสาขาที่กฎไม่เหมือนกันให้ระบุ need-program-selection; ห้ามค่า minimum กลางที่ใช้กับทุกสาขา.

## Scholarship checklist
scholarship name, provider, degree/program/language/intake applicability, Thai/international eligibility.
tuition waiver, stipend amount/unit/duration, housing, insurance, excluded costs และ quota ถ้าประกาศ.
qualification/age/reference date/language/CSCA requirements, renewal, competing scholarship restrictions.
application route, separate form, start/end dates/zone, selection vs guaranteed entitlement.
แต่ละทุนอาจใช้ source/cycle ต่างจาก admission; ต้องมี provenance ของตัวเอง.
not_found_in_checked_sources ไม่เท่ากับ 'ไม่มีทุนในมหาวิทยาลัย'.

## Publication contract ที่เสนอ
source snapshot -> changed/baseline event -> pending review -> draft -> validated approve/reject -> immutable revision -> published program.
Daily fetch ไม่แก้ program facts โดยตรง. baseline fetch ไม่ควรติดป้ายข้อเท็จจริงเปลี่ยน.
ที่ field unknown: เก็บ null/empty ตาม adapter พร้อม reason; ไม่มี 0 หรือ guessed date ใช้แทน unknown.
critical fields ที่ขัดแย้งไม่ publish เป็น verified; publish unknown พร้อมเหตุผลได้เมื่อ reviewer ยอมรับ representation.
approval ใช้ base revision + actor + timestamp + before/after + evidence links และ transaction.
หน้าต้นทางเปลี่ยน URL ให้ keep history ของ URL เดิม. บทสรุป stale policy ต้องตกลงใน B01 และทดสอบ ไม่ hardcode freshness SLA จากการคาดเดา.

## Extraction ในรอบนี้
ผู้วิจัย/ผู้ดูแลอ่านต้นฉบับและลง structured draft. ไม่มี AI extraction pipeline ที่ทำงานอัตโนมัติใน baseline.
ถ้าจะเพิ่ม AI extraction ภายหลัง ต้องกำหนด provider, budget, evaluation และสิทธิ์ก่อน เป็นงานนอกแผน 52 ใบงานนี้.

## Research completion checklist
ทุก checklist field มี value+evidence หรือ explicit unknown/conflict/not_applicable.
Search trail ระบุหน้าที่ตรวจ ปีในเนื้อหา และจุดที่ยังหาไม่พบ.
ใช้ official university/provider/government เป็น final authority; aggregator ใช้ค้นลิงก์ได้แต่ไม่ใช้ยืนยัน.
ลิงก์ที่เปิดไม่ได้ไม่ถือว่า university ไม่รับสมัคร; ทำ source_unreachable.

