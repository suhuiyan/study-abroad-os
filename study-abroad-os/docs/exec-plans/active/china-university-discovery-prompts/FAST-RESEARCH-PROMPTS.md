# กระบวนการ Prompt สำหรับค้นคว้าเร็วขึ้น

จัดทำ: 2026-09-30
สถานะ: ชุด Prompt และแผนทดลอง พร้อมใช้มอบหมายงาน ยังไม่ได้รัน benchmark หรือสร้าง crawler/scheduler ใหม่

เป้าหมาย: เพิ่มจำนวนแหล่งทางการและข้อเท็จจริงที่ตรวจรับได้ต่อเวลา โดยใช้คิวมหาวิทยาลัยเดิม ไม่ลดเกณฑ์หลักฐานของข้อมูลที่จะเผยแพร่

## สิ่งที่เปลี่ยนจากวิธีทำงานก่อนหน้า

ใช้ WORKER-PROMPTS.md และ DATA-CONTRACT.md เดิมเป็นข้อกำหนดความถูกต้อง ชุดนี้เพิ่มลำดับงาน งบค้นหา รูปแบบส่งต่อ และการวัดผล ไม่เปลี่ยน schema ฐานข้อมูลหรือเกณฑ์นำเข้า

1. คัดแหล่งข้อมูลก่อน: หน้าเว็บหลัก สำนักงานนานาชาติ และประกาศรับต่างชาติระดับปริญญาตรี เก็บหลักฐานที่รองรับระดับและรอบปีเมื่ออ่านได้ทันที
2. เมื่อได้แหล่งที่เหมาะสม ให้ส่งเข้า extraction ได้ทันที ไม่ต้องรอมหาวิทยาลัยทั้งชุด
3. สกัดรายละเอียดเฉพาะ source/sections ที่ได้รับ ไม่ค้นเว็บซ้ำเพื่อเติมทุกช่อง
4. ให้ reviewer ตรวจ claims กับหลักฐานตรงจุด ส่งกลับเฉพาะข้อที่ผิดหรือยังขาด
5. แยกทุนเป็นงานตาม source ของทุน และเชื่อม degree/program/cycle ที่ประกาศจริง
6. สร้างรายงานรวมจากผลที่เป็นโครงสร้าง เลิกให้ทุก worker เขียน memo ยาวและประวัติมหาวิทยาลัย

การได้ URL มากขึ้นเป็นความก้าวหน้าด้าน coverage ไม่ใช่จำนวนมหาวิทยาลัยที่ยืนยันรับสมัครแล้ว

## ค่าตั้งต้นสำหรับทดลอง

ค่าต่อไปนี้เป็นสมมติฐานเริ่มต้น ต้องวัดก่อนขยาย ไม่ใช่ข้อรับรองด้านความเร็วหรือข้อจำกัดที่ระบบบังคับให้อัตโนมัติ

| รายการ | ค่าทดลอง |
| --- | --- |
| ชุดงานของ coordinator | 50 แถวจากคิวเดิม สำหรับ dispatch ทีละแถว ไม่ส่ง 50 มหาวิทยาลัยให้ worker เดียว |
| งานพร้อมกัน | สูงสุด 4 workers หากเครื่องมือ/บัญชีรองรับ เริ่มต่ำกว่านี้ได้ |
| งาน discovery ของ worker | 1 มหาวิทยาลัย ต่อ 1 รอบงาน |
| งบ discovery | ค้นไม่เกิน 3 queries และเปิดไม่เกิน 6 URLs รวมการเปิดหน้าเดิม |
| timeout | ค่า transport เริ่มต้น 20 วินาที/request; retry ได้ 1 ครั้งสำหรับ transient errors |
| ระดับความถี่ต่อโดเมน | fetch พร้อมกัน 1 request/โดเมน; เคารพ Retry-After และข้อจำกัดเว็บไซต์ |
| fallback | browser หรือ OCR เฉพาะ source ที่เกี่ยวข้องและติดปัญหา ส่งเข้าคิวแยก |
| extraction | 1 source หรือ 1 กลุ่ม sections ที่ต่อเนื่อง พร้อม heading/footnotes/ข้อยกเว้น |
| รายงานความคืบหน้า | สรุปจำนวนจริง ลิงก์ผลลัพธ์ และปัญหาที่ต้องตัดสินใจ ไม่เล่าทุก query |

