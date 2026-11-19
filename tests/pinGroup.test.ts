import { describe, expect, it } from "@jest/globals";

import { experiences, places } from "@/fixtures";
import { INTERESTS, type Interest } from "@/fixtures/catalog/interests";
import {
  INTEREST_PIN_GROUP,
  PIN_GROUPS,
  pinGroupFor,
} from "@/components/map/services/pinGroup";
import { markerCategoryFor } from "@/components/map/services/markerCategory";

// User 2026-11-11: "the colors need to change too"; answers: familiar map
// colours, experiences use the same colours, Filtre's Kategori stays by
// interest.
describe("pin groups", () => {
  it("gives every interest a group, and only known interests", () => {
    for (const i of INTERESTS as readonly Interest[])
      expect(PIN_GROUPS).toContain(INTEREST_PIN_GROUP[i.id]);
    const ids = new Set((INTERESTS as readonly Interest[]).map((i) => i.id));
    for (const id of Object.keys(INTEREST_PIN_GROUP))
      expect(ids.has(id)).toBe(true);
  });

  it("gives places of one kind one group, whatever their interest", () => {
    const byCategory = new Map<string, Set<string>>();
    for (const p of places) {
      const set = byCategory.get(p.category) ?? new Set<string>();
      set.add(pinGroupFor({ kind: "place", id: p.id }));
      byCategory.set(p.category, set);
    }
    for (const [, groups] of byCategory) expect(groups.size).toBe(1);
  });

  it("colours an experience by its activity", () => {
    for (const e of experiences)
      expect(pinGroupFor({ kind: "experience", id: e.id })).toBe(
        INTEREST_PIN_GROUP[e.interestId!],
      );
  });

  it("leaves Filtre's Kategori on the interest's category", () => {
    // The baking interest's park: green on the map, still under Kafé.
    const park = places.find(
      (p) => p.category === "Park" && p.interestId === "bakst",
    )!;
    expect(pinGroupFor({ kind: "place", id: park.id })).toBe("nature");
    expect(markerCategoryFor({ kind: "place", id: park.id })).toBe("kafe");
  });
});
