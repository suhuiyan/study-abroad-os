import assert from "node:assert/strict";
import test from "node:test";
import { catalog } from "./catalog";
import { emptyProfile } from "./domain";
import { eligibility } from "./domain";
import { defaultPreferences, programMatch } from "./discovery";
import { workspaceSchema } from "./workspace";
import { factSchema } from "./provenance";

test("unknown tuition cannot pass a budget check and broad routes are not rejected", () => {
  const match = programMatch(
    { ...emptyProfile, subject: "วิศวกรรม", budget: 80000 },
    defaultPreferences,
    catalog[0],
  );
  assert.ok(match.pending.some((value) => value.includes("ค่าเรียน")));
  assert.ok(match.pending.some((value) => value.includes("สาขา")));
  assert.ok(!match.gaps.some((value) => value.includes("สาขา")));
  assert.ok(!match.reasons.some((value) => value.includes("งบ")));
});
test("preference ranking explains language and never promotes a historical cycle", () => {
  const program = catalog.find((item) => item.language === "English")!;
  const match = programMatch(
    { ...emptyProfile, intake: "2027" },
    { ...defaultPreferences, language: "English" },
    program,
  );
  assert.ok(match.reasons.includes("ตรงภาษาเรียน"));
  assert.ok(match.pending.includes("รอบที่ต้องการ 2027 รอตรวจสอบ"));
});
test("shared workspace contract preserves an empty database result and rejects invalid records", () => {
  const workspace = {
    programs: [],
    user: null,
    profile: null,
    saved: [],
    applications: [],
    configured: true,
    catalogSource: "database",
  };
  assert.deepEqual(workspaceSchema.parse(workspace).programs, []);
  assert.equal(
    workspaceSchema.safeParse({
      ...workspace,
      programs: [{ university: "ข้อมูลตัวอย่างที่ไม่ครบ" }],
    }).success,
    false,
  );
});
test("verification metadata needs evidence, date and reviewer", () => {
  assert.equal(
    factSchema.safeParse({ value: 1, status: "verified", evidence: [] })
      .success,
    false,
  );
  assert.equal(
    factSchema.safeParse({
      value: null,
      status: "unknown",
      evidence: [],
      unknownReason: "not_announced",
    }).success,
    true,
  );
});

test("historical costs and closed cycles do not reject or pass a future applicant", () => {
  const program = catalog.find(
    (item) => item.facts?.tuition?.status === "verified",
  )!;
  const match = programMatch(
    { ...emptyProfile, intake: "2027", budget: 1000000 },
    defaultPreferences,
    program,
  );
  assert.ok(!match.reasons.some((value) => value.includes("งบ")));
  assert.ok(match.pending.some((value) => value.includes("ค่าเรียน")));
  const checks = eligibility(
    { ...emptyProfile, intake: "2027" },
    catalog[0],
    new Date("2026-10-07T00:00:00Z"),
  ).checks;
  assert.ok(checks.every((check) => check.state === "unknown"));
});
