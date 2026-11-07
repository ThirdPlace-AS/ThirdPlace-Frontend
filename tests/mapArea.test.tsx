// Phase 16 (section benchmark): "Søk i dette området". After the user moves
// the map, a pill limits the list and its count to the part of the map they
// see; the app's own camera moves never offer it.
import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useMapArea } from "@/components/map/hooks/useMapArea";
import { useMapDiscovery } from "@/components/map/hooks/useMapDiscovery";
import {
  areaFromCorners,
  inArea,
  type MapArea,
} from "@/components/map/services/bounds";
import { DEFAULT_FILTERS } from "@/components/map/services/mapFilters";
import {
  countResults,
  resultForMode,
} from "@/components/map/services/mapFixtureAdapter";
import { places } from "@/fixtures";

// Every item of the default view, and an area around the first one only.
const all = resultForMode({
  mode: "explore",
  places,
  query: "",
  savedIds: [],
  filters: DEFAULT_FILTERS,
}).items;
const first = all[0]!;
const around = (c: readonly [number, number], d = 0.0005): MapArea => ({
  west: c[0] - d,
  east: c[0] + d,
  south: c[1] - d,
  north: c[1] + d,
});

describe("area helpers", () => {
  it("reads the visible bounds in either corner order", () => {
    const ne = [10.8, 59.95];
    const sw = [10.7, 59.9];
    const want = { west: 10.7, east: 10.8, south: 59.9, north: 59.95 };
    expect(areaFromCorners([ne, sw])).toEqual(want);
    expect(areaFromCorners([sw, ne])).toEqual(want);
    expect(areaFromCorners([ne])).toBeNull();
    expect(areaFromCorners([[Number.NaN, 1], sw])).toBeNull();
  });

  it("an item is in the area when its pin is, edges included", () => {
    const a = around(first.coord);
    expect(inArea(first.coord, a)).toBe(true);
    expect(inArea([a.east, a.north], a)).toBe(true);
    expect(inArea([a.east + 0.001, a.north], a)).toBe(false);
  });
});

describe("useMapArea", () => {
  it("only a move by the user offers the search", () => {
    const { result } = renderHook(() => useMapArea());
    const a = around(first.coord);
    act(() => result.current.settled(a, false));
    expect(result.current.offer).toBeNull();
    act(() => result.current.settled(a, true));
    expect(result.current.offer).toEqual(a);
    // While offered, the app's own moves refresh the area it would search.
    const b = around(first.coord, 0.01);
    act(() => result.current.settled(b, false));
    expect(result.current.offer).toEqual(b);
  });

  it("searching applies the offered area and hides the pill; Vis alle lifts it", () => {
    const { result } = renderHook(() => useMapArea());
    const a = around(first.coord);
    act(() => result.current.settled(a, true));
    let applied: MapArea | null = null;
    act(() => {
      applied = result.current.apply();
    });
    expect(applied).toEqual(a);
    expect(result.current.area).toEqual(a);
    expect(result.current.offer).toBeNull();
    act(() => result.current.clear());
    expect(result.current.area).toBeNull();
  });
});

describe("the list and its count follow the searched area", () => {
  it("only items in the area are listed; allItems keeps the rest", () => {
    const a = around(first.coord);
    const { result } = renderHook(() =>
      useMapDiscovery({
        places,
        query: "",
        savedIds: [],
        filters: DEFAULT_FILTERS,
        area: a,
        initial: "explore",
      }),
    );
    expect(result.current.items.length).toBeGreaterThan(0);
    expect(result.current.items.length).toBeLessThan(all.length);
    expect(result.current.items.every((i) => inArea(i.coord, a))).toBe(true);
    expect(result.current.allItems).toHaveLength(all.length);
  });

  it("Filtre's count equals the area list", () => {
    const a = around(first.coord);
    const { result } = renderHook(() =>
      useMapDiscovery({
        places,
        query: "",
        savedIds: [],
        filters: DEFAULT_FILTERS,
        area: a,
        initial: "explore",
      }),
    );
    expect(
      countResults({
        mode: "explore",
        allPlaces: places,
        query: "",
        filters: DEFAULT_FILTERS,
        savedIds: [],
        area: a,
      }),
    ).toBe(result.current.items.length);
  });
});
