import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { candidateProgramSchema, importRegister, parseCsv } from "./register-import";

const fixture = readFileSync(new URL("../../test/fixtures/register-v349-test5.csv", import.meta.url), "utf8");
const options = { registerVersion: "v349-test5", importedAt: "2026-10-17" };
const header = "moe,zh_name,en_name,province,city,homepage_url,admission_page_url,announcement_url,stage_c_status,years_seen,stage_c_detail,link_checked_at";
const goodRow = (patch: Record<string, string> = {}) => {
  const base: Record<string, string> = { moe: "4100000001", zh_name: "测试大学", en_name: "", province: "河南省", city: "郑州市", homepage_url: "https://www.test.edu.cn/", admission_page_url: "https://iso.test.edu.cn/a.htm", announcement_url: "https://iso.test.edu.cn/", stage_c_status: "ยืนยันแล้ว", years_seen: "2025 2026", stage_c_detail: "อ่านแล้ว", link_checked_at: "2026-10-08", ...patch };
  return header.split(",").map((key) => base[key]).join(",");
};

test("CSV parser handles quotes, escaped quotes, commas in fields, CRLF and BOM", () => {
  const rows = parseCsv('﻿a,b\r\n"x,1","he said ""hi"""\r\n\r\nplain,\r\n');
  assert.deepEqual(rows, [{ a: "x,1", b: 'he said "hi"' }, { a: "plain", b: "" }]);
});

test("the 5-university register imports as test-only programs with every value unknown", () => {
  const result = importRegister(fixture, options);
  assert.deepEqual(result.rejected, []);
  assert.equal(result.programs.length, 5);
  assert.equal(new Set(result.programs.map((program) => program.id)).size, 5);
  for (const program of result.programs) {
    assert.ok(candidateProgramSchema.safeParse(program).success);
    assert.match(program.id, /^moe-\d{10}-international-undergraduate$/);
    assert.equal(program.publication, "test-only");
    assert.equal(program.verification, "partial");
    assert.equal(program.language, "unknown", "the register does not say what language the programme is taught in");
    assert.equal(program.cycle, undefined, "a 2026 page is never turned into a cycle for another year");
    assert.deepEqual([program.tuition, program.years, program.ielts, program.hskLevel, program.deadline, program.opensAt], [null, null, null, null, "", ""]);
    assert.equal(program.csca, "unknown");
    assert.deepEqual(program.scholarships, []);
    assert.ok(Object.keys(program.facts ?? {}).length >= 10);
    for (const fact of Object.values(program.facts ?? {})) {
      assert.equal(fact.status, "unknown", "no human has read the announcement, so nothing is verified");
      assert.equal(fact.value, null);
      assert.equal(fact.unknownReason, "not_reviewed");
    }
    assert.equal(program.importSource.automated, true);
    assert.ok(program.importSource.yearsSeen.includes("2026"));
    assert.equal(program.importSource.importedAt, "2026-10-17");
    assert.match(program.reviewNote, /ไม่ใช่ verified_admissions/);
  }
});

test("names, links and check dates come straight from the register row", () => {
  const programs = importRegister(fixture, options).programs;
  const gzhmu = programs.find((program) => program.importSource.moe === "4144010570")!;
  assert.equal(gzhmu.university, "Guangzhou Medical University");
  assert.equal(gzhmu.chineseName, "广州医科大学");
  assert.equal(gzhmu.source, "https://en.gzhmu.edu.cn/Global/International_Students.htm");
  assert.equal(gzhmu.requirementsSource, "https://en.gzhmu.edu.cn/info/1661/3891.htm");
  assert.equal(gzhmu.checkedAt, "2026-10-08");
  const bucm = programs.find((program) => program.importSource.moe === "4111010026")!;
  assert.equal(bucm.university, "北京中医药大学", "falls back to the Chinese name when the register has no English name");
});

test("the pages to watch are exactly each programme's announcement and admission page", () => {
  const { programs, sources } = importRegister(fixture, options);
  assert.equal(sources.length, 10);
  for (const program of programs) {
    for (const url of [program.source, program.requirementsSource]) {
      const record = sources.find((item) => item.url === url);
      assert.deepEqual(record?.universityIds, [program.universityId]);
    }
  }
});

test("rows are rejected with a reason instead of being imported", () => {
  const csv = [
    header,
    goodRow(),
    goodRow({ moe: "4100000002", stage_c_status: "ไม่ยืนยัน" }),
    goodRow({ moe: "4100000003", years_seen: "2019 2025" }),
    goodRow({ moe: "4100000004", announcement_url: "http://iso.test.edu.cn/" }),
    goodRow({ moe: "4100000005", announcement_url: "https://example.com/intl" }),
    goodRow({ moe: "4100000006", admission_page_url: "" }),
    goodRow({ moe: "4100000001" }),
    goodRow({ moe: "12345" }),
    goodRow({ moe: "4100000007", link_checked_at: "yesterday" }),
  ].join("\n");
  const result = importRegister(csv, options);
  assert.deepEqual(result.programs.map((program) => program.importSource.moe), ["4100000001"]);
  assert.deepEqual(result.rejected, [
    { moe: "4100000002", reason: "NOT_CONFIRMED" },
    { moe: "4100000003", reason: "NO_2026_PAGE" },
    { moe: "4100000004", reason: "NOT_OFFICIAL_URL" },
    { moe: "4100000005", reason: "NOT_OFFICIAL_URL" },
    { moe: "4100000006", reason: "NOT_OFFICIAL_URL" },
    { moe: "4100000001", reason: "DUPLICATE_MOE" },
    { moe: "12345", reason: "INVALID_ROW" },
    { moe: "4100000007", reason: "INVALID_ROW" },
  ]);
});
