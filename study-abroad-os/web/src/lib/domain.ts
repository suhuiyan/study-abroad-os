import { z } from "zod";
import { cycleSchema, factSchema, scholarshipFactSchema } from "./provenance";

export const dateSchema = z.union([z.literal(""), z.iso.date()]);
const url = z.url().refine(v => /^https?:\/\//.test(v));
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  qualification: z.enum(["m6", "ib", "alevel", "foundation", "other"]),
  gpa: z.number().min(0).max(4).nullable(),
  ielts: z.number().min(0).max(9).nullable(),
  ieltsMinBand: z.number().min(0).max(9).nullable(), ieltsDate: dateSchema,
  hskLevel: z.number().int().min(1).max(6).nullable().default(null),
  hskScore: z.number().min(0).max(300).nullable().default(null), hskDate: dateSchema.default(""),
  csca: z.enum(["not-yet", "taken", "unknown"]).default("not-yet"),
  cscaSubjects: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
  cscaLanguage: z.enum(["Chinese", "English", "unknown"]).default("unknown"),
  cscaExamDate: dateSchema.default(""),
  cscaScore: z.number().min(0).max(1000).nullable().default(null),
  budget: z.number().min(0).max(20000000).nullable(),
  country: z.literal("China").default("China"), subject: z.string().max(80), intake: z.string().max(40),
});
export type Profile = z.infer<typeof profileSchema>;
export const emptyProfile: Profile = { name: "", qualification: "m6", gpa: null, ielts: null, ieltsMinBand: null, ieltsDate: "", hskLevel: null, hskScore: null, hskDate: "", csca: "not-yet", cscaSubjects: [], cscaLanguage: "unknown", cscaExamDate: "", cscaScore: null, budget: null, country: "China", subject: "", intake: "2027" };
export const scholarshipSchema = z.object({
  name: z.string().min(1).max(200), coverage: z.string().min(1).max(1500), conditions: z.string().max(1500),
  deadline: dateSchema, route: z.string().max(500), source: url,
});
export const programSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/).max(100), universityId: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(160), university: z.string().min(1).max(120), chineseName: z.string().max(120),
  country: z.literal("China"), city: z.string().max(80), subject: z.string().max(80),
  kind: z.enum(["program", "admission-route"]), language: z.enum(["Chinese", "English"]),
  years: z.number().min(1).max(8).nullable(), intake: z.string().max(80),
  tuition: z.number().min(0).nullable(), currency: z.literal("CNY"), feeYear: z.string().max(20), feeNote: z.string().max(1000),
  deadline: dateSchema, opensAt: dateSchema, deadlineNote: z.string().max(1000),
  ielts: z.number().min(0).max(9).nullable(), minBand: z.number().min(0).max(9).nullable(),
  hskLevel: z.number().int().min(1).max(6).nullable(), hskScore: z.number().min(0).max(300).nullable(),
  languageValidityYears: z.number().min(1).max(10).nullable(), languageNote: z.string().max(1500),
  csca: z.enum(["required", "scholarship", "unknown"]), cscaNote: z.string().max(1000),
  cscaRule: z.object({
    subjects: z.array(z.string().trim().min(1).max(80)).max(12),
    language: z.enum(["Chinese", "English"]).nullable(),
    minimumScore: z.number().min(0).max(1000).nullable(),
    appliesTo: z.enum(["admission", "scholarship"]),
    factKey: z.string().min(1).max(100),
  }).optional(),
  academicNote: z.string().max(2000), description: z.string().max(1500), documents: z.array(z.string().max(300)).max(30),
  scholarships: z.array(scholarshipSchema).max(10), source: url, requirementsSource: url,
  checkedAt: z.iso.date(), verification: z.enum(["partial", "reviewed"]), reviewNote: z.string().max(1500),
  cycle: cycleSchema.optional(),
  facts: z.record(z.string().min(1).max(100), factSchema).optional(),
  scholarshipFacts: z.array(scholarshipFactSchema).max(20).optional(),
});
export type Program = z.infer<typeof programSchema>;
export type Check = { label: string; state: "pass" | "gap" | "unknown"; detail: string; source?: string };
export function beijingDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function admissionState(program: Pick<Program, "deadline" | "opensAt" | "intake"> & { cycle?: Program["cycle"]; facts?: Program["facts"] }, now = new Date()) {
  const today = beijingDate(now);
  if (
    program.facts?.deadline?.status !== "verified" ||
    program.facts.deadline.value !== program.deadline ||
    (program.opensAt && (program.facts?.opensAt?.status !== "verified" || program.facts.opensAt.value !== program.opensAt))
  ) return "unknown";
  if (program.deadline && program.deadline < today) return "closed";
  if (program.opensAt && program.opensAt > today) return "upcoming";
  if (program.deadline && program.opensAt && program.opensAt <= today) return "open";
  return "unknown";
}
export const stateLabels = { closed: "ปิดรับรอบนี้แล้ว", upcoming: "ยังไม่เปิดรับ", open: "อยู่ในช่วงรับสมัคร", unknown: "ตรวจรอบสมัครกับมหาวิทยาลัย" };

