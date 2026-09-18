import { z } from "zod";

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
  budget: z.number().min(0).max(20000000).nullable(),
  country: z.literal("China").default("China"), subject: z.string().max(80), intake: z.string().max(40),
});
export type Profile = z.infer<typeof profileSchema>;
export const emptyProfile: Profile = { name: "", qualification: "m6", gpa: null, ielts: null, ieltsMinBand: null, ieltsDate: "", hskLevel: null, hskScore: null, hskDate: "", csca: "not-yet", budget: null, country: "China", subject: "", intake: "2027" };
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
  academicNote: z.string().max(2000), description: z.string().max(1500), documents: z.array(z.string().max(300)).max(30),
  scholarships: z.array(scholarshipSchema).max(10), source: url, requirementsSource: url,
  checkedAt: z.iso.date(), verification: z.enum(["partial", "reviewed"]), reviewNote: z.string().max(1500),
});
export type Program = z.infer<typeof programSchema>;
export type Check = { label: string; state: "pass" | "gap" | "unknown"; detail: string };
export function beijingDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function admissionState(program: Pick<Program, "deadline" | "opensAt" | "intake">, now = new Date()) {
  const today = beijingDate(now);
  if (program.deadline && program.deadline < today) return "closed";
  if (program.opensAt && program.opensAt > today) return "upcoming";
  if (program.deadline && program.opensAt && program.opensAt <= today) return "open";
  return "unknown";
}
export const stateLabels = { closed: "ปิดรับรอบนี้แล้ว", upcoming: "ยังไม่เปิดรับ", open: "อยู่ในช่วงรับสมัคร", unknown: "ตรวจรอบสมัครกับมหาวิทยาลัย" };
export function eligibility(profile: Profile, program: Program, now = new Date()) {
  const checks: Check[] = [];
  if (!program.intake.includes(profile.intake)) checks.push({ label: "ปีเข้าเรียน", state: "unknown", detail: `ข้อมูลนี้เป็นรอบ ${program.intake} แต่คุณสนใจ ${profile.intake} ต้องตรวจประกาศรอบที่สมัครอีกครั้ง` });
  if (program.language === "English") {
    checks.push({ label: "IELTS Academic", state: program.ielts === null || profile.ielts === null ? "unknown" : profile.ielts < program.ielts ? "gap" : "pass", detail: program.ielts === null ? "ยังไม่มีเกณฑ์ตัวเลขที่ตรวจสอบแล้ว" : `เกณฑ์ IELTS ${program.ielts}; คะแนนคุณ ${profile.ielts ?? "ยังไม่กรอก"}. ${program.languageNote}` });
    if (program.minBand !== null) checks.push({ label: "คะแนนรายทักษะ", state: profile.ieltsMinBand === null ? "unknown" : profile.ieltsMinBand < program.minBand ? "gap" : "pass", detail: `แต่ละทักษะอย่างน้อย ${program.minBand}` });
  } else {
    const unknown = program.hskLevel === null || program.hskScore === null || profile.hskLevel === null || profile.hskScore === null;
    // Scores across different HSK levels are not directly interchangeable.
    checks.push({ label: "ภาษาจีน HSK", state: unknown ? "unknown" : profile.hskLevel! < program.hskLevel! ? "gap" : profile.hskLevel !== program.hskLevel ? "unknown" : profile.hskScore! < program.hskScore! ? "gap" : "pass", detail: program.hskLevel === null ? program.languageNote : `เกณฑ์ HSK ${program.hskLevel} / ${program.hskScore ?? "ตรวจคะแนน"}; คุณ HSK ${profile.hskLevel ?? "—"} / ${profile.hskScore ?? "—"}. ${program.languageNote}` });
  }
  const scoreDate = program.language === "English" ? profile.ieltsDate : profile.hskDate;
  const expires = scoreDate ? new Date(`${scoreDate}T00:00:00+08:00`) : null;
  if (expires && program.languageValidityYears) expires.setUTCFullYear(expires.getUTCFullYear() + program.languageValidityYears);
  checks.push({ label: "อายุผลสอบภาษา", state: scoreDate > beijingDate(now) ? "gap" : !scoreDate || !program.languageValidityYears ? "unknown" : now >= expires! ? "gap" : "pass", detail: !program.languageValidityYears ? "ตรวจอายุผลสอบและข้อยกเว้นกับมหาวิทยาลัย" : `ผลสอบต้องอยู่ในอายุ ${program.languageValidityYears} ปี และใช้ได้ถึงวันที่มหาวิทยาลัยกำหนด` });
  if (program.csca !== "unknown") checks.push({ label: "CSCA", state: profile.csca === "taken" ? "unknown" : program.csca === "required" ? "gap" : "unknown", detail: program.cscaNote + (profile.csca === "taken" ? " ต้องตรวจรายวิชา ภาษา และอายุผลสอบในใบคะแนน" : " ยังไม่ได้ยืนยันใบคะแนน") });
  checks.push({ label: "วุฒิและเงื่อนไขอื่น", state: "unknown", detail: program.academicNote });
  if (program.deadline) checks.push({ label: "รอบสมัคร", state: admissionState(program,now) === "closed" ? "gap" : "unknown", detail: `${stateLabels[admissionState(program,now)]} · ${program.deadline} (เวลาปักกิ่ง)` });
  return { checks, status: checks.some(c => c.state === "gap") ? "มีข้อที่ต้องเตรียมหรือตรวจเพิ่ม" : "ต้องตรวจเงื่อนไขเพิ่มเติม" };
}
export const taskSchema = z.object({ id: z.string().min(1).max(100), title: z.string().trim().min(1).max(300), done: z.boolean(), due: dateSchema });
export const applicationSchema = z.object({ id: z.string().uuid(), programId: z.string().max(100), status: z.enum(["preparing", "submitted", "offer", "closed"]), tasks: z.array(taskSchema).max(60).refine(tasks => new Set(tasks.map(t=>t.id)).size === tasks.length), notes: z.string().max(4000), targetIntake: z.string().max(40).default("2027") });
export type Task = z.infer<typeof taskSchema>;
export type Application = z.infer<typeof applicationSchema>;
export function makeTasks(program?: Program): Task[] {
  return ["ยืนยันสาขา ปีเข้าเรียน และวันปิดรับสมัคร", ...(program?.documents ?? ["เตรียมวุฒิ ม.6 และใบแสดงผลการเรียน", "เตรียมผลสอบภาษา"]), "ตรวจทุนที่สมัครได้และเงื่อนไขเฉพาะคนไทย", "ตรวจเอกสารและส่งใบสมัครผ่านระบบมหาวิทยาลัย"].map((title,i)=>({id:`task-${i}`,title,done:false,due:""}));
}
