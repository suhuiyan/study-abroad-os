# Current Project State

Updated: 2026-09-19

## Project
Study Abroad OS MVP for Thai students applying to undergraduate study in China.

## Vision
Make studying abroad self-service: help Thai students go from uncertainty to a clear, trustworthy, actionable path from discovery through arrival.

## Completed planning
- Product concept and positioning
- Product foundation
- Preliminary global research/validation framework
- PRD v0.1
- JTBD
- MoSCoW prioritization
- Preliminary RICE prioritization
- High-level C4/system architecture
- Initial backend/domain model direction
- Community concept
- Student mentor marketplace concept
- Safer housing concept

## Explicitly deferred
- Detailed UX/UI
- High-fidelity prototype
- Full social network
- Full-service agency workflow
- Flight booking, banking, insurance, loans

## Current phase
Deploying and validating the first usable MVP.

## Implemented MVP
- Responsive Next.js application focused on China undergraduate study
- Initial catalog covering 10 Chinese universities with official source links
- Search and filters for city, language, and subject
- Scholarship directory and preliminary HSK / IELTS / CSCA eligibility checks
- Email/password authentication with Better Auth
- PostgreSQL persistence for profiles, shortlists, and application plans
- Application task tracker
- Source provenance, version storage, and a daily refresh job
- Domain tests, linting, and production build checks

## Next after MVP
1. Verify each 2027 admission cycle when universities publish it
2. Expand beyond the first 10 universities
3. Add an admin review queue for detected source changes
4. Add email deadline reminders
5. Run usability testing with Thai high-school students
