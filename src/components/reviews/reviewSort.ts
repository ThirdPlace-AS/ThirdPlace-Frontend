// Sorting guest reviews (Phase 12 H4a). Fixture reviews carry a relative age
// ("3 dager siden", "1 uke siden", "2 måneder siden"); this turns it into days
// so "Nyeste" can order them. Pure.

export type ReviewSort = "newest" | "highest" | "lowest";

export const REVIEW_SORT_LABEL: Record<ReviewSort, string> = {
  newest: "Nyeste",
  highest: "Høyest vurdert",
  lowest: "Lavest vurdert",
};

const UNIT_DAYS: [RegExp, number][] = [
  [/dag/, 1],
  [/uke/, 7],
  [/måned/, 30],
  [/år/, 365],
];

/** "3 dager siden" → 3, "1 uke siden" → 7, "I dag" → 0; unknown → Infinity. */
export function ageInDays(when: string): number {
  const w = when.toLowerCase().trim();
  if (w === "i dag") return 0;
  if (w === "i går") return 1;
  const m = /^(\d+)\s+(\S+)/.exec(w);
  if (!m) return Number.POSITIVE_INFINITY;
  const unit = UNIT_DAYS.find(([re]) => re.test(m[2] ?? ""));
  return unit ? Number(m[1]) * unit[1] : Number.POSITIVE_INFINITY;
}

export function sortReviews<T extends { rating: number; when: string }>(
  list: readonly T[],
  sort: ReviewSort,
): T[] {
  const copy = [...list];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => ageInDays(a.when) - ageInDays(b.when));
    case "highest":
      return copy.sort(
        (a, b) => b.rating - a.rating || ageInDays(a.when) - ageInDays(b.when),
      );
    case "lowest":
      return copy.sort(
        (a, b) => a.rating - b.rating || ageInDays(a.when) - ageInDays(b.when),
      );
  }
}

/** Free-text match on the review text and the author. */
export function matchesReview(
  r: { author: string; text: string },
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  return (
    !q || r.text.toLowerCase().includes(q) || r.author.toLowerCase().includes(q)
  );
}
