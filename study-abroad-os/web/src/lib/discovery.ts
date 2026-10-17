import { z } from "zod";
import {
  eligibility,
  parseIntakeTarget,
  type Profile,
  type Program,
} from "./domain";

export const preferencesSchema = z.object({
  city: z.string().max(80),
  language: z.enum(["ทั้งหมด", "Chinese", "English"]),
  scholarshipInterest: z.boolean().default(false),
});
export type Preferences = z.infer<typeof preferencesSchema>;
export const defaultPreferences: Preferences = {
  city: "ทั้งหมด",
  language: "ทั้งหมด",
  scholarshipInterest: false,
};
export function programMatch(
  profile: Profile,
  preferences: Preferences,
  program: Program,
) {
  const reasons: string[] = [];
  const gaps: string[] = [];
  const pending: string[] = [];
  const target = parseIntakeTarget(profile.intake);
  let score = 0;
  if (profile.subject) {
    const matches = program.subject
      .toLowerCase()
      .includes(profile.subject.toLowerCase());
    if (matches) reasons.push("ตรงสาขาที่สนใจ");
    else if (program.subject === "หลายสาขา")
      pending.push("ต้องตรวจว่าสาขาที่สนใจอยู่ในเส้นทางนี้หรือไม่");
    else gaps.push("สาขาต่างจากที่เลือก");
    if (matches) score += 4;
  }
  if (preferences.language !== "ทั้งหมด") {
    const matches = preferences.language === program.language;
    (matches ? reasons : gaps).push(
      matches ? "ตรงภาษาเรียน" : "ภาษาเรียนต่างจากที่เลือก",
    );
    if (matches) score += 3;
  }
  if (preferences.city !== "ทั้งหมด") {
    const matches = preferences.city === program.city;
    (matches ? reasons : gaps).push(
      matches ? "อยู่ในเมืองที่สนใจ" : "เมืองต่างจากที่เลือก",
    );
    if (matches) score += 2;
  }
  if (profile.budget !== null) {
    const verified =
      program.tuition !== null &&
      program.facts?.tuition?.status === "verified" &&
      program.facts.tuition.value === program.tuition;
    if (!verified || (target && program.cycle?.year !== target.year))
      pending.push("ค่าเรียนรอบที่ต้องการรอตรวจสอบ");
    else if (program.tuition! <= profile.budget) {
      reasons.push("ค่าเรียนอยู่ในงบ (ไม่รวมค่าครองชีพ)");
      score += 1;
    } else gaps.push("ค่าเรียนเกินงบที่ระบุ");
  }
  if (target && program.cycle?.year === target.year) {
    reasons.push(`มีข้อมูลรอบปี ${target.year}`);
    score += 1;
  } else if (target) pending.push(`รอบที่ต้องการ ${target.year} รอตรวจสอบ`);
  const checks = eligibility(profile, program).checks;
  if (checks.some((check) => check.state === "unknown"))
    pending.push("เกณฑ์บางข้อยังสรุปไม่ได้");
  if (checks.some((check) => check.state === "gap"))
    gaps.push("มีเกณฑ์หรือรอบที่ไม่ตรง ดูรายละเอียด");
  return { score, reasons, gaps, pending };
}
