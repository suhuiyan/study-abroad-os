# Research Batch 18

As of 2026-09-30. Five results for the next exact rows of the existing input-versioned 1,412-row bachelor's queue. No institutions were added or reordered. This is a coordinator research memo based on the fast source sweep and bounded official-source search; it is not captured/import-ready evidence. Unknown is not a negative finding. No database or production writes.

## Research results

### Tianjin Tianshi University (天津天狮学院; MOE 4112010859)

- Existing task `R-4112010859-0c4e885fe7f0`; inputVersion `0c4e885fe7f02114bd7fe7d074b464c914a018ea5dbd85a5172ffe23a5c7e0bd`.
- The existing official homepage capture (`https://www.tianshi.edu.cn/`) was reachable with HTTP 200 and an official-domain signal. The text contained a general `招生就业` navigation term, but no readable foreign-student or international undergraduate admissions evidence in the captured preview. Capture SHA-256: `b6e39179467343fb394f55b3cb3f44a315cbe119bc2cded6e2b6c31bb55a4654`.
- The official admissions path listed by the university is `https://www.tianshi.edu.cn/zb/`. It was not accessible in the bounded web capture, so its current contents, foreign-student route, deadlines, requirements, fees and scholarships remain unverified.
- A third-party reproduction of a 2024/2026 domestic ordinary-undergraduate charter identifies the university as a bachelor's institution and gives the official website/admissions contact, but it is not sufficient evidence of current foreign undergraduate admission and was not used as proof of such a route.
- Status: `INSTITUTION_AND_DOMESTIC_BACHELOR_ROUTE_CONFIRMED; CURRENT_INTERNATIONAL_BACHELOR_ROUTE_NOT_VERIFIED`.
- Follow-up: retry the official admissions site, locate an international-student office or English/Chinese foreign-admission page, and request a current prospectus if no official route is exposed.

### Tianjin Vocational University (天津职业大学; MOE 4112011032)

- Existing task `R-4112011032-195b8c3ac25e`; inputVersion `195b8c3ac25e134859493b876af6f45d59a315057b762a2fcc53cde2b8a1d7c6`.
- The registered official homepage `https://tjtc.edu.cn/` was reachable in official search results, but the automated fast sweep timed out and produced no capture hash. The official admissions site is `https://zs.tjtc.edu.cn/`.
- The official 2026 vocational-bachelor and higher-vocational admissions charter (`https://zs.tjtc.edu.cn/info/1258/2595.htm`) confirms that the institution has bachelor's and associate-level vocational education. The charter is a domestic ordinary-admissions document and does not establish a foreign-student undergraduate route.
- The university's official 2026 statement (`https://zs.tjtc.edu.cn/info/1059/2625.htm`) says official admissions information is published through its admissions website and official channels. The bounded search did not locate a degree-specific international-student undergraduate prospectus, foreign application portal, current foreign deadline, or scholarship notice.
- International cooperation material found in the search concerns overseas vocational cooperation and does not itself prove inbound foreign bachelor's admission.
- Status: `DOMESTIC VOCATIONAL_BACHELOR_ROUTE_CONFIRMED; CURRENT_INTERNATIONAL_BACHELOR_ROUTE_NOT_VERIFIED`.
- Follow-up: retry `zs.tjtc.edu.cn` with a browser/source capture, search its international exchange/admissions sections, and contact the international office if no current foreign route is published.

### Tianjin Sino-German University of Applied Sciences (天津中德应用技术大学; MOE 4112012105)

- Existing task `R-4112012105-0fd7fa10f13`; inputVersion `0fd7fa10f13c36bcaf7c892391e199d61ccb19baab1efd7f2df2ec519a61dc61`.
- The official homepage capture (`https://www.tsguas.edu.cn/`) returned HTTP 200 and exposed `留学生教育`, undergraduate education and admissions navigation. Capture SHA-256: `e0831803977d40b86e149ccc7cb110e8d339c1cd10e97d937cd944542069dedf`.
- The official international education site (`https://engjzs.tsguas.edu.cn/`) currently exposes `BA & BS Programs`, an application section, international-student contact information and a current site navigation. This confirms an inbound international degree channel, but the accessible home page does not by itself provide the current cycle's complete deadline, program list, tuition, scholarship award terms or Thai-specific rules.
- The official international-student brochure (`https://yywy.tsguas.edu.cn/info/1127/2661.htm`) is explicitly a `2025 Admission Brochure`. It lists four-year undergraduate programs for high-school graduates/equivalent applicants, age over 18 and under 30, IELTS 5.0 or equivalent, an online interview, a Tianjin government scholarship application, RMB 20,000/year undergraduate tuition before scholarship, and a May 30 application deadline. The fast sweep captured this page with HTTP 200; capture SHA-256: `b50252c7dd1921aaf42d42d8729292e51f8b7597cc3951f19c72166e22f6fa6a`.
- The 2025 brochure is useful historical/route evidence but must not be presented as the 2026/2027 live intake. Current-cycle date, scholarship amount/eligibility, complete program availability and Thai eligibility require a fresh official notice or direct confirmation.
- Status: `INTERNATIONAL_UNDERGRADUATE_ROUTE_VERIFIED; CURRENT_CYCLE_TERMS_NOT_VERIFIED; HISTORICAL_BROCHURE_REQUIRES_REFRESH`.
- Follow-up: extract the official BA/BS and application pages, capture the current downloadable guide, and bind each current-cycle claim to a source hash before review.

