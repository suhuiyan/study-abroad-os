# SJTU Global College International Undergraduate Admission Evidence

Research retrieval date: 2026-09-23 (Asia/Shanghai). Researcher proposal only; no field is reviewer-verified (`verifiedAt` and `reviewerId` intentionally absent). Status vocabulary follows release contract 1.0. The target is catalog record `sjtu-engineering`, Global College (GC), not all SJTU faculties.

## Sources checked

| Ref | Official source, cycle/title, locator | URL; retrieved |
|---|---|---|
| S1 | SJTU Global College, “2026 Application Requirements”; headings Application Deadlines, Required Materials, Test Scores, English Language Requirements, Other Required Documents, pp./HTML lines 87-167 | https://gc.sjtu.edu.cn/admission/international-undergraduate-admission/application-requirements/ ; 2026-09-23 |
| S2 | SJTU Global College, Educational Programs; Majors (ECE, ME, DS, CS), lines 87-107; page does not state cycle | https://gc.sjtu.edu.cn/admission/international-undergraduate-admission/educational-programs/ ; 2026-09-23 |
| S3 | SJTU Global College, Fees and Scholarships; “Estimated Tuition and Fees (2026)”, Application Fee, “Scholarships (2026)”, lines 87-122 | https://gc.sjtu.edu.cn/admission/international-undergraduate-admission/fees-and-scholarships/ ; 2026-09-23 |
| S4 | SJTU GC International Undergraduate Admission landing page; overview states GC is in Shanghai and courses are delivered in English | https://gc.sjtu.edu.cn/admission/international-undergraduate-admission/ ; 2026-09-23 |
| S5 | SJTU GC 2026 International Undergraduate Admissions PDF linked in search as 2026 brochure; fetch timed out, so not used to verify any field | https://gc.sjtu.edu.cn/wp-content/uploads/2025/09/2026-International-Undergraduate-Admissions-updated.pdf ; attempted 2026-09-23, HTTP fetch timeout |

Search trail: inspected the supplied requirements URL, GC undergraduate admissions landing page, Educational Programs, Fees and Scholarships, and searched the official `gc.sjtu.edu.cn` domain for 2027 international undergraduate / Global College admission notices. The requirements and fees pages returned 2026-labelled content; search did not surface a 2027 undergraduate notice. 2027 therefore remains unknown, not inferred from 2026. S5’s retrieval failure is not evidence about admission facts.

## Admission field ledger

Each row is scoped to 2027 Fall international undergraduate entry to GC unless its evidence cycle explicitly says 2026.

