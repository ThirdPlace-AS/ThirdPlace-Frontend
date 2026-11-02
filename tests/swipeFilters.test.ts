import { describe, expect, it } from "@jest/globals";

import { experiences } from "@/fixtures";
import {
  applySwipeFilters,
  DEFAULT_SWIPE_FILTERS,
} from "@/components/swipe/swipeFilters";

// The modes are audience shells (For deg / Gruppeaktivitet / Reiserute), NOT
// filters: all three show the same (non-cancelled) deck — group/itinerary are
// non-personalized demo shells, no invented matching. Real local filtering is the
// facets (tags / when / hasSpots), exercised below.
describe("applySwipeFilters — modes are demo shells, not filters", () => {
  const nonCancelled = experiences.filter(
    (e) => e.status !== "cancelled",
  ).length;

  it.each(["forYou", "group", "itinerary"] as const)(
    '"%s" returns the whole (non-cancelled) deck',
    (mode) => {
      const r = applySwipeFilters(experiences, {
        ...DEFAULT_SWIPE_FILTERS,
        mode,
      });
      expect(r.length).toBe(nonCancelled);
    },
  );
});

describe("applySwipeFilters — facets do the real local filtering", () => {
  it('"Ledige plasser" keeps only experiences with open spots', () => {
    const r = applySwipeFilters(experiences, {
      ...DEFAULT_SWIPE_FILTERS,
      hasSpots: true,
    });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((e) => e.going < e.capacity)).toBe(true);
  });

  it('"Når" keeps only experiences in the chosen time window', () => {
    const r = applySwipeFilters(experiences, {
      ...DEFAULT_SWIPE_FILTERS,
      when: "Denne uka",
    });
    expect(r.every((e) => e.day === "Denne uka")).toBe(true);
  });

  it("tags keep only experiences sharing a selected interest", () => {
    const tag = experiences.find((e) => e.status !== "cancelled")?.tags[0];
    expect(tag).toBeDefined();
    const r = applySwipeFilters(experiences, {
      ...DEFAULT_SWIPE_FILTERS,
      tags: [tag as string],
    });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((e) => e.tags.includes(tag as string))).toBe(true);
  });

  it("excludes cancelled experiences regardless of mode", () => {
    const r = applySwipeFilters(experiences, DEFAULT_SWIPE_FILTERS);
    expect(r.every((e) => e.status !== "cancelled")).toBe(true);
  });
});
