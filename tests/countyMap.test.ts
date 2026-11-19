// Phase 19 S4b (founder 2026-11-08): the map at county scale. The first view
// opens nearby (centred on the person, the nearest pins in view, zoom 11.5 to
// 14); a cluster tap zooms to where it splits; a pick from the list zooms in
// until its pin leaves the cluster; the SoftMap fallback frames the markers
// on screen, clusters on a 44 dp grid and names the towns in view.
import { describe, expect, it } from "@jest/globals";

import {
  clusterZoom,
  firstViewCamera,
  SELECT_MIN_ZOOM,
  selectionZoom,
} from "@/components/map/services/bounds";
import {
  clusterByGrid,
  projectToUnit,
  softBoxFor,
  softTowns,
} from "@/components/map/services/softClustering";
import type { DiscoveryItem } from "@/components/map/types/mapPresentation";
import { AREAS, experiences, MAP_CENTER, places } from "@/fixtures";

const PAD = { top: 190, right: 48, bottom: 140, left: 48 };
const PHONE = { width: 411, height: 914 };
const area = (name: string) => AREAS.find((a) => a.name === name)!.coord;
const all = [
  ...places.map((p) => p.coord),
  ...experiences.map((e) => e.meetingPoint.coord),
];

describe("the first view", () => {
  it("is centred on the person and clamped to 11.5–14", () => {
    const v = firstViewCamera(MAP_CENTER, all, PHONE, PAD);
    expect(v.center).toEqual(MAP_CENTER);
    expect(v.zoom).toBeGreaterThanOrEqual(11.5);
    expect(v.zoom).toBeLessThanOrEqual(14);
  });

  it("zooms in on a close group and out for a spread one", () => {
    const near: [number, number][] = [
      [10.759, 59.923],
      [10.757, 59.922],
    ];
    expect(firstViewCamera(MAP_CENTER, near, PHONE, PAD).zoom).toBe(14);
    const spread: [number, number][] = [area("Jessheim"), area("Ski")];
    expect(firstViewCamera(MAP_CENTER, spread, PHONE, PAD).zoom).toBe(11.5);
  });

  it("only the nearest pins decide, not a far one past them", () => {
    const ring: [number, number][] = Array.from({ length: 30 }, (_, i) => [
      10.758 + 0.01 * Math.cos(i),
      59.9227 + 0.005 * Math.sin(i),
    ]);
    const base = firstViewCamera(MAP_CENTER, ring, PHONE, PAD).zoom;
    const withFar = firstViewCamera(
      MAP_CENTER,
      [...ring, area("Jessheim")],
      PHONE,
      PAD,
    ).zoom;
    expect(withFar).toBe(base);
  });

  it("opens on a picked area when that is the origin", () => {
    const j = area("Jessheim");
    expect(firstViewCamera(j, all, PHONE, PAD).center).toEqual(j);
  });
});

describe("cluster taps and list picks", () => {
  it("a cluster opens at its expansion zoom, never past 16", () => {
    expect(clusterZoom(12.4, 10)).toBe(12.4);
    expect(clusterZoom(18, 10)).toBe(16);
    expect(clusterZoom(undefined, 10)).toBe(12);
    expect(clusterZoom(null, undefined)).toBe(13);
  });

  it("a pick below street level zooms in; at street level it stays", () => {
    expect(selectionZoom(11)).toBe(15.5);
    expect(selectionZoom(undefined)).toBe(15.5);
    expect(selectionZoom(SELECT_MIN_ZOOM)).toBeUndefined();
    expect(selectionZoom(16.2)).toBeUndefined();
  });
});

const item = (id: string, coord: [number, number]): DiscoveryItem => ({
  markerId: `place:${id}`,
  kind: "place",
  id,
  coord,
  category: "Kafé",
  title: id,
  subtitle: "",
});
const items = [
  ...places.map((p) => item(p.id, p.coord)),
  ...experiences.map((e) => item(e.id, e.meetingPoint.coord)),
];

describe("the SoftMap fallback", () => {
  const W = 360;
  const H = 640;
  const box = softBoxFor(
    items.map((i) => i.coord),
    W / H,
  );

  it("frames every marker with room around it, in the view's shape", () => {
    for (const i of items) {
      const { x, y } = projectToUnit(i.coord, box);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(1);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(1);
    }
    const midLat = (box.minLat + box.maxLat) / 2;
    const wM =
      (box.maxLng - box.minLng) * 111_320 * Math.cos((midLat * Math.PI) / 180);
    const hM = (box.maxLat - box.minLat) * 110_540;
    expect(wM / hM).toBeCloseTo(W / H, 2);
  });

  it("clusters on a 44 dp grid: every marker once, no tap targets overlap", () => {
    const clusters = clusterByGrid(items, 44 / W, box, 44 / H);
    expect(clusters.flatMap((c) => c.items)).toHaveLength(items.length);
    for (let a = 0; a < clusters.length; a++)
      for (let b = a + 1; b < clusters.length; b++) {
        const dx = Math.abs(clusters[a]!.x - clusters[b]!.x) * W;
        const dy = Math.abs(clusters[a]!.y - clusters[b]!.y) * H;
        expect(Math.max(dx, dy)).toBeGreaterThanOrEqual(43.9);
      }
  });

  it("names towns inside the box without crowding them", () => {
    const towns = softTowns(box, W, H);
    expect(towns.length).toBeGreaterThan(1);
    expect(towns[0]!.name).toBe("Grünerløkka");
    for (let a = 0; a < towns.length; a++)
      for (let b = a + 1; b < towns.length; b++)
        expect(
          Math.hypot(
            (towns[a]!.x - towns[b]!.x) * W,
            (towns[a]!.y - towns[b]!.y) * H,
          ),
        ).toBeGreaterThanOrEqual(72);
  });

  it("gives one marker about a kilometre around it", () => {
    const one = softBoxFor([MAP_CENTER], 1);
    const hM = (one.maxLat - one.minLat) * 110_540;
    expect(hM).toBeGreaterThan(1000);
    expect(hM).toBeLessThan(1400);
  });
});