| fieldPath | value / concise rule | status; unknownReason | Evidence / cycle |
|---|---|---|---|
| identity.officialName | Shanghai Jiao Tong University Global College; Chinese official name not established by checked admission pages | verified for English name; Chinese name unknown / not_found_in_checked_sources | S1/S2/S4; current page, no admission cycle |
| identity.thaiName | Shanghai Jiao Tong University Global College (คำแปลไทย: วิทยาลัยโกลบอล มหาวิทยาลัยเซี่ยงไฮ้เจียวทง) | verified as translation only | S4; current page |
| identity.city | Shanghai, China; campus address Minhang District | verified | S1 lines 162-167, S4; current page |
| degree.level | Undergraduate / bachelor route | verified | S1 title and 2026 international undergraduate heading; 2026 |
| program.route | GC international undergraduate engineering; currently listed majors: Electrical and Computer Engineering (ECE), Mechanical Engineering (ME), Data Science and Big Data Technology (DS), Computer Science and Technology (CS). Applicant must select major; do not treat them as one identical curriculum | verified as route/list; exact 2027 offer unknown / not_announced | S2 lines 87-107 (current page), S1 (2026) |
| intake.year, intake.season, intake.round | 2027 Fall; cycle-specific opening/deadlines not found | unknown / not_announced | S1 shows 2026 deadline only; search trail above |
| duration | 4 years is catalog value; checked admission pages do not state duration per major/cycle | unknown / not_found_in_checked_sources | S1/S2 checked; no duration statement |
| language.teaching | English delivery stated for GC | verified for GC route generally; 2027 cycle applicability pending | S4; current page |
| eligibility.qualification | 2026 page requests high-school transcripts and describes A-level/IB/test routes; exact diploma equivalencies and 2027 rules not fully specified | 2026 evidence only; 2027 unknown / not_announced | S1 lines 109-123, 138-140; 2026 |
| eligibility.gpa | No minimum GPA published on checked pages | unknown / not_found_in_checked_sources | S1/S2 checked |
| eligibility.nationality | 2026 international-student route; special nationality/residency evidence where either parent is Chinese. No Thai-specific rule found | 2026 evidence only; 2027 unknown / not_announced | S1 lines 144-154; 2026 |
| eligibility.age | 2026: under-18 applicants as of 2026-09-01 require China-based guardian guarantee and SJTU-approved notarized document. No general maximum/minimum age found | 2026 evidence only; 2027 reference date/rule unknown / not_announced | S1 line 143; 2026 |
| language.english | 2026 non-native speakers: IELTS >=6 or TOEFL iBT (threshold changes for tests before/after Jan 2026); listed score-based and schooling-country exemptions. No IELTS minimum band specified | 2026 evidence only; 2027 unknown / not_announced | S1 lines 124-133; 2026 |
| language.hsk | HSK 4 is stated as a graduation requirement for all international students, not an admission condition | verified as 2026-page graduation note; 2027 admission requirement not established | S1 line 133; 2026 |
| language.scoreValidity | No score validity period stated | unknown / not_found_in_checked_sources | S1 checked |
| csca.role | 2026: CSCA Mathematics required; applicants may initially submit alternative test materials and successful pre-admits must supplement CSCA by 2026-06-30 | 2026 evidence only; 2027 role/subjects/deadline unknown / not_announced | S1 lines 109-121; 2026 |
| cost.tuition | 2026 estimate: 120,000 CNY/year. 2027 amount not published on checked pages | 2026 verified as estimate only; 2027 unknown / not_announced | S3 lines 87-101; 2026 |
| cost.housing | 2026 estimate: dorm 3,000 CNY/month; not tuition | 2026 verified as estimate; 2027 unknown / not_announced | S3 lines 90-101; 2026 |
| cost.living | 2026 estimate: 3,000 CNY/month | 2026 verified as estimate; 2027 unknown / not_announced | S3 lines 94-101; 2026 |
| cost.books, cost.insurance | 2026 estimates: books/supplies 2,100 CNY/year; insurance 800 CNY/year; insurance note applies to international study over six months | 2026 verified as estimates; 2027 unknown / not_announced | S3 lines 96-101; 2026 |
| cost.applicationFee | 75 USD, non-refundable, on page alongside 2026 cost heading | 2026 context only; 2027 amount unknown / not_announced | S3 lines 102-104; 2026 |
| application.documents | 2026: CSCA Math (or initially accepted alternate test evidence subject to later CSCA), English test if applicable, two English recommendation letters, official English high-school transcripts, >=100,000 CNY financial guarantee, conditional under-18 guarantee, and specified parental nationality/household and China immigration history documents for relevant cases | 2026 evidence only; 2027 checklist unknown / not_announced | S1 lines 106-154; 2026 |
| application.channel | “Apply Now” links to Common App | verified for page’s 2026 cycle; 2027 channel unknown / not_announced | S1 lines 89-95; 2026 |
| contact | GC admission email shown as gc-admissions@sjtu.edu.cn (also ji-intadm@sjtu.edu.cn); phone +86-21-3420-6045 ext. 4492. Separate SJTU International Student Center contact is also listed | verified as published contacts; confirm current routing before applying | S1 lines 99-103, 156-160 |

## Scholarship field ledger

| fieldPath | value / concise rule | status; unknownReason | Evidence / cycle |
|---|---|---|---|
| scholarship.identity | 2026 page lists SJTU First-, Second- and Third-Class Scholarships for eligible SJTU applicants; direct GC-specific award applicability for this route is not explicitly delimited | 2026 listing verified; GC applicability unclear | S3 lines 105-122; 2026 |
| scholarship.coverage | First: 4 years, full tuition, 2,500 CNY/month living allowance, 1,000 CNY/month accommodation subsidy, insurance. Second: 4 years, 50% tuition, accommodation subsidy and insurance. Third: 4 years, 25% tuition and insurance | verified as 2026 page terms only | S3 lines 108-117; 2026 |
| scholarship.eligibility | Must be officially admitted by SJTU and not hold another scholarship; selection uses academic and interview performance. Award is competitive, not guaranteed | verified for 2026 listing | S3 lines 119-122; 2026 |
| scholarship.route.deadline | No scholarship application deadline stated on checked page; separate application form/route not established | unknown / not_found_in_checked_sources | S3 lines 105-122; 2026 |
| scholarship.2027 | No 2027 award applicability, coverage, selection dates or conditions found | unknown / not_announced | S3 remains explicitly labelled 2026; official-domain search trail |

## Catalog reconciliation proposal (no product edits)

- Keep the existing ID `sjtu-engineering` and GC scope. The catalog name “Global College · Engineering” compresses a route with four listed majors; display major selection as required.
- Retain 120,000 CNY/year only as a clearly labelled 2026 estimate. Keep dorm, living, books, insurance, and 75 USD application fee separate; do not roll them into tuition.
- Retain IELTS 6 only as a 2026 rule, without inferring 2027. Capture TOEFL alternative and exemptions separately; minimum IELTS band is not stated.
- Represent CSCA as admission-required for the 2026 cycle with its initial alternative-material process and June 30, 2026 supplementation deadline. Do not carry that deadline into 2027.
- Keep scholarship amounts and four-year duration cycle-labelled 2026; scope applicability to GC remains `applicability_unclear` pending reviewer/source confirmation. Do not treat award as entitlement.
- Leave 2027 deadlines, tuition, eligibility, test rules, document list, and scholarship facts unknown until an official 2027 notice is published.
