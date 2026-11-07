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
