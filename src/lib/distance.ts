// Distances from coordinates (Phase 19): every distance the app shows is
// measured straight from the person's position (src/lib/origin.ts) to the
// item, not typed in. Pure helpers; nb-NO numbers through format.ts.
import { formatDecimal } from "./format";

const EARTH_M = 6_371_000;
const rad = (d: number) => (d * Math.PI) / 180;

/** Straight-line (great-circle) distance in metres between [lng, lat] points. */
export function distanceMeters(
  a: readonly [number, number],
  b: readonly [number, number],
): number {
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** 340 → "350 m" (50 m steps, never under 100 m) · 1420 → "1,4 km" ·
 *  38 400 → "38 km". */
export function formatDistance(m: number): string {
  if (m < 975) return `${Math.max(100, Math.round(m / 50) * 50)} m`;
  if (m < 9950) return `${formatDecimal(m / 1000, 1)} km`;
  return `${Math.round(m / 1000)} km`;
}
