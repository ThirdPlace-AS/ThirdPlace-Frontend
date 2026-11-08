// Phase 18 (screen benchmark, "Finding things"): the map pins' categories
// as a filter, picked in Filtre's Kategori section only (founder 2026-11-08:
// no category chips on the map or the search page). Applied filters show on
// the map only as the number on Filtre (founder 2026-11-08, ledger 0317);
// their names reach screen readers through the same labels.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MapFilterSheet } from "@/components/map/MapFilterSheet";

import { MapFilterButton } from "@/components/map/MapFilterButton";
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

describe("applied filters on the map", () => {
  const f: MapFilters = {
    ...DEFAULT_FILTERS,
    hasSpots: true,
    categories: ["kafe"],
  };

  it("show only as the number on Filtre, with no chips to remove", () => {
    const onPress = jest.fn();
    render(
      <MapFilterButton
        filters={f}
        count={activeExtraFilterCount(f)}
        onPress={onPress}
      />,
    );
    expect(screen.getByText("2")).toBeTruthy();
    // No chip and no picker on the map: everything lives in Filtre.
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /^Fjern «/ })).toBeNull();
    expect(screen.queryByText("Kafé")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Filtre" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("name what is applied to a screen reader", () => {
    render(<MapFilterButton filters={f} count={2} onPress={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: "Filtre" }).props.accessibilityValue,
    ).toEqual({ text: "Kafé, Ledige plasser" });
  });

  it("no number and no value when nothing is applied", () => {
    render(
      <MapFilterButton
        filters={DEFAULT_FILTERS}
        count={0}
        onPress={jest.fn()}
      />,
    );
    const button = screen.getByRole("button", { name: "Filtre" });
    // RN fills in an empty value object; no text means nothing is read out.
    expect(button.props.accessibilityValue?.text).toBeUndefined();
    expect(screen.queryByText(/^\d+$/)).toBeNull();
  });
});

describe("Kategori in Filtre", () => {
  it("is one row per category that opens to Alle and filters", () => {
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
    // Founder 2026-11-08 (review): one row per category, each opening to
    // "Alle" and its activities (it replaced the chip grid of ad13df1).
    const rowOf = (label: string) =>
      screen.getAllByRole("button", { name: new RegExp(`^${label}`) })[0]!;
    for (const c of MARKER_CATEGORIES)
      expect(rowOf(MARKER_LABEL[c]).props.accessibilityState).toMatchObject({
        expanded: false,
      });
    fireEvent.press(rowOf("Kafé"));
    expect(rowOf("Kafé").props.accessibilityState).toMatchObject({
      expanded: true,
    });
    fireEvent.press(screen.getByRole("checkbox", { name: "Alle" }));
    expect(rowOf("Kafé").props.accessibilityLabel).toBe("Kafé, Alle");
    expect(screen.getByText(/^Vis \d+ resultat(er)?$/).props.children).not.toBe(
      before,
    );
  });
});