### Tianjin Police University (天津警察学院; MOE 4112012723)

- Existing task `R-4112012723-91636a6f8ab3`; inputVersion `91636a6f8ab3443088311b3166a6fa6331f502d5afe07bf99f315f80338526d2`.
- The registered official homepage `https://www.tjjingyuan.cn/` failed the fast sweep with `URLError`; no local content hash was produced. The official site therefore needs a retry/capture before any broad institution-level conclusion.
- The official admissions-platform copy of the 2026 charter on China Higher-education Student Information and Career Center (`https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view%2CschId-1206%2CinfoId-7635453697.dhtml`) states that applicants to the public-security majors must have Chinese nationality. It also lists the 2026 bachelor's majors as public-security majors plus the non-public-security major Social Work.
- This is a scope-limited exclusion for the listed public-security majors, not proof that the university has no foreign-student route for every non-public-security offering. No current official foreign-student bachelor's prospectus or international application route was found in the bounded search.
- Status: `PUBLIC_SECURITY_BACHELOR_SCOPE_REQUIRES_CHINESE_NATIONALITY; OTHER_INTERNATIONAL_BACHELOR_ROUTE_NOT_VERIFIED`.
- Follow-up: capture the university's official charter/international office page and verify separately whether Social Work or any non-public-security program admits foreign students. Do not label the whole institution as ineligible from the police-major rule alone.

### Tianjin Foreign Studies University Binhai College (天津外国语大学滨海外事学院; MOE 4112013658)

- Existing task `R-4112013658-8ddaedbff32`; inputVersion `8ddaedbff32c7d341765d8f2d9f0ac6ea8f1bad0bb1b342738e74f0deca0529e`.
- The official homepage capture (`https://bhws.tjfsu.edu.cn/`) returned HTTP 200 with official-domain signal. Capture SHA-256: `0c319e0ca7e621eca0396b7d32806aa9de9c2c885bd042b8c9af1de0d623cde8`.
- The official 2026 ordinary-undergraduate charter (`https://bhws.tjfsu.edu.cn/zsxx/p.jsp?id=209&pagenum=1&type=1`) lists 22 bachelor's majors and says admission is based on the national ordinary college entrance examination and provincial plans. This confirms a domestic bachelor's route, not a foreign-student route.
- The official international-exchange page found in the bounded search (`https://bhws.tjfsu.edu.cn/gjjl/p.jsp?id=422&pagenum=1&type=2`) describes a 2026 Japan study-abroad preparatory project for students going to Japan. That is an outbound project and is not evidence of inbound foreign undergraduate admission to the college.
- No current official foreign-student bachelor's prospectus, application portal, deadline, language requirement, tuition or scholarship route was located. Do not infer non-admission from this absence.
- Status: `DOMESTIC_BACHELOR_ROUTE_CONFIRMED; OUTBOUND_INTERNATIONAL_PROJECT_FOUND; CURRENT_INBOUND_INTERNATIONAL_BACHELOR_ROUTE_NOT_VERIFIED`.
- Follow-up: search the college's international exchange and admissions contact channels for inbound foreign-student policies; if none exists, record an explicit unresolved status rather than a negative admissions claim.

## Review and next gate

- Coordinator research only; all five memo-level results require independent review.
- One institution (Tianjin Sino-German University of Applied Sciences) has strong official evidence of an international bachelor's channel, but the accessible brochure is for 2025 and cannot be used as a live 2026/2027 intake without refresh.
- Four institutions remain unresolved for current inbound foreign bachelor's admission. Tianjin Police University's Chinese-nationality condition is limited to public-security majors; it is not a whole-institution negative finding.
- Before any import, capture official pages/PDFs and attachments with retrieval timestamp, hashes and claim locators; create input-version-bound packages; obtain independent package-bound review; then validate. No import occurred.
