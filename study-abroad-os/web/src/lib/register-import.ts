import type { ClientBase } from "pg";
import { z } from "zod";
import { seedSources } from "./catalog-seed";
import { programSchema } from "./domain";
import { factSchema, type Fact } from "./provenance";
import { isOfficialSourceUrl } from "./source-fetch";
import { buildSourceRegistry, type SourceRecord } from "./source-registry";

// Turns rows of the university register (checked links + stage C result) into program records for the app.
// The register only proves that an official international-undergraduate page exists and was reachable.
// Nothing in it states a deadline, fee or requirement, so every such field is imported as unknown (reason: not_reviewed).
// Imported rows are test-only until a person reads the announcement; they are never shown to students.

export const importRowSchema = z.object({
  moe: z.string().regex(/^\d{10}$/),
  zh_name: z.string().trim().min(1).max(120),
  en_name: z.string().trim().max(120),
  province: z.string().trim().max(80),
  city: z.string().trim().max(80),
  homepage_url: z.string(),
  admission_page_url: z.string(),
  announcement_url: z.string(),
  stage_c_status: z.string(),
  years_seen: z.string(),
  stage_c_detail: z.string().max(500),
  link_checked_at: z.iso.date(),
});
export type ImportRow = z.infer<typeof importRowSchema>;

export const candidateProgramSchema = programSchema.extend({
  language: z.enum(["Chinese", "English", "unknown"]),
  publication: z.literal("test-only"),
  importSource: z.object({
    registerVersion: z.string().min(1),
    moe: z.string().regex(/^\d{10}$/),
    stageCStatus: z.string(),
    stageCDetail: z.string(),
    yearsSeen: z.array(z.string()),
    linkCheckedAt: z.iso.date(),
    importedAt: z.iso.date(),
    automated: z.literal(true),
  }),
});
export type CandidateProgram = z.infer<typeof candidateProgramSchema>;

export type RejectReason = "INVALID_ROW" | "NOT_CONFIRMED" | "NO_2026_PAGE" | "NOT_OFFICIAL_URL" | "DUPLICATE_MOE";
export type ImportResult = {
  programs: CandidateProgram[];
  sources: SourceRecord[];
  rejected: { moe: string; reason: RejectReason }[];
};

// RFC 4180 subset: quoted fields, "" escapes, CRLF or LF, optional BOM. Rows are keyed by the header line.
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "", row: string[] = [], quoted = false;
  const input = text.replace(/^﻿/, "");
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
    } else field += char;
  }
  row.push(field);
  if (row.some((value) => value !== "")) rows.push(row);
  const [header, ...body] = rows;
  if (!header) return [];
  return body.map((values) => Object.fromEntries(header.map((name, index) => [name.trim(), values[index] ?? ""])));
}

const FACT_KEYS = ["language", "years", "tuition", "deadline", "opensAt", "ielts", "minBand", "hskLevel", "hskScore", "languageValidityYears", "csca", "qualification"];
const notReviewed = (): Fact => factSchema.parse({ value: null, status: "unknown", unknownReason: "not_reviewed", evidence: [] });

export function assessRow(row: ImportRow): RejectReason | null {
  if (!row.stage_c_status.startsWith("ยืนยันแล้ว")) return "NOT_CONFIRMED";
  if (!row.years_seen.split(/\s+/).includes("2026")) return "NO_2026_PAGE";
  if (!isOfficialSourceUrl(row.announcement_url) || !isOfficialSourceUrl(row.admission_page_url)) return "NOT_OFFICIAL_URL";
  return null;
}

