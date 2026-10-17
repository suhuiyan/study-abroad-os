import { z } from "zod";

const evidenceSchema = z.object({
  url: z.url().refine((value) => /^https?:\/\//.test(value)),
  organization: z.string().min(1),
  title: z.string().min(1),
  locator: z.string().min(1),
  retrievedAt: z.iso.datetime({ offset: true }),
});
export const cycleSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  season: z.string().min(1).optional(),
  round: z.string().min(1).optional(),
});
export const factSchema = z
  .object({
    value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
    status: z.enum(["verified", "unknown", "conflict"]),
    evidence: z.array(evidenceSchema),
    unknownReason: z
      .enum([
        "not_announced",
        "not_found_in_checked_sources",
        "source_unreachable",
        "contradictory",
        "applicability_unclear",
      ])
      .optional(),
    verifiedAt: z.iso.datetime({ offset: true }).optional(),
    reviewerId: z.string().min(1).optional(),
  })
  .superRefine((fact, context) => {
    if (
      fact.status === "verified" &&
      (fact.value === null ||
        !fact.evidence.length ||
        !fact.verifiedAt ||
        !fact.reviewerId)
    ) {
      context.addIssue({
        code: "custom",
        message: "Verified facts require a value, evidence, date and reviewer",
      });
    }
    if (
      fact.status !== "verified" &&
      (fact.value !== null || !fact.unknownReason)
    ) {
      context.addIssue({
        code: "custom",
        message: "Unconfirmed facts require a null value and a reason",
      });
    }
    if (
      fact.status === "conflict" &&
      (fact.evidence.length < 2 || fact.unknownReason !== "contradictory")
    ) {
      context.addIssue({
        code: "custom",
        message: "Conflicts require two evidence records",
      });
    }
  });
export type Fact = z.infer<typeof factSchema>;
export const scholarshipFactSchema = z.object({
  name: z.string().min(1),
  facts: z.record(z.string(), factSchema),
  cycle: cycleSchema.optional(),
});