type IntakeTarget = { year: number; month?: number; round?: string };
export function parseIntakeTarget(value: string): IntakeTarget | null {
  const match = value.trim().match(/^(20\d{2})(?:-(0?[1-9]|1[0-2]))?(?:\s*[:/]\s*([\p{L}\p{N}][\p{L}\p{N} ._-]{0,78}))?$/u);
  if (!match) return null;
  return { year: Number(match[1]), ...(match[2] ? { month: Number(match[2]) } : {}), ...(match[3] ? { round: match[3].trim().toLowerCase() } : {}) };
}

function intakeCheck(profile: Profile, program: Program): Check {
  const target = parseIntakeTarget(profile.intake);
  const cycle = program.cycle;
  if (!target) return { label: "ปีเข้าเรียน", state: "unknown", detail: "ยังไม่ได้ระบุปีเข้าเรียนในรูปแบบ YYYY หรือ YYYY-MM" };
  if (!cycle) return { label: "ปีเข้าเรียน", state: "unknown", detail: `คุณสนใจปี ${profile.intake} แต่รายการนี้ยังไม่มีรอบที่ยืนยันแบบโครงสร้าง` };
  if ((target.month !== undefined && cycle.month === undefined) || (target.round !== undefined && cycle.round === undefined)) return { label: "ปีเข้าเรียน", state: "unknown", detail: `คุณสนใจ ${profile.intake} แต่รายละเอียดเดือนหรือรอบยังรอตรวจสอบ` };
  const sameYear = target.year === cycle.year;
  const sameMonth = target.month === undefined || cycle.month === undefined || target.month === cycle.month;
  const sameRound = target.round === undefined || cycle.round === undefined || target.round === cycle.round.toLowerCase();
  const programLabel = [cycle.year, cycle.month ? String(cycle.month).padStart(2, "0") : "", cycle.round ?? cycle.season ?? ""].filter(Boolean).join("-");
  return sameYear && sameMonth && sameRound
    ? { label: "ปีเข้าเรียน", state: "pass", detail: `ตรงกับรอบ ${programLabel} ที่บันทึกไว้` }
    : { label: "ปีเข้าเรียน", state: "unknown", detail: `คุณสนใจ ${profile.intake} แต่หลักฐานของรายการนี้เป็นรอบ ${programLabel}; ต้องเปิดประกาศรอบเป้าหมายใหม่` };
}

function factSource(program: Program, key: string) {
  return program.facts?.[key]?.evidence[0]?.url;
}

function verifiedRule(program: Program, key: string, value: unknown) {
  const fact = program.facts?.[key];
  return fact?.status === "verified" && fact.value === value;
}