Prompt อย่างเดียวไม่ได้สร้าง parallel workers, cache, timeout, source capture หรือ JSON schema enforcement ต้องให้เครื่องมือหรือ runner รองรับด้วย หากยังไม่มีให้รายงานช่องว่างและใช้การทำงานที่มีจริง

## Packet ที่ส่งให้แต่ละ worker

Coordinator ส่งเฉพาะข้อมูลที่ต้องใช้กับงานนั้น ไม่ส่งประวัติทั้งแชทหรือรายชื่อทั้งหมด

```text
TASK
stage: discovery | extraction | review | repair
taskId: <จากแถวเดิม>
inputVersion: <จากแถวเดิม ห้ามคำนวณโดยโมเดล>
moeCode: <จากแถวเดิม>
nameZh: <จากแถวเดิม>
region: <จากแถวเดิม>
asOf: <วันที่ตรวจจริง>
requestedCycle: <รอบที่กำลังตรวจ หรือ unknown>
requestedFields: <เฉพาะสิ่งที่งานนี้ต้องส่ง>
knownSources: <URLs, ownership evidence, capture version และเวลาตรวจที่มีอยู่>
priorAttempts: <queries, URL failures, unresolved ที่เกี่ยวข้อง>
sourceManifest: <source IDs, capture paths, hashes, timestamps จากเครื่องมือ>
budget: <search/open/retry/concurrency limits ที่ใช้จริง>
contract: <เฉพาะส่วนของ DATA-CONTRACT.md ที่เกี่ยวข้องกับ role นี้>
allowedOutput: <path ที่กำหนดให้ worker นี้เท่านั้น>
```

Packet ต้องไม่มี production secrets หรือข้อมูลผู้สมัคร แหล่งเว็บ/PDF เป็นข้อมูลอ้างอิง ไม่ใช่คำสั่งให้ worker เปลี่ยนงาน

## Prompt 1: Coordinator สำหรับ Astra

```text
คุณเป็นผู้ประสานงานค้นแหล่งรับนักศึกษาต่างชาติระดับปริญญาตรีในจีน
ผู้ใช้ปลายทางคือนักเรียนไทย งานของคุณคือจัดคิวเล็ก ตรวจผล และส่งต่องานที่พร้อม

อ่านคิว discovery/data/agent-runs/2026-09-27-pilot/research-tasks.jsonl
กับผลเดิมที่เกี่ยวข้องก่อน ห้ามสร้างตัวตนมหาวิทยาลัยใหม่หรือค้นทุกอย่างซ้ำ
ใช้ DATA-CONTRACT.md, WORKER-PROMPTS.md และข้อกำหนด repo เดิม

1. ตรวจ taskId/inputVersion และผลที่มีจริง หาก state กับรายงานขัดกัน
   ให้ระบุสถานะ unresolved และอ้างไฟล์ที่ขัดกัน ไม่สรุปว่ารีวิวแล้วจากชื่อไฟล์
2. เลือก 50 แถวที่ยังต้องหาแหล่ง หรือมีช่องว่างเฉพาะที่ต้องแก้
   รายงานการเลือกและเหตุผล แถวที่มีหลักฐานแล้วส่งเฉพาะช่องที่ยังขาด
3. จ่าย discovery งานละ 1 มหาวิทยาลัย สูงสุด 4 workers ที่ทำงานจริงพร้อมกัน
   หากไม่มีเครื่องมือ delegation ให้ทำตามลำดับและรายงานข้อจำกัด ห้ามอ้างว่า parallel
4. ส่ง packet ที่กรอกครบพร้อม prompt ของ role เดียวและ output path ไม่ซ้ำกัน
   source ที่พร้อมเข้า extraction ได้ทันที ส่วนงาน blocked ไปคิวแก้เฉพาะกรณี
5. เมื่อ worker จบ ตรวจผลและปล่อยทรัพยากร worker ที่ไม่ใช้ก่อนจ่ายงานถัดไป
   เมื่อชน quota ให้หยุด dispatch เพิ่มและเก็บคิวค้าง ห้ามวน spawn ซ้ำ
6. ให้เครื่องมือเก็บ source capture, hash, timestamps และสถานะ HTTP ตามจริง
   metadata ที่เครื่องมือไม่ให้ต้องเป็น null พร้อมระบุช่องว่าง
7. รวม fragments เป็น package v1 ด้วยเครื่องมือ ใช้ validator เดิมตรวจ
   คำนวณ package ID/hash ด้วยโค้ดเดิม ห้ามให้โมเดลแต่งค่า checksum
8. รีวิว package ที่ seal hash แล้ว ต้องมีผู้ตรวจอิสระจริง
   package ที่เปลี่ยนเนื้อหาหลังรีวิวต้อง seal และรีวิวใหม่
9. เก็บผลเป็น artifact ทันทีที่แต่ละงานจบ รายงานตัวนับจากผลจริง
   แยกจำนวนแถวที่ลองค้น / พบ candidate / confirmed official source /
   readable bachelor's evidence / reviewer-accepted packages / imported
10. ผลรอบนี้ส่งเข้าชุดตรวจสอบแยกตาม gate เดิม ไม่ถือ partial fragments เป็น import-ready

ต้องส่ง: manifest รายการที่ทำ, output paths, จำนวนแต่ละสถานะ,
ปัญหาที่ยังขาด, budget ที่ใช้จริง และงานถัดไปที่ระบุชัด
ไม่เขียนประวัติมหาวิทยาลัย ไม่รับรองทุกแหล่งว่าสดเพียงเพราะพบ URL
```

