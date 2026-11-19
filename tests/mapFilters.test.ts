import { describe, expect, it } from "@jest/globals";

import {
  activeExtraFilterCount,
  applyFilters,
  DEFAULT_FILTERS,
} from "@/components/map/services/mapFilters";
import { places, placeRating } from "@/fixtures";

// The exact id lists below were written for the legacy places (p1–p14);
// Phase 19 adds catalogue places that may match too, so those lists run on
// the legacy set and a whole-catalogue check proves the filter itself.
const legacy = places.filter((p) => /^p\d+$/.test(p.id));

describe("applyFilters — Airbnb-style filters", () => {
  it("types OR-match against place.types", () => {
    const res = applyFilters(legacy, "", {
      ...DEFAULT_FILTERS,
      types: ["Vannsport"],
    });
    expect(res.every((p) => p.types.includes("Vannsport"))).toBe(true);
    expect(res.map((p) => p.id)).toEqual(["p10"]);
  });

  it("price range keeps only places within [priceMin, priceMax]", () => {
    const res = applyFilters(legacy, "", {
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
    const res = applyFilters(legacy, "", {
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
    expect(res.every((p) => placeRating(p.id).score >= 4.5)).toBe(true);
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
    const res = applyFilters(legacy, "studievennlig", DEFAULT_FILTERS);
    expect(res.map((p) => p.id)).toEqual(["p1"]);
  });

  it("on the whole catalogue, keeps exactly the places that match", () => {
    const ids = (list: { id: string }[]) => list.map((p) => p.id).sort();
    expect(
      ids(applyFilters(places, "", { ...DEFAULT_FILTERS, types: ["Trening"] })),
    ).toEqual(ids(places.filter((p) => p.types.includes("Trening"))));
    expect(
      ids(
        applyFilters(places, "", {
          ...DEFAULT_FILTERS,
          priceMin: 0,
          priceMax: 100,
        }),
      ),
    ).toEqual(ids(places.filter((p) => p.priceNok <= 100)));
    expect(
      ids(
        applyFilters(places, "", { ...DEFAULT_FILTERS, languages: ["fransk"] }),
      ),
    ).toEqual(ids(places.filter((p) => p.languages.includes("fransk"))));
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

// The places-only "Sorter" (sortPlaces) became orderItems in Phase 19 S4a:
// one order over places and experiences mixed (tests/countyLists.test.tsx).

describe("activeExtraFilterCount", () => {
  it("is zero for defaults", () => {
    expect(activeExtraFilterCount(DEFAULT_FILTERS)).toBe(0);
  });

  it("counts Opplevelsestype too (nothing else on the map shows it)", () => {
    expect(
      activeExtraFilterCount({ ...DEFAULT_FILTERS, types: ["Gallerier"] }),
    ).toBe(1);
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

  it("counts ratingSort but ignores demo-only where/guests", () => {
    expect(
      activeExtraFilterCount({ ...DEFAULT_FILTERS, ratingSort: "best" }),
    ).toBe(1);
    // Phase 18: a picked date narrows experiences (± 1 dag), so it counts.
    expect(
      activeExtraFilterCount({ ...DEFAULT_FILTERS, dateStart: "2026-11-20" }),
    ).toBe(1);
    expect(
      activeExtraFilterCount({
        ...DEFAULT_FILTERS,
        whereArea: "Frogner",
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
