// Phase 12 H5c (user 2026-11-06: "the filter on the swipe needs to be
// identical to the one on the map"): Sveip opens the map's Filtre sheet and
// both surfaces run experiences through applyExperienceFilters. Replaces the
// old swipe-only filter model (swipeFilters.ts).
import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";

import { countResults } from "@/components/map/services/mapFixtureAdapter";
import {
  applyExperienceFilters,
  applyFilters,
  DEFAULT_FILTERS,
  timeOfDayFor,
} from "@/components/map/services/mapFilters";
import {
  experiences,
  placeById,
  places,
  ratingOf,
  reviewsForExperience,
} from "@/fixtures";

const live = experiences.filter((e) => e.status !== "cancelled");
const run = (patch: Partial<typeof DEFAULT_FILTERS>) =>
  applyExperienceFilters(experiences, "", { ...DEFAULT_FILTERS, ...patch });

describe("applyExperienceFilters", () => {
  it("defaults keep every experience that is not cancelled", () => {
    expect(run({}).length).toBe(live.length);
  });

  it("each facet reads a real field", () => {
    const e = live[0]!;
    expect(
      run({ types: [e.types[0]!] }).every((x) => x.types.includes(e.types[0]!)),
    ).toBe(true);
    expect(run({ priceMin: 1 }).every((x) => (x.priceNok ?? 0) >= 1)).toBe(
      true,
    );
    expect(run({ durationMaxMin: 60 }).every((x) => x.durationMin <= 60)).toBe(
      true,
    );
    expect(run({ hasSpots: true }).every((x) => x.capacity > x.going)).toBe(
      true,
    );
    expect(run({ time: e.day }).every((x) => x.day === e.day)).toBe(true);
    expect(
      run({ audiences: [e.audiences[0]!] }).every((x) =>
        x.audiences.includes(e.audiences[0]!),
      ),
    ).toBe(true);
    // Languages compare without case ("Engelsk" matches "engelsk").
    expect(
      run({ languages: ["engelsk"] }).every((x) =>
        x.languages.includes("Engelsk"),
      ),
    ).toBe(true);
    expect(run({ languages: ["engelsk"] }).length).toBeGreaterThan(0);
  });

  it("rating uses the experience's own reviews", () => {
    for (const x of run({ minRating: 4.5 })) {
      expect(ratingOf(reviewsForExperience(x.id)).score).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });

  it("venue facts come from the place it is held at", () => {
    const withTags = run({ tags: ["Wifi"] });
    for (const x of withTags)
      expect(placeById(x.placeId)?.tags).toContain("Wifi");
  });

  it("time of day follows the start time", () => {
    expect(timeOfDayFor("Ons 09:00")).toBe("morgen");
    expect(timeOfDayFor("Lør 14:00")).toBe("ettermiddag");
    expect(timeOfDayFor("Fre 19:30")).toBe("kveld");
    for (const x of run({ timeOfDay: ["morgen"] }))
      expect(timeOfDayFor(x.when)).toBe("morgen");
  });
});

describe("one pipeline for the map and Sveip", () => {
  it("the map count equals places + experiences after the same filters", () => {
    const f = { ...DEFAULT_FILTERS, hasSpots: true, priceMax: 200 };
    const n = countResults({
      mode: "explore",
      allPlaces: places,
      query: "",
      filters: f,
      savedIds: [],
    });
    expect(n).toBe(
      applyFilters(places, "", f).length +
        applyExperienceFilters(experiences, "", f).length,
    );
  });

  it("Sveip opens the map's Filtre sheet, not a sheet of its own", () => {
    const src = fs.readFileSync(
      path.join(__dirname, "..", "src", "components", "swipe", "SwipeDeck.tsx"),
      "utf8",
    );
    expect(src).toContain("<MapFilterSheet");
    expect(src).not.toContain("SwipeFilterSheet");
    expect(
      fs.existsSync(
        path.join(
          __dirname,
          "..",
          "src",
          "components",
          "swipe",
          "SwipeFilterSheet.tsx",
        ),
      ),
    ).toBe(false);
  });
});
