import type { MockExperience, TimeWindow } from "@/fixtures";

import type { SwipeMode } from "./SwipeFilterBar";

// Pure swipe-deck filter model — no React/Reanimated, so it is unit-testable in
// isolation (mirrors deckLogic.ts). The UI (SwipeFilterSheet) re-exports these.
// Every facet maps to a real fixture field (tags / when / hasSpots). The `mode`
// is an audience shell only — "For deg" / "Gruppeaktivitet" / "Reiserute" all show
// the same deck; group/itinerary are non-personalized demo shells, so mode does
// NOT narrow the list (no invented ranking/matching). DEMO only — no scoring or
// backend (BLOCKED_CONTRACT_GAP).

export type SwipeFilters = {
  mode: SwipeMode;
  tags: string[];
  when: TimeWindow | null;
  hasSpots: boolean;
};

export const DEFAULT_SWIPE_FILTERS: SwipeFilters = {
  mode: "forYou",
  tags: [],
  when: null,
  hasSpots: false,
};

export function applySwipeFilters(
  list: MockExperience[],
  f: SwipeFilters,
): MockExperience[] {
  return list.filter((e) => {
    if (e.status === "cancelled") return false;
    // `mode` is an audience shell (demo), not a filter — only the facets narrow.
    if (f.tags.length > 0 && !e.tags.some((t) => f.tags.includes(t)))
      return false;
    if (f.when !== null && e.day !== f.when) return false;
    if (f.hasSpots && e.going >= e.capacity) return false;
    return true;
  });
}

export function activeSwipeFilterCount(f: SwipeFilters): number {
  return f.tags.length + (f.when !== null ? 1 : 0) + (f.hasSpots ? 1 : 0);
}
