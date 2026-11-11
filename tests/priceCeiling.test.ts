// Phase 19 S0: the price filter's top is open. The ceiling covers places and
// experiences, and an item dearer than the ceiling (one published from
// Legg til) still shows until someone lowers the top of the range.
import { afterEach, describe, expect, it } from "@jest/globals";

import { countResults } from "@/components/map/services/mapFixtureAdapter";
import {
  applyExperienceFilters,
  DEFAULT_FILTERS,
  PRICE_CEIL,
  withinPrice,
} from "@/components/map/services/mapFilters";
import { experiences, places } from "@/fixtures";
import { createExperience, resetCreated } from "@/fixtures/created";

afterEach(() => resetCreated());

const DEAR = {
  title: "Middag med seiltur",
  about: "Vi seiler ut og spiser om bord.",
  category: "Kurs & smaking",
  area: places[0]!.name,
  meetingPoint: "",
  photos: experiences[0]!.photos,
  date: "2026-11-20",
  startTime: "18:00",
  duration: "3 timer",
  repeat: "Ukentlig",
  capacity: 6,
  priceNok: PRICE_CEIL + 350,
  access: "Alle",
  cancellation: "Gratis frem til 24 t før",
  vibes: ["Koselig"],
  energy: null,
  languages: ["Norsk"],
  included: ["Middag"],
  steps: ["Vi møtes", "", "Vi seiler"],
};

describe("price ceiling", () => {
  it("covers the dearest place and the dearest experience", () => {
    const dearestPlace = Math.max(...places.map((p) => p.priceNok));
    const dearestExp = Math.max(...experiences.map((e) => e.priceNok ?? 0));
    expect(PRICE_CEIL).toBe(Math.max(dearestPlace, dearestExp));
  });

  it("has an open top: anything dearer passes until the top is lowered", () => {
    expect(withinPrice(PRICE_CEIL + 5000, DEFAULT_FILTERS)).toBe(true);
    const lowered = { ...DEFAULT_FILTERS, priceMax: PRICE_CEIL - 10 };
    expect(withinPrice(PRICE_CEIL + 5000, lowered)).toBe(false);
    expect(withinPrice(PRICE_CEIL - 10, lowered)).toBe(true);
    const raisedFloor = { ...DEFAULT_FILTERS, priceMin: 100 };
    expect(withinPrice(50, raisedFloor)).toBe(false);
  });

  it("keeps an experience from Legg til above the ceiling on the map", () => {
    const id = createExperience(DEAR);
    const shown = applyExperienceFilters(experiences, "", DEFAULT_FILTERS);
    expect(shown.some((e) => e.id === id)).toBe(true);
    const capped = applyExperienceFilters(experiences, "", {
      ...DEFAULT_FILTERS,
      priceMax: PRICE_CEIL - 10,
    });
    expect(capped.some((e) => e.id === id)).toBe(false);
    // The Filtre footer counts it too.
    const withIt = countResults({
      mode: "explore",
      allPlaces: places,
      query: "",
      filters: DEFAULT_FILTERS,
      savedIds: [],
    });
    resetCreated();
    const without = countResults({
      mode: "explore",
      allPlaces: places,
      query: "",
      filters: DEFAULT_FILTERS,
      savedIds: [],
    });
    expect(withIt).toBe(without + 1);
  });
});
