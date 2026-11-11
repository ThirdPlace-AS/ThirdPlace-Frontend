// Search by type (R2b, user 2026-11-10: "the user should be able to search for
// a type of experiance, city space or business and get result").
import { describe, expect, it } from "@jest/globals";

import {
  DEFAULT_FILTERS,
  applyFilters,
} from "@/components/map/services/mapFilters";
import {
  countResults,
  resultForMode,
} from "@/components/map/services/mapFixtureAdapter";
import {
  foldText,
  placeMatchesQuery,
  searchFixtures,
  wordForms,
} from "@/components/map/services/mapSearch";
import {
  areaFor,
  experienceById,
  organizationForPlace,
  placeById,
  places,
  type MockPlace,
} from "@/fixtures";
import { distanceMeters } from "@/lib/distance";
import { getOrigin } from "@/lib/origin";

const placeOf = (id: string) => placeById(id)!;
const expOf = (id: string) => experienceById(id)!;

describe("text folding", () => {
  it("folds accents but keeps æ, ø, å", () => {
    expect(foldText("Kafé")).toBe("kafe");
    expect(foldText("Grünerløkka")).toBe("grunerløkka");
    expect(foldText("Åpent på Ærø")).toBe("åpent på ærø");
  });

  it("drops plural and definite endings, keeping the word as typed", () => {
    expect(wordForms("parken")).toEqual(
      expect.arrayContaining(["parken", "park"]),
    );
    expect(wordForms("parker")).toContain("park");
    expect(wordForms("festivalene")).toContain("festival");
    expect(wordForms("byrommet")).toContain("byrom");
    expect(wordForms("kafeen")).toContain("kafe");
    expect(wordForms("tur")).toEqual(["tur"]);
  });
});

describe("type words find their items", () => {
  it("byrom: city spaces only", () => {
    const r = searchFixtures("byrom");
    expect(r.places.length).toBeGreaterThan(0);
    expect(r.places.every((p) => placeOf(p.id).kind === "byrom")).toBe(true);
  });

  it("bedrift: businesses only", () => {
    const r = searchFixtures("bedrift");
    expect(r.places.length).toBeGreaterThan(0);
    expect(r.places.every((p) => placeOf(p.id).kind === "bedrift")).toBe(true);
  });

  it.each(["park", "parker", "parken", "Parkene"])(
    "%s: parks first (a category ending in park)",
    (q) => {
      const r = searchFixtures(q);
      expect(r.places.length).toBeGreaterThan(0);
      for (const p of r.places)
        expect(foldText(placeOf(p.id).category)).toMatch(/park$/);
    },
  );

  it("kafe (no accent) finds the cafés", () => {
    const r = searchFixtures("kafe");
    expect(r.places.length).toBeGreaterThan(0);
    for (const p of r.places)
      expect(foldText(placeOf(p.id).category)).toMatch(/kafe$/);
  });

  it("forening and klubb find them by their form or category", () => {
    // An organisation whose form is the word, or any place whose category
    // ends with it (a "Nattklubb" is a club too).
    for (const q of ["forening", "klubb"]) {
      const r = searchFixtures(q);
      expect(r.places.length).toBeGreaterThan(0);
      for (const p of r.places) {
        const place = placeOf(p.id);
        const form = foldText(organizationForPlace(place.id)?.form ?? "");
        expect(form === q || foldText(place.category).endsWith(q)).toBe(true);
      }
      expect(r.places.some((p) => placeOf(p.id).kind === "organisasjon")).toBe(
        true,
      );
    }
  });

  it("arrangement and festival find events; festival only the multi-day ones", () => {
    const events = searchFixtures("arrangement");
    expect(events.experiences.length).toBeGreaterThan(0);
    expect(
      events.experiences.every((e) => expOf(e.id).format === "event"),
    ).toBe(true);
    // A festival: an event over several days, or one its host typed
    // "Festivaler" (Opplevelsestype).
    const fest = searchFixtures("festivaler");
    expect(fest.experiences.length).toBeGreaterThan(0);
    for (const e of fest.experiences) {
      const x = expOf(e.id);
      expect((x.days ?? 1) > 1 || (x.types ?? []).includes("Festivaler")).toBe(
        true,
      );
    }
  });

  it("kurs finds courses (the experience category)", () => {
    const r = searchFixtures("kurs");
    expect(r.experiences.length).toBeGreaterThan(0);
    for (const e of r.experiences)
      expect(expOf(e.id).category).toBe("Kurs & smaking");
  });

  it("opplevelse finds experiences", () => {
    expect(searchFixtures("opplevelser").experiences.length).toBeGreaterThan(0);
  });
});

describe("several words, areas and short words", () => {
  it("a type and a municipality: that type there", () => {
    const space = places.find(
      (p) => p.kind === "byrom" && areaFor(p.coord).municipality === "Bærum",
    )!;
    const word = foldText(space.category).split(" ").at(-1)!;
    const r = searchFixtures(`${word} i bærum`);
    expect(r.places.map((p) => p.id)).toContain(space.id);
    for (const p of r.places)
      expect(areaFor(placeOf(p.id).coord).municipality).toBe("Bærum");
  });

  it("an area alone finds what it did before (names and tags only)", () => {
    const r = searchFixtures("oslo");
    for (const p of r.places) {
      const place = placeOf(p.id);
      const own = foldText([place.name, ...place.tags].join(" "));
      expect(own).toContain("oslo");
    }
  });

  it("words of three letters match only at the start of a word", () => {
    const base = places[0]!;
    const fake = (over: Partial<MockPlace>) =>
      ({
        ...base,
        id: "zz-test",
        interestId: undefined,
        category: "Verksted",
        types: [],
        tags: [],
        name: "Testsjappa",
        ...over,
      }) as MockPlace;
    expect(placeMatchesQuery(fake({ tags: ["Kultur"] }), "tur")).toBe(false);
    expect(placeMatchesQuery(fake({ tags: ["Tur"] }), "tur")).toBe(true);
    expect(placeMatchesQuery(fake({ category: "Skatepark" }), "park")).toBe(
      true,
    );
  });
});

describe("order and counts", () => {
  it("equally good matches are listed nearest first", () => {
    const origin = getOrigin().coord;
    const d = searchFixtures("bedrift").places.map((p) =>
      distanceMeters(origin, placeOf(p.id).coord),
    );
    expect([...d].sort((a, b) => a - b)).toEqual(d);
  });

  it("says how many a submit puts on the map", () => {
    const r = searchFixtures("bedrift");
    const all = places.filter((p) => placeMatchesQuery(p, "bedrift")).length;
    expect(r.onMap).toBeGreaterThanOrEqual(all);
    expect(all).toBeGreaterThan(r.places.length);
  });

  it("the footer count is still the list's length for a type word", () => {
    const filters = DEFAULT_FILTERS;
    for (const query of ["park", "festival", "bedrift i bærum"]) {
      for (const mode of ["forYou", "explore", "trending", "live"] as const) {
        const list = resultForMode({
          mode,
          places: applyFilters(places, query, filters),
          query,
          savedIds: [],
          time: filters.time,
          hasSpots: filters.hasSpots,
          filters,
        }).items;
        expect(
          countResults({
            mode,
            allPlaces: places,
            query,
            filters,
            savedIds: [],
          }),
        ).toBe(list.length);
      }
    }
  });
});
