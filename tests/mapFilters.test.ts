import { describe, expect, it } from "@jest/globals";

import {
  activeExtraFilterCount,
  applyFilters,
  DEFAULT_FILTERS,
  type MapFilters,
} from "@/components/map/MapFilterSheet";
import { places } from "@/fixtures";

const f = (over: Partial<MapFilters>): MapFilters => ({
  ...DEFAULT_FILTERS,
  ...over,
});

describe("applyFilters", () => {
  it("passes everything with default filters", () => {
    expect(applyFilters(places, "", DEFAULT_FILTERS)).toHaveLength(
      places.length,
    );
  });

  it("filters by category", () => {
    const r = applyFilters(places, "", f({ category: "Kafé" }));
    expect(r.every((p) => p.category === "Kafé")).toBe(true);
  });

  it("filters by distance", () => {
    const r = applyFilters(places, "", f({ maxDistanceM: 500 }));
    expect(r.every((p) => p.distanceM <= 500)).toBe(true);
    expect(r.length).toBeLessThan(places.length);
  });

  it("filters by price band", () => {
    const under = applyFilters(places, "", f({ priceBand: "Under 100" }));
    expect(under.every((p) => p.priceNok < 100)).toBe(true);
    const high = applyFilters(places, "", f({ priceBand: "300+" }));
    expect(high).toHaveLength(0); // no fixture place is 300+
  });

  it("filters by vibe (any match)", () => {
    const rolig = applyFilters(places, "", f({ vibes: ["Rolig"] }));
    expect(rolig.every((p) => p.vibes.includes("Rolig"))).toBe(true);
    const koselig = applyFilters(places, "", f({ vibes: ["Koselig"] }));
    expect(koselig.length).toBeLessThan(rolig.length);
  });

  it("filters by open now", () => {
    const r = applyFilters(places, "", f({ openNowOnly: true }));
    expect(r.every((p) => p.openNow)).toBe(true);
  });

  it("filters by query over name/category", () => {
    const r = applyFilters(places, "vin", DEFAULT_FILTERS);
    expect(r.every((p) => /vin/i.test(p.name) || /vin/i.test(p.category))).toBe(
      true,
    );
  });
});

describe("activeExtraFilterCount", () => {
  it("is zero for defaults", () => {
    expect(activeExtraFilterCount(DEFAULT_FILTERS)).toBe(0);
  });

  it("counts each active non-category filter", () => {
    const c = activeExtraFilterCount(
      f({
        maxDistanceM: 500,
        priceBand: "Under 100",
        vibes: ["Rolig"],
        time: "Helg",
        openNowOnly: true,
      }),
    );
    expect(c).toBe(5);
  });
});