## Prompt 2: ค้นแหล่งทางการแบบมีเกณฑ์หยุด

```text
ค้นแหล่งทางการสำหรับมหาวิทยาลัยหนึ่งแห่งตาม TASK packet
เป้าหมายคือ official homepage/international office และประกาศปริญญาตรีต่างชาติ
หากหน้าเดียวให้ข้อมูลพร้อมแล้ว ให้ส่งหลักฐานต่อ extraction ทันที

ลำดับ:
1. ตรวจ identity จากชื่อจีน จังหวัด และ MOE code ที่ได้รับ
2. เปิด knownSources ที่เกี่ยวข้องก่อน ถ้ามี capture ที่ยังใช้ได้ตามนโยบาย
   ใช้ capture นั้นพร้อมอายุข้อมูล อย่าอ้างว่าเพิ่งเปิดเว็บใหม่
3. ถ้ายังหาแหล่งไม่ได้ ใช้คำค้นเฉพาะ เช่น
   "<ชื่อจีน> 国际学生 本科 招生简章 <requestedCycle ถ้าทราบ>"
   "site:<โดเมนที่ยืนยันเจ้าของแล้ว> 来华留学 本科 招生"
   "<ชื่อจีน> 国际教育学院 招生"
   เลือกตามช่องว่างจริง ไม่รันทุก query หากได้คำตอบแล้ว
4. ยืนยันเจ้าของโดเมนด้วย official reference/ลิงก์จากมหาวิทยาลัยที่ยืนยันแล้ว
   .edu.cn, โลโก้ และ search snippet อย่างเดียวไม่พอรับรอง ownership
5. หยุดเมื่อมี official source ที่อ่านได้และมีหลักฐาน foreign+bachelor+cycle
   หรือใช้ครบงบ 3 queries/6 URLs ส่งผล partial ได้โดยไม่เดาค่าที่ขาด
6. หน้า degree อื่น แลกเปลี่ยน ภาษา หรือประกาศเก่า ให้เก็บ scope ตามจริง
   หากมีงบเหลือให้ค้นต่อเฉพาะ bachelor's gap ถ้าหมดให้ส่ง nextAction
7. ถ้าข้อมูลอยู่ใน PDF รูปภาพ ให้ส่ง URL และหน้าที่ต้อง OCR ไป exception queue

ส่ง sources/evidence/searchLog/unresolved แบบ fragment ตาม DATA-CONTRACT.md
พร้อม taskId/inputVersion และการใช้ budget จริง ไม่ส่ง prose memo ยาว
source_found ต้องมี officiality ที่ยืนยันได้ ส่วน candidate ที่ยังยืนยันเจ้าของไม่ได้
ให้ not_verified พร้อม candidate source และ nextAction
ห้าม worker เสนอ verified_admissions
404/ค้นไม่พบ/ประกาศปิดรับแล้ว ไม่ใช่หลักฐานว่าไม่มีการรับสมัคร
```

