// Pure camera helper (Phase 12 H3), shared by MapboxMap and its test.

/** [north-east, south-west] corners around the given coordinates. */
export function boundsOf(
  coords: readonly [number, number][],
): [[number, number], [number, number]] | null {
  if (coords.length < 2) return null;
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return [
    [maxLng, maxLat],
    [minLng, minLat],
  ];
}

/** A part of the map in degrees: what the map showed when the user stopped
 *  panning (Phase 16, "Søk i dette området"). */
export type MapArea = {
  west: number;
  south: number;
  east: number;
  north: number;
};

/** Reads the part of the map on screen now (null when it cannot). */
export type AreaReader = () => Promise<MapArea | null>;

/** The area between two corners ([lng, lat]), in either order: the map
 *  hands back its top-left and bottom-right visible corners. */
export function areaFromCorners(
  corners: readonly (readonly number[])[],
): MapArea | null {
  const [a, b] = corners;
  if (!a || !b || a.length < 2 || b.length < 2) return null;
  const [lngA, latA] = a as [number, number];
  const [lngB, latB] = b as [number, number];
  if (![lngA, latA, lngB, latB].every(Number.isFinite)) return null;
  return {
    west: Math.min(lngA, lngB),
    east: Math.max(lngA, lngB),
    south: Math.min(latA, latB),
    north: Math.max(latA, latB),
  };
}

/** True when the coordinate ([lng, lat]) lies in the area, edges included. */
export function inArea(
  coord: readonly [number, number],
  area: MapArea,
): boolean {
  const [lng, lat] = coord;
  return (
    lng >= area.west &&
    lng <= area.east &&
    lat >= area.south &&
    lat <= area.north
  );
}
