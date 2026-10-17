import type { Program } from "./domain";
import { officialLinksForProgram } from "./official-links";

export type SourceRecord = { id: string; url: string; universityIds: string[] };
export function buildSourceRegistry(programs: Program[]): SourceRecord[] {
  const records = new Map<string, SourceRecord>();
  for (const program of programs) {
    for (const link of officialLinksForProgram(program)) {
      const url = new URL(link.url);
      url.hash = "";
      const key = url.href;
      const existing = records.get(key);
      if (existing) {
        if (!existing.universityIds.includes(program.universityId))
          existing.universityIds.push(program.universityId);
      } else {
        // Full URL encoding keeps identifiers deterministic and collision-free.
        records.set(key, {
          id: `source-${encodeURIComponent(key)}`,
          url: key,
          universityIds: [program.universityId],
        });
      }
    }
  }
  return [...records.values()];
}
