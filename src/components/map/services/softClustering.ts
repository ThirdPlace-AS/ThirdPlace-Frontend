// Geometry helpers for the SoftMap fallback (Expo Go / web / no token). These let
// the placeholder map plot MOCK marker dots and bucket nearby ones into numeric
// clusters WITHOUT a real map engine. Native clustering uses Mapbox ShapeSource
// instead (MapboxMap.tsx) — see docs/map/MAP_BLOCKERS.md (NV-3).

import type { DiscoveryItem } from "../types/mapPresentation";

// A fixed demo bounding box around central Oslo (MOCK — not geodata).
export const SOFT_BBOX = {
  minLng: 10.74,
  maxLng: 10.78,
  minLat: 59.915,
  maxLat: 59.93,
} as const;

export type Point = { x: number; y: number };

// Projects a [lng, lat] into a 0..1 box (y flipped so north is up). Values are
// clamped so an out-of-box mock point still renders at an edge.
export function projectToUnit(coord: [number, number]): Point {
  const [lng, lat] = coord;
  const { minLng, maxLng, minLat, maxLat } = SOFT_BBOX;
  const x = (lng - minLng) / (maxLng - minLng);
  const y = (lat - minLat) / (maxLat - minLat);
  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, 1 - y)),
  };
}

export type SoftCluster = {
  key: string;
  // Unit-box center of the cluster.
  x: number;
  y: number;
  items: DiscoveryItem[];
};

// Greedy grid clustering in unit space. `cell` is the grid size (0..1); markers in
// the same cell merge into one cluster with a count. Deterministic (input order).
export function clusterByGrid(
  items: DiscoveryItem[],
  cell = 0.08,
): SoftCluster[] {
  const buckets = new Map<string, SoftCluster>();
  for (const item of items) {
    const { x, y } = projectToUnit(item.coord);
    const key = `${Math.floor(x / cell)}:${Math.floor(y / cell)}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.items.push(item);
      // Running average center.
      const n = existing.items.length;
      existing.x += (x - existing.x) / n;
      existing.y += (y - existing.y) / n;
    } else {
      buckets.set(key, { key, x, y, items: [item] });
    }
  }
  return [...buckets.values()];
}