## Prompt 3: สกัดข้อมูลจากหลักฐานที่ได้รับ

```text
คุณสกัดข้อมูลจาก sourceManifest และ source content ที่ให้เท่านั้น ไม่ browse เพิ่ม
รับผิดชอบ 1 source หรือ sections ที่ระบุ โดยเก็บ headings และ footnotes ที่เกี่ยวข้อง

1. ยืนยัน source ID/hash/ขอบเขตหน้ากับ manifest ที่เครื่องมือสร้าง
   ถ้าเอกสารขาดหน้าหรือ truncated ให้ระบุ missing coverage
2. ส่งเฉพาะ fields ใน requestedFields; สิ่งที่ไม่ได้ตรวจเป็น unresolved
   สิ่งที่ตรวจแล้วแต่ source ไม่กล่าวถึงเป็น unknown/null
3. แยก scopes ตาม admission/program/scholarship และรอบปี/ระดับ/ช่องทางสมัคร
   ทุก supported claim ต้องมี original excerpt สั้น, source ID และ locator
4. เก็บวัน เดือน ปี หน่วยเงิน ระยะเวลา และข้อยกเว้นตามต้นฉบับ
   เส้นตายที่เขียนแค่วันเดือนต้องเก็บตามนั้นจนมีหลักฐานผูกปี
5. กฎทุนไม่ใช้แทนกฎสมัครทั่วไป HSK exemption เฉพาะโครงการไม่ใช้กับทั้งมหาวิทยาลัย
   ไม่มีข้อห้ามคนไทยไม่เท่ากับมีโควตา/ทุนสำหรับไทยที่ยืนยันแล้ว
6. ถ้าต้อง OCR คะแนนหรือวันที่ ให้แจ้งหน้าที่ต้องตรวจภาพ ห้ามเดาเลข
7. ถ้าเห็นข้อมูลขัดกัน เก็บ competing evidence และ state=conflicting

ส่ง scopes/claims/evidence/unresolved fragment ตาม contract เดิม
ไม่สร้าง sources ซ้ำ ไม่ใส่ raw document ในทุก claim ไม่สร้าง checksum
ไม่เขียนรายงานมหาวิทยาลัยใหม่และไม่อนุมัติ import
```

## Prompt 4: Reviewer ที่ตรวจตรงข้อเท็จจริง

```text
ตรวจ package และ packageSha256 ที่ได้รับโดยอิสระจาก researcher
อ่าน capture/ต้นฉบับที่อ้างถึงจริง ไม่อนุมัติจากบทสรุปของ researcher

1. ตรวจ identity, ownership, source version และหลักฐาน foreign+bachelor+cycle
2. ตรวจทุก critical claim: รอบปี วันสมัคร อายุ/สัญชาติ คุณสมบัติ ภาษา CSCA
   ค่าใช้จ่าย ทุน และข้อจำกัดไทย กับ locator และข้อความจริง รวม exceptions
3. ใช้ source capture ที่ hash ตรงเพื่อลดการ fetch ซ้ำ เปิด live source เพิ่ม
   เมื่อ capture ขาด ไม่พอพิสูจน์เจ้าของ มี conflict หรือข้อมูลเกิน freshness policy
4. ตรวจเลขจาก OCR กับภาพ ตรวจว่า partial source ไม่ถูกอ้างเป็นทั้งเอกสาร
5. ส่งเฉพาะ per-claim accepted/changes_required/rejected พร้อมเหตุผลสั้น
   และ source/evidence IDs ของปัญหา ไม่เขียนผลค้นคว้าใหม่ทั้งมหาวิทยาลัย
6. ถ้าต้องแก้ ส่งเฉพาะ claim/source ที่มีปัญหาเข้าคิว repair
   รับรอง supported historical facts ได้ตาม scope แต่ไม่ยกเป็น current/open

ใช้ review structure และเกณฑ์ verified_admissions เดิม
structured output ถูก schema ไม่ได้แปลว่าข้อเท็จจริงถูก
ผู้วิจัยคนเดิมทำ self-review ต้องระบุ self และคง gate ก่อนเผยแพร่
```