function addCalendarYears(date: string, years: number) {
  const [year, month, day] = date.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year + years, month, 0)).getUTCDate();
  return `${year + years}-${String(month).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
}

export function eligibility(profile: Profile, program: Program, now = new Date()) {
  const checks: Check[] = [intakeCheck(profile, program)];
  const sameCycle = checks[0].state === "pass";
  const cscaSubjects = profile.cscaSubjects ?? [];
  const cscaLanguage = profile.cscaLanguage ?? "unknown";
  if (program.language === "English") {
    const known = sameCycle && program.ielts !== null && verifiedRule(program, "ielts", program.ielts);
    checks.push({ label: "IELTS Academic", state: !known || profile.ielts === null ? "unknown" : profile.ielts < program.ielts! ? "gap" : "pass", detail: !known ? "ยังไม่มีเกณฑ์ IELTS ที่ผ่านการตรวจหลักฐานสำหรับรอบนี้" : profile.ielts === null ? `ยังไม่ได้กรอกคะแนน; เกณฑ์ที่ยืนยันคือ ${program.ielts}` : `เกณฑ์ IELTS ${program.ielts}; คะแนนคุณ ${profile.ielts}. ${program.languageNote}`, source: factSource(program, "ielts") });
    if (program.minBand !== null) {
      const bandKnown = sameCycle && verifiedRule(program, "minBand", program.minBand);
      checks.push({ label: "คะแนนรายทักษะ", state: !bandKnown || profile.ieltsMinBand === null ? "unknown" : profile.ieltsMinBand < program.minBand ? "gap" : "pass", detail: !bandKnown ? "เกณฑ์คะแนนรายทักษะยังไม่ได้รับการยืนยันสำหรับรอบนี้" : `แต่ละทักษะอย่างน้อย ${program.minBand}`, source: factSource(program, "minBand") });
    }
  } else {
    const known = sameCycle && program.hskLevel !== null && program.hskScore !== null && verifiedRule(program, "hskLevel", program.hskLevel) && verifiedRule(program, "hskScore", program.hskScore);
    const unknown = !known || profile.hskLevel === null || profile.hskScore === null;
    // Scores across different HSK levels are not directly interchangeable.
    checks.push({ label: "ภาษาจีน HSK", state: unknown ? "unknown" : profile.hskLevel! < program.hskLevel! ? "gap" : profile.hskLevel !== program.hskLevel ? "unknown" : profile.hskScore! < program.hskScore! ? "gap" : "pass", detail: !known ? "เกณฑ์ HSK เฉพาะสาขาและรอบนี้ยังไม่มีหลักฐานที่ตรวจครบ" : `เกณฑ์ HSK ${program.hskLevel} / ${program.hskScore}; คุณ HSK ${profile.hskLevel ?? "—"} / ${profile.hskScore ?? "—"}. ${program.languageNote}`, source: factSource(program, "hskLevel") });
  }
  const scoreDate = program.language === "English" ? profile.ieltsDate : profile.hskDate;
  const referenceDate = verifiedRule(program, "deadline", program.deadline) && program.deadline ? program.deadline : null;
  const validityKnown = sameCycle && program.languageValidityYears !== null && verifiedRule(program, "languageValidityYears", program.languageValidityYears);
  const expires = scoreDate && validityKnown ? addCalendarYears(scoreDate, program.languageValidityYears!) : null;
  const today = beijingDate(now);
  checks.push({ label: "อายุผลสอบภาษา", state: scoreDate > today ? "gap" : !scoreDate || !validityKnown || !referenceDate ? "unknown" : expires! < referenceDate ? "gap" : "pass", detail: !scoreDate ? "ยังไม่ได้กรอกวันที่สอบ" : scoreDate > today ? `วันที่สอบ ${scoreDate} อยู่ในอนาคต` : !validityKnown ? "ยังไม่มีหลักฐานยืนยันอายุผลสอบสำหรับรอบนี้" : !referenceDate ? `ผลสอบหมดอายุ ${expires} แต่ประกาศยังไม่มีวันอ้างอิงที่ยืนยัน จึงยังสรุปไม่ได้` : `ผลสอบหมดอายุ ${expires}; เทียบกับวันอ้างอิง ${referenceDate}`, source: factSource(program, "languageValidityYears") });
  if (program.csca !== "unknown") {
    const rule = program.cscaRule;
    const ruleFact = rule ? program.facts?.[rule.factKey] : undefined;
    const applicable = sameCycle && rule && ruleFact?.status === "verified" && ruleFact.evidence.length > 0;
    let state: Check["state"] = "unknown";
    if (program.csca === "required" && applicable && profile.csca === "not-yet") state = "gap";
    if (program.csca === "required" && applicable && profile.csca === "taken" && rule.subjects.some(subject => !cscaSubjects.includes(subject))) state = "gap";
    if (program.csca === "required" && applicable && profile.csca === "taken" && rule.subjects.every(subject => cscaSubjects.includes(subject)) && (!rule.language || cscaLanguage === rule.language) && (rule.minimumScore === null || (profile.cscaScore !== null && profile.cscaScore >= rule.minimumScore))) state = "pass";
    const scope = program.csca === "scholarship" ? "กฎนี้เกี่ยวกับทุน ไม่ใช่เงื่อนไขรับเข้าโดยอัตโนมัติ" : "กฎนี้เกี่ยวกับการรับเข้า";
    checks.push({ label: "CSCA", state, detail: !applicable ? `${program.cscaNote} ยังไม่มีรายละเอียดรายวิชาที่ตรวจครบ จึงยังสรุปไม่ได้` : `${scope}; ต้องใช้ ${rule.subjects.join(", ") || "ใบคะแนนตามประกาศ"}. ${program.cscaNote}`, source: ruleFact?.evidence[0]?.url });
  }
  const qualificationFact = program.facts?.qualification;
  checks.push({ label: "วุฒิและเงื่อนไขอื่น", state: "unknown", detail: qualificationFact?.status === "verified" ? `ต้องให้ผู้ดูแลตรวจความเทียบเท่าวุฒิ ${profile.qualification}; ${program.academicNote}` : `ยังไม่มีกฎวุฒิที่ตรวจครบสำหรับรอบนี้; ${program.academicNote}`, source: qualificationFact?.evidence[0]?.url });
  if (program.deadline && verifiedRule(program, "deadline", program.deadline)) checks.push({ label: "รอบสมัคร", state: sameCycle && admissionState(program,now) === "closed" ? "gap" : "unknown", detail: sameCycle ? `${stateLabels[admissionState(program,now)]} · ${program.deadline} (เวลาปักกิ่ง)` : `ประกาศที่มีเป็นรอบ ${program.cycle?.year ?? program.intake}; ต้องตรวจรอบ ${profile.intake} อีกครั้ง` });
  const status = checks.some(c => c.state === "gap") ? "มีข้อที่ยังไม่ถึงเกณฑ์หรืออยู่นอกรอบ" : checks.some(c => c.state === "unknown") ? "ยังมีข้อมูลที่ต้องตรวจเพิ่ม" : "ผ่านการตรวจเบื้องต้นครบทุกกฎที่มีหลักฐาน (ไม่ใช่การรับรองผลสมัคร)";
  return { checks, status };
}
export const taskSchema = z.object({ id: z.string().min(1).max(100), title: z.string().trim().min(1).max(300), done: z.boolean(), due: dateSchema });
export const applicationSchema = z.object({ id: z.string().uuid(), programId: z.string().max(100), status: z.enum(["preparing", "submitted", "offer", "closed"]), tasks: z.array(taskSchema).max(60).refine(tasks => new Set(tasks.map(t=>t.id)).size === tasks.length), notes: z.string().max(4000), targetIntake: z.string().trim().regex(/^20\d{2}(?:-(?:0[1-9]|1[0-2]))?$/), version: z.number().int().min(1).default(1) });
export const applicationPatchSchema = z.object({
  status: z.enum(["preparing", "submitted", "offer", "closed"]).optional(),
  tasks: z.array(taskSchema).max(60).refine(tasks => new Set(tasks.map(task => task.id)).size === tasks.length).optional(),
  notes: z.string().max(4000).optional(),
  targetIntake: z.string().trim().regex(/^20\d{2}(?:-(?:0[1-9]|1[0-2]))?$/).optional(),
}).refine(patch => Object.keys(patch).length > 0, "At least one application field is required");
export type Task = z.infer<typeof taskSchema>;
export type Application = z.infer<typeof applicationSchema>;
export function makeTasks(program?: Program): Task[] {
  return ["ยืนยันสาขา ปีเข้าเรียน และวันปิดรับสมัคร", ...(program?.documents ?? ["เตรียมวุฒิ ม.6 และใบแสดงผลการเรียน", "เตรียมผลสอบภาษา"]), "ตรวจทุนที่สมัครได้และเงื่อนไขเฉพาะคนไทย", "ตรวจเอกสารและส่งใบสมัครผ่านระบบมหาวิทยาลัย"].map((title,i)=>({id:`task-${i}`,title,done:false,due:""}));
}
