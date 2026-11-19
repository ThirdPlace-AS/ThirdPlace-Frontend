// Geometry helpers for the SoftMap fallback (Expo Go / web / no token). These let
// the placeholder map plot MOCK marker dots and bucket nearby ones into numeric
// clusters WITHOUT a real map engine. Native clustering uses Mapbox ShapeSource
// instead (MapboxMap.tsx) — see docs/map/MAP_BLOCKERS.md (NV-3).
//
// Phase 19 S4b (county scale): the box follows the markers on screen (8 %
// padding, matched to the view's shape so the map isn't stretched), clusters
// sit at the centres of a 44 dp grid so no two tap targets overlap, and the
// towns in the box get muted names.

import { AREAS } from "@/fixtures";

import type { DiscoveryItem } from "../types/mapPresentation";

export type SoftBox = {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
};

// The inner-Oslo box the fallback used before Phase 19 (MOCK — not geodata);
// still the box when there is nothing to frame.
export const SOFT_BBOX: SoftBox = {
  minLng: 10.695,
  maxLng: 10.775,
  minLat: 59.9,
  maxLat: 59.932,
};

const M_PER_DEG_LAT = 110_540;
const mPerDegLng = (lat: number) => 111_320 * Math.cos((lat * Math.PI) / 180);

/** The box that frames `coords` with `pad` of its span on every side, widened
 *  to the view's `aspect` (width / height) so distances read the same both
 *  ways. A single point or a tight group gets at least ~1 km around it. */
export function softBoxFor(
  coords: readonly [number, number][],
  aspect = 1,
  pad = 0.08,
): SoftBox {
  if (coords.length === 0) return SOFT_BBOX;
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  const midLat = (minLat + maxLat) / 2;
  // Spans in metres, at least ~1 km, plus the padding on both sides.
  let wM =
    Math.max(1000, (maxLng - minLng) * mPerDegLng(midLat)) * (1 + 2 * pad);
  let hM = Math.max(1000, (maxLat - minLat) * M_PER_DEG_LAT) * (1 + 2 * pad);
  if (aspect > 0) {
    if (wM / hM < aspect) wM = hM * aspect;
    else hM = wM / aspect;
  }
  const midLng = (minLng + maxLng) / 2;
  const halfLng = wM / 2 / mPerDegLng(midLat);
  const halfLat = hM / 2 / M_PER_DEG_LAT;
  return {
    minLng: midLng - halfLng,
    maxLng: midLng + halfLng,
    minLat: midLat - halfLat,
    maxLat: midLat + halfLat,
  };
}

export type Point = { x: number; y: number };

// Projects a [lng, lat] into a 0..1 box (y flipped so north is up). Values are
// clamped so an out-of-box point still renders at an edge.
export function projectToUnit(
  coord: [number, number],
  box: SoftBox = SOFT_BBOX,
): Point {
  const [lng, lat] = coord;
  const { minLng, maxLng, minLat, maxLat } = box;
  const x = (lng - minLng) / (maxLng - minLng);
  const y = (lat - minLat) / (maxLat - minLat);
  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, 1 - y)),
  };
}

export type SoftCluster = {
  key: string;
  // Unit-box position: the centre of the grid cell.
  x: number;
  y: number;
  items: DiscoveryItem[];
};

// Grid clustering in unit space. `cell` (and `cellY`, default the same) is the
// grid size in 0..1; markers in one cell merge into one cluster with a count,
// placed at the cell's centre, so clusters are never closer than a cell.
// Deterministic (input order).
export function clusterByGrid(
  items: DiscoveryItem[],
  cell = 0.04,
  box: SoftBox = SOFT_BBOX,
  cellY = cell,
): SoftCluster[] {
  const buckets = new Map<string, SoftCluster>();
  for (const item of items) {
    const { x, y } = projectToUnit(item.coord, box);
    const cx = Math.min(Math.floor(x / cell), Math.ceil(1 / cell) - 1);
    const cy = Math.min(Math.floor(y / cellY), Math.ceil(1 / cellY) - 1);
    const key = `${cx}:${cy}`;
    const existing = buckets.get(key);
    if (existing) existing.items.push(item);
    else
      buckets.set(key, {
        key,
        x: Math.min(1, (cx + 0.5) * cell),
        y: Math.min(1, (cy + 0.5) * cellY),
        items: [item],
      });
  }
  return [...buckets.values()];
}

/** Muted town names for the fallback map: the named areas inside the box, in
 *  AREAS order (Grünerløkka first), skipping any that would sit within
 *  `gap` dp of a name already placed. */
export function softTowns(
  box: SoftBox,
  width: number,
  height: number,
  gap = 72,
): { name: string; x: number; y: number }[] {
  if (width <= 0 || height <= 0) return [];
  const out: { name: string; x: number; y: number }[] = [];
  for (const a of AREAS) {
    const [lng, lat] = a.coord;
    if (lng < box.minLng || lng > box.maxLng) continue;
    if (lat < box.minLat || lat > box.maxLat) continue;
    const { x, y } = projectToUnit(a.coord, box);
    const near = out.some(
      (t) => Math.hypot((t.x - x) * width, (t.y - y) * height) < gap,
    );
    if (!near) out.push({ name: a.name, x, y });
  }
  return out;
}
