import type { Program } from "./domain";

export type LinkedProgram = Pick<Program, "universityId" | "source" | "requirementsSource" | "facts" | "scholarships">;
export function officialLinksForProgram(program: LinkedProgram) {
  const links = new Map<string, string>();
  const add = (url: string, label: string) => {
    if (/^https?:\/\//.test(url) && !links.has(url)) links.set(url, label);
  };
  add(program.source, "ประกาศรับสมัครต้นฉบับ");
  add(program.requirementsSource, "เกณฑ์รับสมัครต้นฉบับ");
  for (const fact of Object.values(program.facts ?? {})) {
    for (const evidence of fact.evidence) add(evidence.url, evidence.title);
  }
  for (const scholarship of program.scholarships)
    add(scholarship.source, `ประกาศทุน ${scholarship.name}`);
  return [...links].map(([url, label]) => ({ url, label }));
}
