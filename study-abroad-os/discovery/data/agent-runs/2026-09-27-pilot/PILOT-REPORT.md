# Gansu Pilot Report

As of 2026-09-27. This is a local research report, not a production data promotion.

## Result

- Research outputs received: 10/10 existing MOE codes.
- Independent source reviews: 10/10.
- Preliminary dispositions: 2 `needs_review`, 7 `not_verified`, 1 historical `source_found` (西北师范大学's official 2021 foreign-undergraduate catalogue).
- Verified current-cycle foreign undergraduate intakes: 0/10.
- Official cycle-specific negative admissions statements: 0/10. Missing search results and inaccessible pages were not treated as negatives.
- Verified current Thai applicant eligibility, current foreign-undergraduate program list, or current foreign-undergraduate scholarship terms: 0/10.
- Five institutions have directly corroborated official homepage ownership in the reviewed sources: 西北师范大学, 西北民族大学, 甘肃医学院, 陇南师范学院, 甘肃警察学院. 酒泉职业技术大学 has an official-domain homepage/profile lead, but direct homepage retrieval timed out. The other homepage candidates remain provisional pending official ownership evidence.

## Important Findings

- 西北师范大学: an official 2021 catalogue directly supports foreign-student bachelor programs. This is historical evidence, not a current-cycle intake.
- 酒泉职业技术大学: an official 2021 international-student notice was for a three-year junior-college (专科) course. It does not establish foreign access to the vocational bachelor programs established later.
- 甘肃中医药大学 and 西北民族大学: relevant official international-student URLs/forms exist, but current bachelor cycle/scope is unresolved or inaccessible.
- Domestic Gaokao admissions, international exchange news, generic scholarship language, third-party mirrors, and search snippets were not accepted as proof of current foreign undergraduate admission.

## Synthetic Evaluation

- Valid blind run: 12/12 cases matched expected safe decisions using `gpt-6-luna` at low reasoning effort; expected labels were withheld. Cases covered stale cycles, degree mismatch, explicit cycle-specific negative evidence, third-party portals, prompt injection, OCR ambiguity, conflicting deadlines, 404 behavior, and CSCA omissions.
- The first attempt is excluded from the score because the evaluator omitted required `asOf`; it also exposed an E11 failure that treated 404 as no-current. `WORKER-PROMPTS.md` now explicitly states that 404/timeout/access denial/search absence never proves no intake, and the full blind set was rerun with `asOf` provided.
- This is a small synthetic safety check, not a measure of factual accuracy or nationwide reliability.

## Efficiency and Access Limits

- A comparable human-time baseline/control was not recorded, so the target of 30% time reduction is unmeasured.
- Agent token/cost data was unavailable.
- Aggregate source fetch success rate was not captured consistently; direct fetch failures/timeouts/412s occurred. Search-indexed text was kept distinct from pages opened directly.
- Some university notices are image-only or inaccessible. Those facts remain unresolved; no OCR values were guessed.

## Gate and Data Handling

- The 1,412-row coverage queue was generated from the existing SQLite register, grouped into 31 province/region values. The CSV code set exactly matches the database bachelor code set; database hash is in `coverage-manifest.json`.
- All 10 pilot rows remain `not_checked` with blank homepage/admissions URLs in the discovery database. Research/evidence are in separate local run artifacts; no production data or secrets were touched.
- The prompt-pack static audit passed; its seven audit tests passed and verified the SQLite file hash did not change. These checks do not validate source claims.
- Nationwide release gate is **not passed**: structured schema/importer, backup/restore, rollback/idempotency tests, fuller provenance packages, owner review, and nationwide monitoring are still outstanding.

## Files

- `reviews/pilot-research-results.json`
- `reviews/pilot-independent-reviews.json`
- `reviews/pilot-eval-results.json`
- `coverage-queue.csv`
- `coverage-manifest.json`
- `state.json`
- `CHECKPOINT.md`
