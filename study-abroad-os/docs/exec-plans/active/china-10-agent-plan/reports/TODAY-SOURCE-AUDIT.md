# Source Audit: 2026-09-25

## Scope

วันนี้ตรวจลิงก์ทางการที่ผูกกับ 10 เส้นทางใน catalog และทำให้หน้าโปรแกรมแสดงลิงก์ทางการทั้งหมดของเส้นทางนั้น ได้แก่ ประกาศรับสมัคร เกณฑ์คุณสมบัติ และประกาศทุนที่มีใน catalog

ระบบไม่ได้คัดลอกเว็บไซต์มหาวิทยาลัยทั้งหมดลงฐานข้อมูล เพราะข้อมูลจะเก่าเร็วและอาจผิดเงื่อนไขการใช้งาน เว็บไซต์ต้นฉบับยังเป็นแหล่งจริง ส่วนระบบเก็บ URL, เวลาเช็ก, HTTP status, hash/snapshot และคิว review เมื่อเนื้อหาเปลี่ยน

## Live checks

ตรวจพบหน้าทางการที่เข้าถึงได้จากโดเมนมหาวิทยาลัยสำหรับทั้งชุด 10 แห่ง โดยหลักฐานการค้นหาสดที่ตรวจละเอียดในวันนี้มีดังนี้:

- Peking University: 2026 Undergraduate Program Entrance Examination และหน้า Undergraduate Program
- Fudan University: 2026 undergraduate notices และ 2026 English-taught program list
- Shanghai Jiao Tong University: 2026 International Undergraduate Admissions brochure
- Zhejiang University: 2026 Application Guide and international admissions pages
- Xiamen University: 2026 Undergraduate Admission Guide
- Tongji University: 2026 undergraduate guide and application timelines
- East China Normal University: official Admission page
- Beijing Language and Culture University: official Entry Requirement page
- University of International Business and Economics: International Undergraduate Programs page
- Shandong University of Finance and Economics: 2026 undergraduate brochure and special scholarship guide

Live search results are evidence of reachable official pages, not automatic approval of every catalog fact. Conflicts and unverified fields remain marked as unknown/conflict until a reviewer approves them.

## Code change

`web/src/lib/official-links.ts` now derives a unique official-link list from the existing catalog without changing the database schema. The program detail panel displays every attached official link and opens it in a new tab.

## Remaining acceptance work

- Run the source cron against the configured database and inspect changed/error counts.
- Review changed source snapshots in `/admin`; source changes must not auto-publish.
- Complete Q02 automated authenticated browser flow when disposable student/admin fixtures are available.
- Q04, Q05, L01 and L02 remain human/release-owner gates; they must not be marked complete by simulation.
