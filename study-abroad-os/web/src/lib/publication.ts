// Rows in `program` carry an optional data.publication. Missing means published (every bundled/seeded row);
// "test-only" rows come from automated imports that no person has read yet and must never reach students.
// Every student-facing read of `program` must filter with this fragment.
export const PUBLISHED_ONLY = "COALESCE(data->>'publication','published')='published'";
