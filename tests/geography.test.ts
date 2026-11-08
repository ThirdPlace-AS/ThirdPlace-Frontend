// Phase 19 S1b (founder 2026-11-08): pins spread across Oslo and Akershus.
// Named areas for labels and the Hvor picker, distances from coordinates, and
// the origin they are measured from (the phone, a picked area or
// Grünerløkka), which ignores GPS jitter.
import { afterEach, describe, expect, it } from "@jest/globals";

import { resultForMode } from "@/components/map/services/mapFixtureAdapter";
import {
  AREAS,
  COVERAGE_BBOX,
  MAP_CENTER,
  REGIONS,
  areaFor,
  areaLabel,
  inCoverage,
  places,
} from "@/fixtures";
import { distanceMeters, formatDistance } from "@/lib/distance";
import {
  ORIGIN_MOVE_M,
  distanceLabelFor,
  getOrigin,
  reportFix,
  resetOrigin,
  setOriginArea,
} from "@/lib/origin";

afterEach(() => resetOrigin());

const area = (name: string) => AREAS.find((a) => a.name === name)!;

// Moves a point roughly `m` metres north.
const north = (c: [number, number], m: number): [number, number] => [
  c[0],
  c[1] + m / 111_320,
];

describe("areas across Oslo and Akershus", () => {
  it("are unique, inside the coverage box, Grünerløkka first", () => {
    expect(new Set(AREAS.map((a) => a.name)).size).toBe(AREAS.length);
    for (const a of AREAS) expect(inCoverage(a.coord)).toBe(true);
    expect(AREAS[0]).toMatchObject({
      name: "Grünerløkka",
      coord: [10.758, 59.9227],
    });
    expect(COVERAGE_BBOX.west).toBeLessThan(COVERAGE_BBOX.east);
  });

  it("cover every region and every Akershus municipality", () => {
    for (const r of REGIONS)
      expect(AREAS.some((a) => a.region === r)).toBe(true);
    const municipalities = new Set(AREAS.map((a) => a.municipality));
    for (const m of [
      "Oslo",
      "Asker",
      "Bærum",
      "Nordre Follo",
      "Ås",
      "Frogn",
      "Nesodden",
      "Vestby",
      "Enebakk",
      "Lillestrøm",
      "Lørenskog",
      "Rælingen",
      "Nittedal",
      "Gjerdrum",
      "Ullensaker",
      "Nannestad",
      "Eidsvoll",
      "Nes",
      "Aurskog-Høland",
      "Hurdal",
      "Lunner",
      "Jevnaker",
    ])
      expect(municipalities.has(m)).toBe(true);
  });

  it("name the nearest area, with the municipality", () => {
    expect(areaFor(north(area("Sandvika").coord, 300)).name).toBe("Sandvika");
    expect(areaFor(area("Jessheim").coord).name).toBe("Jessheim");
    expect(areaLabel(area("Sandvika").coord)).toBe("Sandvika, Bærum");
    expect(areaLabel(MAP_CENTER)).toBe("Grünerløkka, Oslo");
    expect(areaLabel(area("Asker").coord)).toBe("Asker");
  });

  it("keep the legacy places in Oslo", () => {
    for (const p of places) expect(areaFor(p.coord).municipality).toBe("Oslo");
  });
});

describe("distances", () => {
  it("are measured on the globe", () => {
    expect(distanceMeters(MAP_CENTER, MAP_CENTER)).toBe(0);
    const d = distanceMeters([10.7522, 59.9139], area("Lillestrøm").coord);
    expect(d).toBeGreaterThan(16_000);
    expect(d).toBeLessThan(19_000);
    expect(distanceMeters(area("Ski").coord, MAP_CENTER)).toBeCloseTo(
      distanceMeters(MAP_CENTER, area("Ski").coord),
      6,
    );
  });

  it("read the Norwegian way", () => {
    expect(formatDistance(5)).toBe("100 m");
    expect(formatDistance(340)).toBe("350 m");
    expect(formatDistance(974)).toBe("950 m");
    expect(formatDistance(975)).toBe("1,0 km");
    expect(formatDistance(1420)).toBe("1,4 km");
    expect(formatDistance(9949)).toBe("9,9 km");
    expect(formatDistance(9950)).toBe("10 km");
    expect(formatDistance(38_400)).toBe("38 km");
  });
});

describe("the origin", () => {
  it("starts at Grünerløkka", () => {
    expect(getOrigin()).toEqual({ coord: MAP_CENTER, source: "default" });
  });

  it("takes the first fix, ignores jitter and follows a real move", () => {
    const home: [number, number] = [10.76, 59.93];
    reportFix(home);
    expect(getOrigin()).toEqual({ coord: home, source: "gps" });
    reportFix(north(home, 50));
    expect(getOrigin().coord).toEqual(home);
    reportFix(north(home, ORIGIN_MOVE_M - 20));
    expect(getOrigin().coord).toEqual(home);
    const moved = north(home, ORIGIN_MOVE_M + 60);
    reportFix(moved);
    expect(getOrigin().coord).toEqual(moved);
    // Posisjon re-anchors on the spot.
    const here = north(moved, 10);
    reportFix(here, { force: true });
    expect(getOrigin().coord).toEqual(here);
  });

  it("follows a picked area, and labels and the map list follow it", () => {
    setOriginArea(area("Jessheim").coord);
    expect(getOrigin().source).toBe("area");
    expect(distanceLabelFor(MAP_CENTER)).toMatch(/^\d+ km$/);
    const r = resultForMode({
      mode: "explore",
      places,
      query: "",
      savedIds: [],
    });
    const p1 = r.items.find((i) => i.id === "p1")!;
    expect(p1.subtitle).toMatch(/^\d+ km$/);
    resetOrigin();
    const back = resultForMode({
      mode: "explore",
      places,
      query: "",
      savedIds: [],
    });
    expect(back.items.find((i) => i.id === "p1")!.subtitle).toBe("100 m");
  });
});