export function toCandidateProgram(row: ImportRow, options: { registerVersion: string; importedAt: string }): CandidateProgram {
  const yearsSeen = row.years_seen.split(/\s+/).filter(Boolean);
  return candidateProgramSchema.parse({
    id: `moe-${row.moe}-international-undergraduate`,
    universityId: `moe-${row.moe}`,
    name: "ช่องรับนักศึกษาต่างชาติ ระดับปริญญาตรี",
    university: row.en_name || row.zh_name,
    chineseName: row.zh_name,
    country: "China",
    city: row.city || row.province,
    subject: "ยังไม่ระบุสาขา",
    kind: "admission-route",
    language: "unknown",
    years: null,
    intake: "ยังไม่ตรวจ",
    tuition: null,
    currency: "CNY",
    feeYear: "",
    feeNote: "ยังไม่ได้อ่านค่าเรียนจากประกาศ",
    deadline: "",
    opensAt: "",
    deadlineNote: "ยังไม่ได้อ่านกำหนดการจากประกาศ",
    ielts: null,
    minBand: null,
    hskLevel: null,
    hskScore: null,
    languageValidityYears: null,
    languageNote: "ยังไม่ได้อ่านเกณฑ์ภาษาจากประกาศ",
    csca: "unknown",
    cscaNote: "ยังไม่ได้อ่านเงื่อนไข CSCA จากประกาศ",
    academicNote: "ยังไม่ได้อ่านเงื่อนไขวุฒิและอายุจากประกาศ",
    description: `หน้าทางการที่พบช่องรับนักศึกษาต่างชาติระดับปริญญาตรี (ปีที่พบบนหน้า: ${yearsSeen.join(", ")}) ยังไม่มีผู้อ่านและยืนยันรายละเอียด`,
    documents: [],
    scholarships: [],
    source: row.announcement_url,
    requirementsSource: row.admission_page_url,
    checkedAt: row.link_checked_at,
    verification: "partial",
    reviewNote: `นำเข้าอัตโนมัติจากทะเบียน ${options.registerVersion}: ผลขั้นตอน C พบหน้าประกาศ แต่ไม่ใช่ verified_admissions ทุกค่าเป็น unknown จนกว่าผู้ตรวจจะอ่านประกาศ`,
    facts: Object.fromEntries(FACT_KEYS.map((key) => [key, notReviewed()])),
    publication: "test-only",
    importSource: {
      registerVersion: options.registerVersion,
      moe: row.moe,
      stageCStatus: row.stage_c_status,
      stageCDetail: row.stage_c_detail,
      yearsSeen,
      linkCheckedAt: row.link_checked_at,
      importedAt: options.importedAt,
      automated: true,
    },
  });
}

export function importRegister(csvText: string, options: { registerVersion: string; importedAt: string }): ImportResult {
  const programs: CandidateProgram[] = [], rejected: ImportResult["rejected"] = [], seen = new Set<string>();
  for (const raw of parseCsv(csvText)) {
    const parsed = importRowSchema.safeParse(raw);
    if (!parsed.success) { rejected.push({ moe: raw.moe ?? "", reason: "INVALID_ROW" }); continue; }
    const row = parsed.data;
    if (seen.has(row.moe)) { rejected.push({ moe: row.moe, reason: "DUPLICATE_MOE" }); continue; }
    seen.add(row.moe);
    const reason = assessRow(row);
    if (reason) { rejected.push({ moe: row.moe, reason }); continue; }
    programs.push(toCandidateProgram(row, options));
  }
  return { programs, sources: buildSourceRegistry(programs), rejected };
}

// Existing rows are never overwritten: a reviewer may already have edited them. Sources are registered in the same
// transaction so the refresh cron starts watching the announcement pages right away.
export async function storeCandidates(client: ClientBase, result: Pick<ImportResult, "programs" | "sources">) {
  const inserted: string[] = [];
  await client.query("BEGIN");
  try {
    for (const program of result.programs) {
      const stored = await client.query("INSERT INTO program(id,data) VALUES($1,$2) ON CONFLICT(id) DO NOTHING", [program.id, JSON.stringify(program)]);
      if (stored.rowCount) inserted.push(program.id);
    }
    const sources = await seedSources(client, result.sources);
    await client.query("COMMIT");
    return { inserted, existing: result.programs.length - inserted.length, sources };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
