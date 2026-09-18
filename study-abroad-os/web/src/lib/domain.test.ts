import assert from "node:assert/strict";
import test from "node:test";
import { catalog } from "./catalog";
import { admissionState, eligibility, emptyProfile, makeTasks } from "./domain";

test("catalog starts with exactly 10 distinct Chinese universities", () => {
  assert.equal(catalog.length, 10);
  assert.equal(new Set(catalog.map(program => program.universityId)).size, 10);
  assert.ok(catalog.every(program => program.country === "China"));
});

test("English route reports an IELTS gap below the published threshold", () => {
  const program = catalog.find(item => item.language === "English" && item.ielts !== null);
  assert.ok(program);
  const result = eligibility({ ...emptyProfile, intake: program.intake, ielts: 4, ieltsMinBand: 4 }, program, new Date("2026-01-01T00:00:00Z"));
  assert.equal(result.checks.find(check => check.label === "IELTS Academic")?.state, "gap");
});

test("Chinese route passes matching HSK level and score", () => {
  const program = catalog.find(item => item.language === "Chinese" && item.hskLevel !== null && item.hskScore !== null);
  assert.ok(program);
  const result = eligibility({ ...emptyProfile, intake: program.intake, hskLevel: program.hskLevel, hskScore: program.hskScore, hskDate: "2025-09-01" }, program, new Date("2026-01-01T00:00:00Z"));
  assert.equal(result.checks.find(check => check.label === "ภาษาจีน HSK")?.state, "pass");
});

test("admission state uses the Beijing calendar", () => {
  assert.equal(admissionState({ opensAt: "2026-01-01", deadline: "2026-05-31", intake: "2026" }, new Date("2026-03-01T00:00:00Z")), "open");
  assert.equal(admissionState({ opensAt: "2026-01-01", deadline: "2026-05-31", intake: "2026" }, new Date("2026-06-01T00:00:00Z")), "closed");
});

test("application tasks are unique and include program documents", () => {
  const tasks = makeTasks(catalog[0]);
  assert.equal(new Set(tasks.map(task => task.id)).size, tasks.length);
  assert.ok(catalog[0].documents.every(document => tasks.some(task => task.title === document)));
});
