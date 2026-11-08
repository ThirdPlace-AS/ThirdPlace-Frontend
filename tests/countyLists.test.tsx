// Phase 19 S4a (founder 2026-11-08): with pins across Oslo and Akershus the
// lists are nearest first from the person, places and experiences mixed;
// Trending puts the most-reviewed first and a chosen rating sort (Sorter)
// wins. Avstand measures from the person (the phone, a picked area or
// Grünerløkka), to the meeting point for experiences, in county-scale steps.
// Sveip decks are built nearest first. The area pickers group Oslo and
// Akershus by region.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { stepAt } from "@/components/SteppedSlider";
import { MapFilterSheet } from "@/components/map/MapFilterSheet";
import { MapLocationSheet } from "@/components/map/MapLocationSheet";
import { WhereField } from "@/components/map/WhereField";
import { useMapDiscovery } from "@/components/map/hooks/useMapDiscovery";
import { useMapFilters } from "@/components/map/hooks/useMapFilters";
import {
  orderItems,
  resultForMode,
} from "@/components/map/services/mapFixtureAdapter";
import {
  appliedFilterChips,
  applyExperienceFilters,
  applyFilters,
  DEFAULT_FILTERS,
} from "@/components/map/services/mapFilters";
import type { DiscoveryItem } from "@/components/map/types/mapPresentation";
import { deckFor } from "@/components/swipe/deckItems";
import {
  AREAS,
  REGIONS,
  areaFor,
  areaNameLabel,
  areasByRegion,
  experienceById,
  experiences,
  placeById,
  places,
} from "@/fixtures";
import { distanceMeters } from "@/lib/distance";
import { resetOrigin, setOriginArea, type Origin } from "@/lib/origin";

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

afterEach(() => act(() => resetOrigin()));

const area = (name: string) => AREAS.find((a) => a.name === name)!;
const at = (name: string): Origin => ({
  coord: area(name).coord,
  source: "area",
});
const listFrom = (origin: Origin, over: Partial<typeof DEFAULT_FILTERS> = {}) =>
  resultForMode({
    mode: "explore",
    places,
    query: "",
    savedIds: [],
    filters: { ...DEFAULT_FILTERS, ...over },
    origin,
  }).items;
const ascending = (xs: number[]) =>
  xs.every((x, i) => i === 0 || xs[i - 1]! <= x);
const descending = (xs: number[]) =>
  xs.every((x, i) => i === 0 || xs[i - 1]! >= x);

describe("the list order", () => {
  it("is nearest first, places and experiences mixed", () => {
    const o = at("Grünerløkka");
    const items = listFrom(o);
    for (const i of items)
      expect(i.distanceM).toBeCloseTo(distanceMeters(o.coord, i.coord), 6);
    expect(ascending(items.map((i) => i.distanceM!))).toBe(true);
    // Mixed, not places first: an experience comes before the last place.
    const kinds = items.map((i) => i.kind);
    expect(kinds.indexOf("experience")).toBeLessThan(
      kinds.lastIndexOf("place"),
    );
  });

  it("follows the origin: from Jessheim, Romerike comes first", () => {
    const items = listFrom(at("Jessheim"));
    expect(areaFor(items[0]!.coord).region).toBe("Romerike");
    expect(items[0]!.id).not.toBe(listFrom(at("Grünerløkka"))[0]!.id);
  });

  it("Trending puts the most-reviewed first, the nearer one on a tie", () => {
    const items = resultForMode({
      mode: "trending",
      places,
      query: "",
      savedIds: [],
      filters: DEFAULT_FILTERS,
      origin: at("Grünerløkka"),
    }).items;
    const n = items.map((i) => i.reviewCount ?? 0);
    expect(descending(n)).toBe(true);
    for (let k = 1; k < items.length; k++)
      if (n[k] === n[k - 1])
        expect(items[k - 1]!.distanceM!).toBeLessThanOrEqual(
          items[k]!.distanceM!,
        );
  });

  it("a chosen rating sort wins over distance and Trending", () => {
    for (const mode of ["explore", "trending"] as const) {
      const best = resultForMode({
        mode,
        places,
        query: "",
        savedIds: [],
        filters: { ...DEFAULT_FILTERS, ratingSort: "best" },
        origin: at("Grünerløkka"),
      }).items;
      expect(descending(best.map((i) => i.rating ?? 0))).toBe(true);
      expect(new Set(best.map((i) => i.kind)).size).toBe(2);
    }
    const most = listFrom(at("Grünerløkka"), { ratingSort: "most" });
    expect(descending(most.map((i) => i.reviewCount ?? 0))).toBe(true);
  });

  it("keeps the input order on equal keys", () => {
    const same = (id: string): DiscoveryItem => ({
      markerId: `place:${id}`,
      kind: "place",
      id,
      coord: [10.75, 59.92],
      category: "Kafé",
      title: id,
      subtitle: "",
      distanceM: 100,
    });
    const out = orderItems([same("b"), same("a"), same("c")], "explore", null);
    expect(out.map((i) => i.id)).toEqual(["b", "a", "c"]);
  });

  it("Live and Lagret are nearest first too", () => {
    const o = at("Sandvika");
    const live = resultForMode({
      mode: "live",
      places,
      query: "",
      savedIds: [],
      filters: DEFAULT_FILTERS,
      origin: o,
    }).items;
    expect(ascending(live.map((i) => i.distanceM!))).toBe(true);
    const savedIds = ["place:p1", "place:p-klatring-r", "experience:e1"];
    const saved = resultForMode({
      mode: "saved",
      places,
      query: "",
      savedIds,
      origin: o,
    }).items;
    expect(saved).toHaveLength(3);
    expect(ascending(saved.map((i) => i.distanceM!))).toBe(true);
    // Kolsås is the nearest of the three to Sandvika.
    expect(saved[0]!.id).toBe("p-klatring-r");
  });
});

