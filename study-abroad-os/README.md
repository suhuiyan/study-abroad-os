# Study Abroad OS

MVP สำหรับนักเรียนไทยที่ต้องการเรียนปริญญาตรีในประเทศจีน ผู้ใช้ค้นหาหลักสูตรและทุนจากมหาวิทยาลัยชุดแรก 10 แห่ง ตรวจคุณสมบัติเบื้องต้น บันทึกตัวเลือก และสร้างแผนสมัครได้ในที่เดียว

## Current phase
MVP implementation and source verification. The frontend, authentication, PostgreSQL schema, first catalog, eligibility checker, shortlist, and application planner are implemented.

## Core product pillars
1. Discover — universities, programs, scholarships
2. Decide — eligibility, matching, cost, trust
3. Apply — journey, documents, deadlines
4. Verify — official source links, review date, and source snapshots

## Start here
Run the app from `web/` with `npm install` and `npm run dev`. Copy `.env.example` to `.env.local`, then configure `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`. Initialize the database with `npm run db:migrate`.
