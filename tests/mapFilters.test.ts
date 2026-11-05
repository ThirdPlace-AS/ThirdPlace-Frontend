import { describe, expect, it } from "@jest/globals";

import {
  activeExtraFilterCount,
  applyFilters,
  DEFAULT_FILTERS,
  sortPlaces,
} from "@/components/map/services/mapFilters";
import { places } from "@/fixtures";

describe("applyFilters — Airbnb-style filters", () => {
  it("types OR-match against place.types", () => {
    const res = applyFilters(places, "", {
      ...DEFAULT_FILTERS,
      types: ["Vannsport"],
    });
    expect(res.every((p) => p.types.includes("Vannsport"))).toBe(true);
    expect(res.map((p) => p.id)).toEqual(["p10"]);
  });

  it("price range keeps only places within [priceMin, priceMax]", () => {
    const res = applyFilters(places, "", {
      ...DEFAULT_FILTERS,
      priceMin: 0,
      priceMax: 100,
    });
    expect(res.every((p) => p.priceNok <= 100)).toBe(true);
    expect(res.map((p) => p.id).sort()).toEqual(["p1", "p2", "p5", "p8"]);
  });

  it("durationMaxMin keeps only places at or under the cap", () => {
    const res = applyFilters(places, "", {
      ...DEFAULT_FILTERS,
      durationMaxMin: 60,
    });
    expect(res.every((p) => p.durationMin <= 60)).toBe(true);
  });

  it("audiences OR-match against place.audiences", () => {
    const res = applyFilters(places, "", {
      ...DEFAULT_FILTERS,
      audiences: ["Barn"],
    });
    expect(res.every((p) => p.audiences.includes("Barn"))).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  it("timeOfDay OR-match against place.timeOfDay keys", () => {
    const res = applyFilters(places, "", {
      ...DEFAULT_FILTERS,
      timeOfDay: ["morgen"],
    });
    expect(res.every((p) => p.timeOfDay.includes("morgen"))).toBe(true);
  });

  it("languages OR-match against place.languages", () => {
    const res = applyFilters(places, "", {
      ...DEFAULT_FILTERS,
      languages: ["fransk"],
    });
    expect(res.every((p) => p.languages.includes("fransk"))).toBe(true);
    expect(res.map((p) => p.id).sort()).toEqual(["p12", "p2", "p8"].sort());
  });

  it("minRating keeps only places at or above the threshold", () => {
    const res = applyFilters(places, "", {
      ...DEFAULT_FILTERS,
      minRating: 4.5,
    });
    expect(res.every((p) => p.rating >= 4.5)).toBe(true);
  });

  it("tags require every selected amenity (AND match)", () => {
    const res = applyFilters(places, "", {
      ...DEFAULT_FILTERS,
      tags: ["Wifi"],
    });
    expect(res.every((p) => p.tags.includes("Wifi"))).toBe(true);
  });

  it("accessibility requires every selected option (AND match)", () => {
    const res = applyFilters(places, "", {
      ...DEFAULT_FILTERS,
      accessibility: ["Heis"],
    });
    expect(res.every((p) => p.accessibility.includes("Heis"))).toBe(true);
  });

  it("query matches a place by tag (shared overlay matcher)", () => {
    // "Studievennlig" is a tag on p1, not in its name or category.
    const res = applyFilters(places, "studievennlig", DEFAULT_FILTERS);
    expect(res.map((p) => p.id)).toEqual(["p1"]);
  });

  it("defaults return every place", () => {
    expect(applyFilters(places, "", DEFAULT_FILTERS)).toHaveLength(
      places.length,
    );
  });

  it("demo-only axes (where/date/guests) never narrow results", () => {
    const res = applyFilters(places, "", {
      ...DEFAULT_FILTERS,
      whereArea: "Frogner",
      dateStart: "2026-11-20",
      dateEnd: "2026-11-25",
      guests: {
        adults: 4,
        children: 2,
        infants: 1,
        students: 0,
        pensioners: 0,
      },
    });
    expect(res).toHaveLength(places.length);
  });
});

describe("sortPlaces", () => {
  it("'best' orders by rating desc", () => {
    const res = sortPlaces(places, "best");
    const r = res.map((p) => p.rating);
    expect([...r].sort((a, b) => b - a)).toEqual(r);
  });

  it("'most' orders by reviews desc", () => {
    const res = sortPlaces(places, "most");
    const n = res.map((p) => p.reviews);
    expect([...n].sort((a, b) => b - a)).toEqual(n);
  });

  it("null leaves order unchanged", () => {
    expect(sortPlaces(places, null)).toBe(places);
  });
});

describe("activeExtraFilterCount", () => {
  it("is zero for defaults", () => {
    expect(activeExtraFilterCount(DEFAULT_FILTERS)).toBe(0);
  });

  it("counts each active non-type filter once", () => {
    expect(
      activeExtraFilterCount({
        ...DEFAULT_FILTERS,
        minRating: 4,
        tags: ["Wifi"],
        accessibility: ["Heis"],
        hasSpots: true,
        audiences: ["Barn"],
        timeOfDay: ["morgen"],
      }),
    ).toBe(6);
  });

  it("counts a narrowed price range as one active filter", () => {
    expect(activeExtraFilterCount({ ...DEFAULT_FILTERS, priceMax: 500 })).toBe(
      1,
    );
  });

  it("counts ratingSort but ignores demo-only where/date/guests", () => {
    expect(
      activeExtraFilterCount({ ...DEFAULT_FILTERS, ratingSort: "best" }),
    ).toBe(1);
    expect(
      activeExtraFilterCount({
        ...DEFAULT_FILTERS,
        whereArea: "Frogner",
        dateStart: "2026-11-20",
        guests: {
          adults: 2,
          children: 0,
          infants: 0,
          students: 0,
          pensioners: 0,
        },
      }),
    ).toBe(0);
  });
});
