# Pilot และแผนประเมิน

## วัตถุประสงค์

พิสูจน์ workflow ก่อนขยายทั้งประเทศ ไม่ใช่สัญญาว่าพรอมป์ต์รับรองความถูกต้องได้เอง ข้อมูลจริงจาก pilot เก็บเป็น evidence แยก ส่วน eval-cases.json เป็น synthetic cases ไม่ส่งเข้าฐานมหาวิทยาลัย

pilot-batch.json มี 10 แห่งในกานซู่ที่ `not_checked` เมื่อ 2026-09-27 และหนึ่ง reserve ต้องเช็กฐานอีกครั้งก่อน dispatch ไม่อ้างว่ารายการเหล่านี้รับต่างชาติแล้ว
เลือกจาก pending จริงเพื่อไม่ทำงานเดิมซ้ำ แต่จังหวัดเดียวอาจไม่แทนเว็บทั้งประเทศ หลัง pilot ให้เลือก stratified sample ต่างจังหวัด/HTML/PDF text/scanned PDF/JS/blocked/ชื่อคล้ายกันก่อนขยายความเร็ว
อย่าบังคับให้พบ OCR case ถ้าเอกสารจริงไม่มี เพิ่ม fixture ที่ระบุ synthetic หรือเพิ่ม source งานแยกพร้อมเหตุผล

## ขั้นตอน

1. S0/S1 บันทึก baseline จำนวน record ค้าง เวลาค้นด้วยคนจาก log จริง และเครื่องมือ/model config ที่มีจริง ใช้สองกลุ่มเทียบเคียงหรือ crossover ที่คนตรวจไม่รู้คำตอบก่อนเพื่อควบคุมผลจากความคุ้นเคย
2. R ทีละมหาวิทยาลัย ส่ง X ทีละ source แล้ว V เปิดตรวจ critical facts ทุกข้อ อ่าน attachment ที่เป็นส่วนสำคัญ
3. รัน synthetic eval ให้ Agent ได้เฉพาะ scenario/input ไม่ให้เห็น expected เป็นคำตอบที่จะลอก evaluator เก็บผลจริงก่อนเทียบ expected
4. เพิ่ม adversarial case เช่น website instruction injection, stale cycle, graduate-only, OCR ambiguous และ conflicts ตรวจด้วย reviewer
5. ทำ importer บน temporary database แล้วนำ approved pilot เข้า local DB ผ่าน single writer และ backup/read-back
6. ส่ง pilot report ว่าเครื่องมือใดลดเวลางานส่วนใด พร้อม errors/ข้อจำกัด ตัดสินใจปรับ prompt/เพิ่ม review/ลดขนาด task ก่อน nationwide

## Metrics ที่ต้องวัดจริง

| Metric | วิธีวัด |
| --- | --- |
| Research coverage | processed MOE codes / assigned MOE codes ไม่เรียกว่า admissions accuracy |
| Official link precision | ลิงก์ที่ reviewer พิสูจน์เจ้าของได้ / ลิงก์ที่ Agent อ้าง official |
| Critical claim precision | ข้อสำคัญที่ reviewer ยืนยันจาก original source / ข้อสำคัญที่ Agent ยืนยัน |
| Missing facts | สิ่งที่ reviewer พบใน source เดียวกันแต่ extraction ตกหล่น แยก unknown ที่ source ไม่กล่าว |
| Manual correction time | เวลาเปิดตรวจ/แก้จริง รวม research+review ไม่ดูแค่ response latency |
| Source access rate | fetch success / attempted sources พร้อม blocked/OCR/JS breakdown |
| Tokens/cost | usage จริง ถ้า tool ไม่คืน usage ให้ unavailable ไม่เดาเป็นศูนย์ |
| Freshness | last successful fetch, last review, changed/error/source coverage |

เป้าหมายทดลอง: ลดเวลาที่คนต้องใช้รวมอย่างน้อย 30% เทียบ baseline โดยไม่เพิ่มข้อผิดพลาดสำคัญ นี่เป็นเป้าหมายทดสอบ ไม่ใช่ผลที่ได้แล้ว
ถ้าไม่มี baseline ที่เทียบกันได้ ให้รายงานเวลาที่สังเกตจริงและยังสรุปเปอร์เซ็นต์ประหยัดไม่ได้

## Gate ก่อน nationwide

- ไม่มี false positive ที่อ้าง official/current foreign bachelor/ทุน bachelor/เกณฑ์ผ่านโดยไม่มีหลักฐานในผลสุดท้ายที่รับรอง
- ทุก critical claim สอดคล้อง scope/cycle และ reviewer เปิดตรวจจริง ต้องมี citation coverage 100% สำหรับ facts ที่รับรอง ไม่หมายถึงโลกจริงครบ 100%
- unknown/conflict ไม่ถูกกลบ ทุกความผิดพลาดที่พบมี feedback และ rerun บัตรที่กระทบ
- eval cases ผ่านทั้งหมดหรือคง gate ไม่ผ่านพร้อมระบุ failure ห้ามแก้ expected เพียงเพื่อให้ผลผ่าน
- 10 tasks มีผลครบแม้เป็น not_verified โดยต้องรายงาน separately ว่ากี่แห่งรับรองได้ ไม่บอกลิงก์ครบเมื่อยังไม่ครบ
- import duplicate/rollback/stale input/preserve old value/backup restore ผ่านด้วย temporary DB tests ที่รันจริง
- เจ้าของรับทราบความเสี่ยงของผลทดลองและข้อมูลสำคัญก่อนใช้ตัดสินใจสมัคร

## รายงานท้ายโครงการ

รายงาน 5 ส่วน: ภาพรวมระบบจริง, งานทั้งหมดเรียงก่อนหลัง, Dependency Graph, งานขนาน, แผนตรวจรับก่อน Deploy ตาม START-ASTRA.md และสถานะจริง ไม่คัดแผนเก่ามาเป็นผลงานใหม่
แนบ nationwide CSV/JSON/evidence index/unresolved/freshness/restore reports ที่สร้างจริง พร้อม local paths ที่เปิดตรวจได้
technical work, verification, owner approval และ publication ต้องมีสถานะแยก ถ้าเข้าถึงบางเว็บไม่ได้ ให้บอกว่ายังไม่ครบและคิวติดตาม ห้ามเปลี่ยนความหมายของ "ทั้งหมด" เพื่อปิดงาน

## สถานะชุดพรอมป์ต์นี้

static artifact audit ตรวจเอกสาร/JSON/graph/identity ได้เท่านั้น ยังไม่มี live model pilot, benchmark, nationwide verification หรือ monitoring ที่เพิ่มจากชุดนี้ ต้องไม่ใช้ static audit แทน metrics ด้านบน