describe("Avstand", () => {
  it("measures places from the person", () => {
    const f = { ...DEFAULT_FILTERS, maxDistanceM: 5000 };
    const o = at("Grünerløkka");
    expect(applyFilters(places, "", f, o)).toEqual(
      places.filter((p) => distanceMeters(o.coord, p.coord) <= 5000),
    );
    const j = at("Jessheim");
    const wide = { ...DEFAULT_FILTERS, maxDistanceM: 25000 };
    const ids = applyFilters(places, "", wide, j).map((p) => p.id);
    expect(ids).toContain("p-klatring-b"); // Lillestrøm
    expect(ids).not.toContain("p1"); // Grünerløkka
  });

  it("measures experiences to their meeting point, outdoor ones too", () => {
    const o = at("Grünerløkka");
    const all = applyExperienceFilters(experiences, "", DEFAULT_FILTERS, o);
    const capped = applyExperienceFilters(
      experiences,
      "",
      { ...DEFAULT_FILTERS, maxDistanceM: 5000 },
      o,
    );
    expect(capped).toEqual(
      all.filter((e) => distanceMeters(o.coord, e.meetingPoint.coord) <= 5000),
    );
    expect(capped.map((e) => e.id)).not.toContain("e-klatring-arr");
  });

  it("offers 1 to 50 km and Alle, and names the cap on its chip", () => {
    const chip = appliedFilterChips({
      ...DEFAULT_FILTERS,
      maxDistanceM: 25000,
    }).find((c) => c.key === "maxDistanceM");
    expect(chip?.label).toBe("Innen 25 km");
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
    for (const l of ["1 km", "5 km", "10 km", "25 km", "50 km"])
      expect(screen.getAllByText(l).length).toBeGreaterThan(0);
    expect(screen.queryByText("500 m")).toBeNull();
  });

  it("picks the step nearest to where the track is touched", () => {
    // Six steps on a 300 dp track: 0, 60, 120 … 300.
    expect(stepAt(0, 300, 5)).toBe(0);
    expect(stepAt(170, 300, 5)).toBe(3);
    expect(stepAt(300, 300, 5)).toBe(5);
    expect(stepAt(-20, 300, 5)).toBe(0);
    expect(stepAt(999, 300, 5)).toBe(5);
    expect(stepAt(10, 0, 5)).toBe(0);
  });
});

