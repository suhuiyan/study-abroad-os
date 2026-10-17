import type { programMatch } from "@/lib/discovery";

export function MatchSummary({
  match,
}: {
  match: ReturnType<typeof programMatch>;
}) {
  return (
    <div className="match-summary" aria-label="เหตุผลของตัวเลือก">
      {match.reasons.length > 0 && (
        <p className="match-positive">
          ตรงความต้องการ: {match.reasons.join(" · ")}
        </p>
      )}
      {match.gaps.length > 0 && (
        <p className="match-gap">มีข้อไม่ตรง: {match.gaps.join(" · ")}</p>
      )}
      {match.pending.length > 0 && (
        <p>รอตรวจสอบ: {match.pending.join(" · ")}</p>
      )}
    </div>
  );
}
