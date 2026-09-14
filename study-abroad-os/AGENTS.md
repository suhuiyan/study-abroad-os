# AGENTS.md — Study Abroad OS

This repository is the source of truth for the Study Abroad OS project.

## Before making product or architectural changes
Read:
- `PROJECT_STATE.md`
- `docs/00-product-foundation.md`
- `docs/02-jtbd.md`
- `docs/03-prd.md`
- `docs/04-features-moscow-rice.md`
- `docs/06-architecture.md`
- `docs/07-data-model.md`
- `docs/10-trust-safety.md`

## Product principle
Build a self-service Study Abroad OS for Thai students first, with the option to expand internationally later.

The product should turn fragmented study-abroad information into a personalized, trustworthy, actionable journey.

## Core rules
- Official sources are the source of truth for critical data.
- AI explains; official sources verify.
- Do not implement features outside the active MVP without explicit approval.
- Do not build a general-purpose social feed.
- Trust, provenance, freshness, moderation, and verification are first-class concerns.
- Human help is on-demand; the product is not a full-service agency by default.
- Community is utility-first and tied to university, intake, program, nationality, or journey stage.
- Housing prioritizes verified listings and scam prevention over sponsorship.
- Treat users under 18 with stricter privacy and communication safeguards.
- Prefer vertical slices over building every frontend or backend layer separately.

## Current build direction
Backend foundation first. UX/UI is deferred.

Initial core domain:
`StudentProfile -> University -> Program -> Intake -> Requirements -> Eligibility -> Application -> Tasks/Documents/Deadlines`

Then add:
`Community -> Mentor Marketplace -> Housing -> AI enhancements`

## Engineering discipline
- Keep architecture and product docs synchronized with implementation.
- Add source metadata to critical data.
- Add tests for domain rules and eligibility logic.
- Instrument meaningful analytics events.
- Avoid irreversible architectural complexity before the MVP proves demand.