describe("the map's hooks", () => {
  it("re-sort and re-filter when the origin moves", () => {
    const { result } = renderHook(() => {
      const f = useMapFilters();
      const d = useMapDiscovery({
        places: f.filteredPlaces,
        query: f.query,
        savedIds: [],
        time: f.filters.time,
        hasSpots: f.filters.hasSpots,
        filters: f.filters,
        initial: "explore",
      });
      return { f, d };
    });
    const before = result.current.d.items.map((i) => i.id);
    const j = area("Jessheim").coord;
    act(() => setOriginArea(j));
    const after = result.current.d.items.map((i) => i.id);
    expect(after).not.toEqual(before);
    const nearest = [...result.current.d.items].sort(
      (a, b) => distanceMeters(j, a.coord) - distanceMeters(j, b.coord),
    )[0]!;
    expect(after[0]).toBe(nearest.id);
    act(() =>
      result.current.f.setFilters((x) => ({ ...x, maxDistanceM: 25000 })),
    );
    const capped = result.current.d.items;
    expect(capped.length).toBeGreaterThan(0);
    expect(capped.every((i) => distanceMeters(j, i.coord) <= 25000)).toBe(true);
  });
});

describe("Sveip decks", () => {
  it("are nearest first from where the person is", () => {
    const o = at("Sandvika");
    for (const placesTab of [true, false]) {
      const deck = deckFor(placesTab, DEFAULT_FILTERS, o);
      const coordOf = (id: string) =>
        placesTab
          ? placeById(id)!.coord
          : experienceById(id)!.meetingPoint.coord;
      const d = deck.map((c) => distanceMeters(o.coord, coordOf(c.id)));
      expect(ascending(d)).toBe(true);
      expect(deck).toHaveLength(
        placesTab
          ? applyFilters(places, "", DEFAULT_FILTERS, o).length
          : applyExperienceFilters(experiences, "", DEFAULT_FILTERS, o).length,
      );
    }
    expect(deckFor(true, DEFAULT_FILTERS, o)[0]!.id).toBe("p-klatring-r");
  });
});

describe("area pickers", () => {
  it("group every area by region, in order", () => {
    const g = areasByRegion();
    expect(g.map((x) => x.region)).toEqual([...REGIONS]);
    expect(g.flatMap((x) => x.areas)).toHaveLength(AREAS.length);
    expect(g[0]!.areas[0]!.name).toBe("Grünerløkka");
  });

  it("search by name or municipality", () => {
    const b = areasByRegion("bærum").flatMap((x) => x.areas);
    expect(b.length).toBeGreaterThan(1);
    expect(b.every((a) => a.municipality === "Bærum")).toBe(true);
    expect(areasByRegion("xyz")).toEqual([]);
  });

  it("label a picked area with its municipality", () => {
    expect(areaNameLabel("Sandvika")).toBe("Sandvika, Bærum");
    expect(areaNameLabel("Grünerløkka")).toBe("Grünerløkka, Oslo");
    expect(areaNameLabel("Asker")).toBe("Asker");
    expect(areaNameLabel("Kafé Hjørnet")).toBe("Kafé Hjørnet");
  });

  it("the location sheet's chips sit under region headings", () => {
    const onSelectArea = jest.fn();
    render(
      <MapLocationSheet
        visible
        onClose={jest.fn()}
        status="idle"
        areaLabel={null}
        selectedAreaName={null}
        onRequest={jest.fn()}
        onSelectArea={onSelectArea}
      />,
      { wrapper },
    );
    for (const r of REGIONS) expect(screen.getByText(r)).toBeTruthy();
    fireEvent.press(screen.getByRole("radio", { name: "Sandvika" }));
    expect(onSelectArea).toHaveBeenCalledWith(area("Sandvika"));
  });

  it("Hvor lists the regions until you type", () => {
    render(<WhereField value={null} onSelect={jest.fn()} />, { wrapper });
    expect(screen.getByText("Romerike")).toBeTruthy();
    expect(screen.queryByText("Foreslåtte steder")).toBeNull();
    fireEvent.changeText(
      screen.getByPlaceholderText("Søk etter sted eller landemerke"),
      "bærum",
    );
    expect(screen.getByText("Foreslåtte steder")).toBeTruthy();
    expect(screen.getByText("Sandvika")).toBeTruthy();
    expect(screen.queryByText("Grünerløkka")).toBeNull();
  });
});
