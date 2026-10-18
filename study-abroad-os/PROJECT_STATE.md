# Current Project State

Updated: 2026-10-18

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
3. Add an admin review queue UI for detected source changes (the queue table is filled by the cron; no screen yet)
4. Add email deadline reminders
5. Run usability testing with Thai high-school students

## Nationwide discovery work (separate local review database)
- Imported the 2026 MOE ordinary higher education register into `discovery/data/discovery.sqlite3` (2,952 institutions; 1,412 undergraduate level).
- This legal institution register is a candidate universe only; it does not confirm international undergraduate admissions.
- As of 2026-09-25, 192 records have an official admissions URL attached (`source_found`), 159 were checked but could not be verified (`not_verified`), 1 has official evidence of no international undergraduate intake for the named 2026 cycle (`no_current_admissions`), and 2,600 remain `not_checked` across all institution levels. For the target bachelor subset, 1,060 of 1,412 records remain `not_checked`. The 97 bachelor records covered by current manual review batches span Guizhou (5 `source_found`), Guangxi (2), Shanghai (6), Ningxia (2), Tianjin (16), Tibet (0), Hainan (6), and Gansu (4 `source_found`, 3 `not_verified` in the current pass). Gansu has 28 bachelor-level candidates overall; this pass updated 7. Some `source_found` links still need degree-level and cycle confirmation. All 32 Tianjin, 5 Tibet, and 12 Hainan bachelor-level records have review notes, including cycle and evidence caveats. A source URL is not proof that applications are currently open; none is promoted to `verified_admissions` yet.
- Open and maintain the separate discovery register using `discovery/README.md`; do not promote records into production until verified.
- **Missing as of 2026-10-18:** `discovery/README.md` and the pipeline source (`server.py`, `import_package.py`, `package_validator.py`, `migrate_evidence.py`, `backup_restore.py`, `build_coverage_queue.py`, `build_research_tasks.py`, `extract_registry.py`, `fast_source_sweep.py` and their tests) are not in git, the handoff ZIP or the Codex worktree; only compiled `.pyc` files remain in `discovery/__pycache__/`, and `discovery/migrations/` is empty. The research data, notes and workbook build scripts are versioned. Copies of university pages/PDFs, workbook inspection dumps and superseded workbook builds stay local (see `discovery/.gitignore`; the repository is public).

## Public web delivery — 2026-10-07

- Phase A in `docs/16-web-experience-handoff.md` is implemented: skippable short onboarding, editable/deletable guest profile, explained ranking, manual discovery, evidence-aware details, and loading/error/empty states.
- Bundled catalog and database/API use the shared Program/Profile contract; critical unconfirmed facts remain unknown and historical cycles are not promoted to the applicant's future cycle.
- `npm run verify` passed: lint, 13 unit tests, production build, and 18 browser checks using actual Chrome with desktop/mobile viewports. No production database was accessed.
- Account/PostgreSQL end-to-end verification, cross-device preferences, AI application assistance, external form automation and email tracking remain separate work. No schema/migration/seed changes or deployment were performed in this phase. (Account/PostgreSQL verification was done on 2026-10-17, below.)
- Delivery details and limitations: `docs/18-web-delivery.md`. Repeatable agent feature map: `docs/17-agent-verification.md`.

## Account + database verification — 2026-10-17 (M3: KAN-17, KAN-18 done)

- Accounts, shortlists and application plans are verified end to end against real PostgreSQL 17 (local, `npm run db:local`).
- `npm run test:integration:local`: route handlers against a `*_test` database (sign-up/in/out, shortlist, plans, optimistic versions, ownership isolation, activity events, rate limits, sources, importer); 33 tests pass.
- `npm run test:e2e:account`: Playwright on desktop and mobile (sign-up → shortlist → plan → sign out → sign in, wrong password, stale-tab conflict); 6 pass. `npm run verify` stays database-free and passes.
- Fixed: `/api/workspace` rejected every write (403) when the browser host differed from `request.url`; it now also accepts the `BETTER_AUTH_URL` origin.
- Before deploying: the host must overwrite `x-forwarded-for` (or set `AUTH_IP_HEADERS`), otherwise clients can bypass the sign-in rate limit by spoofing it.
- Not done: admin review queue UI (KAN-11), deployment (KAN-14).

## Source refresh + register import — 2026-10-17 (M4: KAN-20, KAN-19 in progress)

- The daily source check could never run: nothing created `source_document` rows. `npm run db:seed` now registers the bundled sources, and the cron checks whatever is registered, never-checked and stalest first.
- `npm run db:import -- <register.csv>` imports university-register rows as `publication: "test-only"` programs with every value unknown (`not_reviewed`); they are filtered out of the student API. Tested with the 5 institutions of `university-register-v349-test5.xlsx`. The app still shows 10 published universities.
- Open: page-hash noise on real pages, reachability of Chinese sites from the deploy host, the review UI, and a reviewed path to promote imported rows to published. Which register version is official (v348 vs v349) is undecided (KAN-6).
