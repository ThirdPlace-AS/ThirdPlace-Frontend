// Phase 18 (screen benchmark, "Finding things"): the map pins' categories
// as a filter, picked in Filtre's Kategori section only (founder 2026-11-08:
// no category chips on the map or the search page), and applied filters as
// removable chips on the map and "Fjern «…»".
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { MapQuickChips } from "@/components/map/MapQuickChips";
import {
  activeExtraFilterCount,
  appliedFilterChips,
  applyExperienceFilters,
  applyFilters,
  DEFAULT_FILTERS,
  type MapFilters,
} from "@/components/map/services/mapFilters";
import { countResults } from "@/components/map/services/mapFixtureAdapter";
import { markerCategoryFor } from "@/components/map/services/markerCategory";
import { experiences, places } from "@/fixtures";

const withCats = (cats: MapFilters["categories"]): MapFilters => ({
  ...DEFAULT_FILTERS,
  categories: cats,
});

describe("Kategori filter", () => {
  it("keeps only places and experiences in the chosen categories", () => {
    const f = withCats(["kafe", "natur"]);
    const ps = applyFilters(places, "", f);
    expect(ps.length).toBeGreaterThan(0);
    expect(ps.length).toBeLessThan(places.length);
    for (const p of ps)
      expect(["kafe", "natur"]).toContain(
        markerCategoryFor({ kind: "place", id: p.id }),
      );
    const es = applyExperienceFilters(experiences, "", f);
    for (const e of es)
      expect(["kafe", "natur"]).toContain(
        markerCategoryFor({ kind: "experience", id: e.id }),
      );
  });

  it("counts in the Filtre badge and in Vis N resultater like the list", () => {
    const f = withCats(["kafe"]);
    expect(activeExtraFilterCount(f)).toBe(1);
    expect(activeExtraFilterCount(DEFAULT_FILTERS)).toBe(0);
    const n = countResults({
      mode: "explore",
      allPlaces: places,
      query: "",
      filters: f,
      savedIds: [],
    });
    const all = countResults({
      mode: "explore",
      allPlaces: places,
      query: "",
      filters: DEFAULT_FILTERS,
      savedIds: [],
    });
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThan(all);
  });
});

describe("applied filters as chips", () => {
  it("names each value in the sheet's words and removes only that one", () => {
    const f: MapFilters = {
      ...DEFAULT_FILTERS,
      categories: ["kafe"],
      time: "I dag",
      timeOfDay: ["kveld"],
      maxDistanceM: 1000,
      hasSpots: true,
      languages: ["engelsk"],
    };
    const chips = appliedFilterChips(f);
    expect(chips.map((c) => c.label)).toEqual([
      "Kafé",
      "I dag",
      "Kveld",
      "Ledige plasser",
      "Innen 1 km",
      "Engelsk",
    ]);
    const kveld = chips.find((c) => c.label === "Kveld")!;
    const next = kveld.remove(f);
    expect(next.timeOfDay).toEqual([]);
    expect(next.time).toBe("I dag");
    expect(appliedFilterChips(next)).toHaveLength(5);
  });

  it("no chips when nothing narrows the results", () => {
    expect(appliedFilterChips(DEFAULT_FILTERS)).toEqual([]);
    // Hvor only recentres the map: no chip.
    expect(
      appliedFilterChips({ ...DEFAULT_FILTERS, whereArea: "Frogner" }),
    ).toEqual([]);
  });
});

describe("applied chips on the map", () => {
  it("shows only applied filters, a chosen category among them", () => {
    const onChange = jest.fn();
    const f: MapFilters = {
      ...DEFAULT_FILTERS,
      hasSpots: true,
      categories: ["kafe"],
    };
    render(<MapQuickChips filters={f} onChange={onChange} />);
    // No category picker on the map: categories are chosen in Filtre.
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    fireEvent.press(screen.getByRole("button", { name: "Fjern «Kafé»" }));
    expect(onChange).toHaveBeenLastCalledWith({ ...f, categories: [] });
    fireEvent.press(
      screen.getByRole("button", { name: "Fjern «Ledige plasser»" }),
    );
    expect(onChange).toHaveBeenLastCalledWith({ ...f, hasSpots: false });
  });

  it("no row when nothing is applied", () => {
    render(<MapQuickChips filters={DEFAULT_FILTERS} onChange={jest.fn()} />);
    expect(screen.toJSON()).toBeNull();
  });
});