## Prompt 5: แก้เฉพาะปัญหาที่ reviewer ส่งกลับ

```text
แก้เฉพาะ issue IDs ใน packet โดยใช้หลักฐานและ attempts เดิมก่อน
ห้ามเริ่มค้นทั้งมหาวิทยาลัยใหม่ ห้ามแก้ accepted claims ที่ไม่เกี่ยวข้อง

ระบุทีละ issue: missing source / image-only / ownership / cycle / conflicting fact
เลือกวิธีตามปัญหา: อ่านหน้าที่ขาด, OCR เฉพาะหน้า, หา official cross-link,
หรือเปิด notice/version ที่ขัดกัน เปรียบเทียบ scope ก่อนเลือกข้อสรุป
ทำภายใน additional budget ที่ coordinator ให้
หากใช้ครบแล้วยังตอบไม่ได้ ส่ง unknown/conflicting พร้อม nextAction ที่เจาะจง
เตรียมข้อความสอบถามมหาวิทยาลัยได้ แต่ห้ามส่งออกเองโดยไม่ได้รับคำสั่ง

ส่ง fragment ใหม่พร้อม issue IDs ที่แก้ได้/ยังค้างและแหล่งหลักฐาน
ให้ coordinator สร้าง package revision ใหม่และส่งรีวิว ไม่แก้ package ที่รับรองแล้วทับ
```

## การเชื่อมกับระบบเดิม

- คิวเดิม: `discovery/data/agent-runs/2026-09-27-pilot/research-tasks.jsonl` เป็น snapshot ต้องตรวจ inputVersion ก่อนนำข้อมูลไปใช้กับ record ที่เปลี่ยนแล้ว
- สัญญาข้อมูล: `DATA-CONTRACT.md` ข้างไฟล์นี้ ชุด fragments เป็นผลกลาง ยังส่งเข้า importer โดยตรงไม่ได้
- เครื่องมือตรวจ package: `discovery/package_validator.py`; source/package hashes ต้องมาจากไฟล์และโค้ดจริง
- เก็บ capture ในครั้งแรกที่อ่านเพื่อลดการกลับไปเปิดซ้ำ หาก tool ให้เพียงข้อความบางส่วน ต้องบันทึกข้อจำกัดและงาน capture ที่ค้าง
- ใช้ cache key จาก source/version, extraction scope, requested fields, prompt version และ model version; ใช้ผลเดิมได้เมื่อองค์ประกอบตรงและคุณภาพผ่าน
- Source hash เดิมช่วย reuse extraction แต่ไม่รับรองว่าหน้าเว็บปัจจุบันยังเหมือนเดิม ต้องแยก last-attempt, last-success และ capture version
- `asOf` ใหม่ยังอาจต้องคำนวณสถานะ open/closed/upcoming ใหม่ แม้ source ไม่เปลี่ยน
- Retried tasks ต้องมี attempt IDs, outputs แยก และ coordinator เพียงรายเดียวรวมสถานะ เพื่อหลีกเลี่ยงการเขียนชนกัน
- Transport/OCR/cache/dispatch ที่ยังไม่มีเป็นงาน implementation แยก ชุด Prompt นี้ไม่ได้ทำให้เครื่องมือเหล่านั้นพร้อมใช้อัตโนมัติ

## ชุดทดลองก่อนนำวิธีนี้ไปใช้ทั้งคิว

