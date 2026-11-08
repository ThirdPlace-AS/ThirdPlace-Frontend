// Phase 19 (founder 2026-11-08): "The categories in the filter modal must be
// nested so the users can filter to only a specific type of activity." Each
// chosen category in Filtre's Kategori opens its activities (the interests in
// it); picking some narrows that category to exactly those, "Alle" keeps the
// whole category. The map, Sveip, the applied chips and the badge follow.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  MapFilterSheet,
  categoryRowState,
  toggleActivity,
  toggleWholeCategory,
} from "@/components/map/MapFilterSheet";
import { resultForMode } from "@/components/map/services/mapFixtureAdapter";
import {
  activeExtraFilterCount,
  appliedFilterChips,
  applyExperienceFilters,
  applyFilters,
  categoryMatch,
  DEFAULT_FILTERS,
  type MapFilters,
} from "@/components/map/services/mapFilters";
import { markerCategoryFor } from "@/components/map/services/markerCategory";
import { experiences, places } from "@/fixtures";

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

const pick = (over: Partial<MapFilters>): MapFilters => ({
  ...DEFAULT_FILTERS,
  ...over,
});
const treningOnly = pick({ categories: ["trening"] });
const klatring = pick({ categories: ["trening"], interests: ["klatring"] });

describe("the matching rule", () => {
  it("keeps everything until something is chosen", () => {
    expect(categoryMatch(DEFAULT_FILTERS, "kafe", "kaffe")).toBe(true);
  });

  it("a category keeps all of itself until an activity in it is picked", () => {
    expect(categoryMatch(treningOnly, "trening", "loping")).toBe(true);
    expect(categoryMatch(treningOnly, "kafe", "kaffe")).toBe(false);
    expect(categoryMatch(klatring, "trening", "klatring")).toBe(true);
    expect(categoryMatch(klatring, "trening", "loping")).toBe(false);
    // An item made in Legg til has no interest: the category decides.
    expect(categoryMatch(treningOnly, "trening", undefined)).toBe(true);
    expect(categoryMatch(klatring, "trening", undefined)).toBe(false);
  });

  it("narrows one category without touching another", () => {
    const f = pick({
      categories: ["trening", "kafe"],
      interests: ["klatring"],
    });
    expect(categoryMatch(f, "kafe", "kaffe")).toBe(true);
    expect(categoryMatch(f, "trening", "klatring")).toBe(true);
    expect(categoryMatch(f, "trening", "padel")).toBe(false);
  });
});

describe("places, experiences and the map follow it", () => {
  it("one activity keeps only its places and experiences", () => {
    const ps = applyFilters(places, "", klatring);
    expect(ps.length).toBeGreaterThan(0);
    expect(ps.every((p) => p.interestId === "klatring")).toBe(true);
    const es = applyExperienceFilters(experiences, "", klatring);
    expect(es.map((e) => e.id).sort()).toEqual([
      "e-klatring",
      "e-klatring-arr",
    ]);
    const items = resultForMode({
      mode: "explore",
      places: ps,
      query: "",
      savedIds: [],
      filters: klatring,
    }).items;
    expect(items).toHaveLength(ps.length + es.length);
  });

  it("the category alone keeps every activity in it", () => {
    const ps = applyFilters(places, "", treningOnly);
    expect(
      ps.every(
        (p) => markerCategoryFor({ kind: "place", id: p.id }) === "trening",
      ),
    ).toBe(true);
    expect(ps.length).toBeGreaterThan(
      applyFilters(places, "", klatring).length,
    );
  });
});

describe("chips and badge", () => {
  it("show the picked activity, and removing it clears the category", () => {
    const chips = appliedFilterChips(klatring);
    expect(chips.map((c) => c.label)).toEqual(["Klatring"]);
    expect(chips[0]!.remove(klatring)).toMatchObject({
      categories: [],
      interests: [],
    });
    expect(appliedFilterChips(treningOnly).map((c) => c.label)).toEqual([
      "Trening",
    ]);
  });

  it("removing one of two activities keeps the other", () => {
    const two = pick({
      categories: ["trening"],
      interests: ["klatring", "padel"],
    });
    const chips = appliedFilterChips(two);
    expect(chips.map((c) => c.label)).toEqual(["Klatring", "Padel"]);
    expect(chips[0]!.remove(two)).toMatchObject({
      categories: ["trening"],
      interests: ["padel"],
    });
  });

  it("count once in the badge", () => {
    expect(activeExtraFilterCount(klatring)).toBe(1);
    expect(activeExtraFilterCount(treningOnly)).toBe(1);
  });
});

describe("Filtre's Kategori rows (founder 2026-11-08)", () => {
  it("say what is picked and follow the row rules", () => {
    const none = { categories: [], interests: [] };
    expect(categoryRowState(none, "trening").summary).toBeUndefined();
    const whole = toggleWholeCategory(none, "trening");
    expect(whole).toEqual({ categories: ["trening"], interests: [] });
    expect(categoryRowState(whole, "trening").summary).toBe("Alle");
    // An activity narrows the whole category to itself.
    const one = toggleActivity(whole, "trening", "klatring");
    expect(one).toEqual({ categories: ["trening"], interests: ["klatring"] });
    expect(categoryRowState(one, "trening").summary).toBe("Klatring");
    const two = toggleActivity(one, "trening", "padel");
    expect(categoryRowState(two, "trening").summary).toBe("2 valgt");
    // "Alle" again goes back to the whole category, then off.
    expect(toggleWholeCategory(two, "trening")).toEqual(whole);
    expect(toggleWholeCategory(whole, "trening")).toEqual(none);
    // Leaving the last activity leaves the category.
    expect(toggleActivity(one, "trening", "klatring")).toEqual(none);
  });

  it("open to their activities and filter to one", () => {
    render(
      <MapFilterSheet
        visible
        filters={DEFAULT_FILTERS}
        mode="explore"
        savedIds={[]}
        onClose={jest.fn()}
        onApply={jest.fn()}
      />,
      { wrapper },
    );
    const count = () =>
      screen.getByText(/^Vis \d+ resultat(er)?$/).props.children as string;
    const all = count();
    // Collapsed rows keep their activities hidden.
    expect(screen.queryByRole("checkbox", { name: "Klatring" })).toBeNull();
    // Kategori comes first; Opplevelsestype further down has its own Trening.
    const row = () => screen.getAllByRole("button", { name: /^Trening/ })[0]!;
    fireEvent.press(row());
    expect(screen.getByRole("checkbox", { name: "Alle" })).toBeTruthy();
    fireEvent.press(screen.getByRole("checkbox", { name: "Klatring" }));
    expect(count()).toBe("Vis 5 resultater");
    expect(row().props.accessibilityLabel).toBe("Trening, Klatring");
    // Off again: nothing filtered.
    fireEvent.press(screen.getByRole("checkbox", { name: "Klatring" }));
    expect(count()).toBe(all);
    expect(row().props.accessibilityLabel).toBe("Trening");
    // "Alle": the whole category, then off.
    fireEvent.press(screen.getByRole("checkbox", { name: "Alle" }));
    expect(count()).not.toBe(all);
    expect(row().props.accessibilityLabel).toBe("Trening, Alle");
    fireEvent.press(screen.getByRole("checkbox", { name: "Alle" }));
    expect(count()).toBe(all);
  });
});
