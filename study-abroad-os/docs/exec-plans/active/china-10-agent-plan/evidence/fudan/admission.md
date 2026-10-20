# R02A Admission Evidence: Fudan UIPDB

Research status: READY_FOR_REVIEW (proposed evidence; no reviewer verification claimed)
Program record: `fudan-data-science` / Fudan University / Data Science and Big Data Technology (UIPDB)
Research retrieved: 2026-09-23 13:59 Asia/Shanghai (UTC+08:00)
Contract: China 10 release contract v1.0 (2026-09-23); B01 report says ACCEPTED.

## Sources and access notes

| ID | Official source | Published | Locator / retrieval result |
|---|---|---|---|
| S1 | [2026 UIPDB program notice (PDF)](https://iso.fudan.edu.cn/_upload/article/files/bc/ed/37f712cb4e3f8316f4ec2ebc4ba2/6c9fce5d-d137-4934-b484-1c4630f18aa5.pdf) | 2025-09-30, per official index | Notice for the exact English-taught UIPDB route. Browser PDF fetch timed out; PowerShell HEAD returned HTTP 403. No page-level detail could be checked directly. |
| S2 | [Fudan official Undergraduate admissions index](https://iso.fudan.edu.cn/isoenglish/51327/list.htm) | Index checked 2026-09-23 | Undergraduate list, lines/items 2026-12-01 through 2025-09-29. Lists the 2026 UIPDB notice, and no 2027 UIPDB notice is present on this checked index. |
| S3 | [2026 English-taught undergraduate program list (PDF)](https://iso.fudan.edu.cn/_upload/article/files/44/63/7f95ce7f43ba893d49b9d8127ac5/21e4e31c-3c5e-4488-ae63-322dda408127.pdf) | Listed 2025-12-01 | Table row for Undergraduate International Program in Data Science and Big Data Technology (UIPDB), School of Data Science; search-indexed official PDF text. |
| S4 | [2026 UIPDB English page](https://iso.fudan.edu.cn/isoenglish/7b/ee/c51327a752622/page.htm) | 2025-09-30 | Official English page title and date identify the 2026 cycle. Body content is image/PDF based and did not expose details in fetched HTML. |

All evidence below is for the explicitly named cycle. `verified` means directly supported by accessible official listing text and remains proposed pending independent Vxx review; it is not a production verification. Unknowns retain null values. No 2026 fact is carried forward as a 2027 fact.

## Admission field ledger

| fieldPath | cycle / scope | value; status; reason if unknown | Evidence and locator | Catalog action |
|---|---|---|---|---|
| identity.officialEnglishName | 2026 UIPDB | Data Science and Big Data Technology; verified | S1 title; S3 UIPDB table row | Keep; add acronym UIPDB. |
| identity.officialChineseName | 2026 UIPDB | null; unknown / source_unreachable | S1 exact notice not readable; S2 English index only | Do not infer Chinese title. |
| identity.thaiTranslation | Not an official name | วิทยาศาสตร์ข้อมูลและเทคโนโลยีข้อมูลขนาดใหญ่; verified as translator wording only | Translation of S1/S3 English program title; not university-published | Keep separate from official title. |
| location.city | 2026 UIPDB | Shanghai; verified | S4 official Fudan ISO contact address, lines 40; route specific city is not otherwise stated in accessible notice metadata | Keep catalog city; reviewer can confirm from full notice. |
| degree.level | 2026 UIPDB | Undergraduate / bachelor degree route; verified | S2 Undergraduate index; S3 undergraduate program list | Keep undergraduate scope. |
| route.identity | 2026 UIPDB | English-taught Undergraduate International Program in Data Science and Big Data Technology (UIPDB); verified | S1 title; S2 index; S3 table row | Keep exact route. |
| program.department | 2026 | School of Data Science; verified | S3 table row | Add department if schema supports it. |
| language.teaching | 2026 | English; verified | S1/S4 title says English-taught | Keep English. |
| duration | 2026 | null; unknown / source_unreachable | S3 row shows duration column but extracted value for UIPDB is unavailable/blank in accessible text; S1 inaccessible | Catalog says 4 years, but no accessible exact-route evidence confirmed it; do not affirm without full PDF. |
| intake.year | 2027 | 2027; verified as target cycle only | S2 checked 2026-09-23; no 2027 UIPDB item listed | 2027 is research target, not evidence of intake availability. |
| intake.season / month | 2027 | null; unknown / not_found_in_checked_sources | S2 Undergraduate list checked; no 2027 route notice | Leave unknown. |
| intake.rounds | 2027 | null; unknown / not_found_in_checked_sources | S2; no 2027 notice | Do not carry the catalog's 2026 round dates forward. |
| application.openDate | 2027 | null; unknown / not_found_in_checked_sources | S2 checked 2026-09-23 | No 2027 opening date found. |
| application.deadline | 2027 | null; unknown / not_found_in_checked_sources | S2 checked 2026-09-23 | No 2027 deadline found. |
| application.roundDates | 2026 | null; unknown / source_unreachable | S1 2026 notice inaccessible; S2 confirms notice exists but not its dates | Catalog's Jan 1–15 / Feb 23–Mar 6 dates remain unverified research leads. |
| eligibility.education | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 route notice; S1 2026 notice inaccessible | Do not infer high-school/other credential rule for 2027. |
| eligibility.gpa | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 route notice | No scale or threshold established. |
| eligibility.nationality | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 route notice | Thai-specific eligibility and nationality-history rules need 2027 notice. |
| eligibility.age | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 route notice | Age and reference date unknown. |
| eligibility.minor | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 route notice | Guardian/consent requirements unknown. |
| language.englishTests | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 route notice | Do not use catalog IELTS 6.5 for 2027. |
| language.alternativesExemptions | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 route notice | Accepted tests, exemptions and proof conditions unknown. |
| language.scoreValidity | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 route notice | Validity window/reference unknown. |
| language.hsk | 2027 | not applicable to the English-taught UIPDB route, based on route language | S1/S4 route explicitly English-taught; exact full requirements unavailable | Do not add HSK requirement absent notice evidence. |
| csca.role | 2026 | Admission test-subject listing: Mathematics and Physics; verified as listed subjects, requirement role unknown / source_unreachable | S3 UIPDB row, “CSCA Test Subjects” | Catalog's required status, exam language and relevant round remain unverified. |
| csca.subjects | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 notice or subject list | Do not carry 2026 subjects into 2027. |
| csca.language/date/score | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 route notice | All details unknown. |
| costs.tuition | 2026 | 75,000 RMB/year (reference amount); verified as listed, subject to university note | S3 UIPDB table row; PDF notes that tuition is for reference and exact amount is informed upon registration | Catalog has no tuition; proposed add only as 2026 reference, not 2027 price. |
| costs.tuition.2027 | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 program list found | Do not use 2026 price for 2027. |
| costs.applicationFee | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 notice | Unknown. |
| costs.otherFees | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 notice | Unknown; do not estimate. |
| documents.required | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 route notice | Catalog generic checklist is not route-specific proof. |
| application.channel | 2027 | null; unknown / not_found_in_checked_sources | S2 no 2027 route notice | S4 nav has a general online-application link, but 2027 UIPDB route and portal workflow are unconfirmed. |
| contact | 2027 | null; unknown / not_found_in_checked_sources | S1 inaccessible; S2 index has no UIPDB contact detail | General ISO address is not a route-specific contact. |

## Cycle and conflict notes

- The official index page checked on 2026-09-23 lists a 2026 UIPDB notice published 2025-09-30 and a 2026 English-taught undergraduate program list published 2025-12-01. It shows no 2027 UIPDB notice. Therefore 2027 cycle fields above are `unknown / not_found_in_checked_sources`; this is not proof that the program will not open.
- The catalog says IELTS 6.5, CSCA required in English in Mathematics and Physics, application rounds Jan 1–15 and Feb 23–Mar 6, and four years. Those 2026 facts are not confirmed by accessible detailed notice text. No catalog dates are promoted as official evidence. S3 supports only the 2026 row, tuition reference and CSCA subject listing; exact duration extraction is missing.
- No scholarship is assessed in R02A; scholarship applicability is owned by R02B. Do not treat an institutional scholarship mention as UIPDB eligibility.

## Proposed catalog changes

1. Preserve exact English program name, English-taught language, School of Data Science, and four-year duration only after reviewer obtains/readable confirmation of the 2026 program notice; current evidence supports identity, language and department, but not duration.
2. Add the 2026 tuition reference of 75,000 RMB/year from S3 only with the source's “reference” qualification. Do not set it as a 2027 value.
3. Keep 2027 deadline, opening date, eligibility, English score thresholds, CSCA role/details, and fees unknown until a 2027 notice is located. Do not project the current catalog's prior-cycle dates and IELTS value.
4. Before accepting the catalog's listed 2026 rounds, IELTS 6.5, four-year duration, and CSCA requirement/language, retrieve S1 successfully and cite the relevant PDF pages/sections.