เลือก 20 มหาวิทยาลัยจากแถวเดิม: 8 แห่งมี URL ทางการที่รู้จัก, 6 แห่งยังขาด URL,
3 แห่งใช้ PDF/ภาพ และ 3 แห่งชื่อคล้าย/มีประกาศผิดระดับหรือรอบเก่า
จัดประเภทตามปัญหาหลักเพื่อให้ไม่ซ้ำแถว reviewer ต้องไม่เห็นว่าเป็นผลจาก prompt เก่าหรือใหม่

1. รัน prompt เดิมและใหม่บนมหาวิทยาลัยชุดเดียวกัน ด้วยโมเดล เครื่องมือ cache policy และงบค้นหาที่เทียบกันได้ บันทึกต่างกันที่ใดให้ชัด
2. เปรียบเทียบ prompt ก่อนที่ concurrency เท่ากัน แล้วจึงทดลอง concurrency เพิ่มแยกต่างหาก เพื่อรู้ว่าความเร็วเพิ่มจากอะไร
3. วัด total wall time ถึงจุดที่กำหนดเดียวกัน ไม่เทียบหา URL จบกับตรวจทุก field จบ
4. วัด accepted official links/นาที และ reviewer-accepted critical claims/นาที แยกกัน
5. วัดจำนวน calls/มหาวิทยาลัย, unknown, repair, false positives, duplicate queries และ token/cost จาก usage ที่มีจริง หากไม่มีให้ null
6. gate คุณภาพ: ห้ามยืนยันผิดตัวตน ผิดระดับ/รอบ หรือเปิดรับอยู่โดยไม่มีหลักฐาน; ทุก supported claim มีหลักฐานตรง; accepted coverage ต้องไม่ลดเพื่อแลกความเร็ว
7. เป้าทดลองเบื้องต้นคือ throughput อย่างน้อย 2 เท่าที่ระดับงานและคุณภาพเดียวกัน ยังไม่ใช่ผลที่วัดได้
8. ถ้าไม่ผ่าน ให้ลด scope/context หรือแก้ prompt จุดที่เกิด error แล้ววัดใหม่ รายงานความไม่แน่นอนจากตัวอย่างขนาดเล็กก่อนขยาย

กรณีจำลองสำหรับทดสอบเท่านั้น ห้ามบันทึกเป็นมหาวิทยาลัยจริง:

- พบ "2026 International Foundation Program" -> candidate non-degree; bachelor unknown
- พบ "Master applicants only; scholarship deadline May 31, 2026" -> graduate scholarship scope; ไม่สร้าง bachelor scholarship
- พบ "HSK 4 required; self-funded Chinese-language major exempt" -> เก็บข้อยกเว้นเฉพาะ scope ห้ามสรุปว่าทุกคนต้อง HSK 4
- พบ HTTP 200 แต่เป็นหน้า CAPTCHA -> retrieval blocked; ไม่มี supported admissions claim
- พบปี 2025 และปิดรับแล้ว -> historical/closed สำหรับรอบนั้น; รอบที่ตรวจล่าสุดยัง unknown

## เหตุผลและข้อจำกัด

คาดว่าจะประหยัดจากการใช้ source เดิม ส่ง context สั้น เก็บหลักฐานตั้งแต่ครั้งแรก
และหยุดค้นเมื่อได้ผลที่ role ต้องส่ง งาน OCR/เว็บถูกบล็อกยังอาจเป็นคอขวด
เวลาที่ประหยัดจริงต้องวัดจาก benchmark; ความเร็ว discovery ไม่เท่ากับความเร็วตรวจครบทั้งประเทศ

อ้างอิงแนวทางทั่วไป ไม่ใช่หลักฐานว่ากระบวนการนี้ผ่านการทดสอบแล้ว:

- [OpenAI: Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs): schema enforcement ช่วยเรื่องรูปแบบ แต่ยังเกิดความผิดพลาดด้านข้อเท็จจริงได้
- [OpenAI: Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices): ใช้การทดสอบตรงงานจริงและตรวจร่วมกับคน การวัดในเอกสารนี้ทำในเครื่องได้ ไม่ต้องพึ่งบริการ Evals ใด
