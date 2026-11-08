// Phase 18 (screen benchmark, "Finding things"): the map pins' categories
// as a filter, picked in Filtre's Kategori section only (founder 2026-11-08:
// no category chips on the map or the search page), and applied filters as
// removable chips on the map and "Fjern «…»".
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MapFilterSheet } from "@/components/map/MapFilterSheet";

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
import {
  MARKER_CATEGORIES,
  MARKER_FILTER_ICON,
  MARKER_LABEL,
  markerCategoryFor,
} from "@/components/map/services/markerCategory";
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

describe("Kategori in Filtre", () => {
  it("draws the categories like the sheet's other groups and filters", () => {
    // One outline icon per category, as Opplevelsestype has.
    expect(
      MARKER_CATEGORIES.every((c) =>
        MARKER_FILTER_ICON[c].endsWith("-outline"),
      ),
    ).toBe(true);
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <MapFilterSheet
          visible
          filters={DEFAULT_FILTERS}
          mode="forYou"
          savedIds={[]}
          onClose={jest.fn()}
          onApply={jest.fn()}
        />
      </SafeAreaProvider>,
    );
    const before = screen.getByText(/^Vis \d+ resultater$/).props.children;
    // Outline chips are buttons with a selected state, like Opplevelsestype.
    for (const c of MARKER_CATEGORIES) {
      expect(
        screen.getByRole("button", { name: MARKER_LABEL[c] }),
      ).toBeTruthy();
    }
    expect(screen.queryAllByRole("checkbox", { name: "Kafé" })).toHaveLength(0);
    const kafe = screen.getByRole("button", { name: "Kafé" });
    fireEvent.press(kafe);
    expect(
      screen.getByRole("button", { name: "Kafé" }).props.accessibilityState,
    ).toMatchObject({ selected: true });
    expect(screen.getByText(/^Vis \d+ resultater$/).props.children).not.toBe(
      before,
    );
  });
});
