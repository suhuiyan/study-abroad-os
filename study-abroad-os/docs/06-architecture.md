# Architecture — C4 / System Design v0.1

## C4 Level 1 — System Context
Primary actors:
- Student
- Current Student / Alumni Mentor
- Admin / Data Reviewer
- Housing Provider (later)
- Verified Professional (later)

External systems:
- Official university and scholarship sources
- Government/visa sources
- Payment provider
- Email/push notification provider
- AI provider

## C4 Level 2 — Containers
- Mobile/Web Client
- Backend API
- PostgreSQL Database
- Object/File Storage
- AI/Data Extraction Pipeline
- Admin/Data Review Interface
- Search/Recommendation Layer
- Payments (later)
- Notifications

## C4 Level 3 — Core Components
- Identity & Student Profile
- University / Program / Intake
- Scholarship
- Requirements Engine
- Eligibility Engine
- Recommendation Engine
- Application Journey Engine
- Source & Trust Engine
- Community
- Mentor Matching/Booking
- Housing
- Payments
- Notifications
- Moderation/Reports
- Analytics

## Architecture principle
Critical facts are structured and sourced. AI may extract, normalize, explain, and recommend, but must not become the sole source of truth for critical deadlines, tuition, visa rules, or scholarship eligibility.
