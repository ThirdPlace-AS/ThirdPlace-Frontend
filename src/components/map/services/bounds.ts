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

// ── County scale (Phase 19 S4b) ─────────────────────────────────────────────

/** Mapbox measures zoom on 512-point tiles: at zoom z the world is 512·2^z
 *  points wide. Web Mercator x/y in 0..1. */
const TILE = 512;
const mercX = (lng: number) => (lng + 180) / 360;
const mercY = (lat: number) => {
  const s = Math.sin((lat * Math.PI) / 180);
  return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
};

export type CameraPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/** The first view of a session (founder 2026-11-08: nearby first): centred
 *  on the person, zoomed so the `count` nearest pins fit inside the view
 *  minus the padding, clamped to [minZoom, maxZoom]. Pure; the map applies
 *  it once with the same padding. */
export function firstViewCamera(
  origin: [number, number],
  coords: readonly [number, number][],
  view: { width: number; height: number },
  padding: CameraPadding,
  { count = 30, minZoom = 11.5, maxZoom = 14 } = {},
): { center: [number, number]; zoom: number } {
  const ox = mercX(origin[0]);
  const oy = mercY(origin[1]);
  const nearest = coords
    .map((c) => ({ c, d: (mercX(c[0]) - ox) ** 2 + (mercY(c[1]) - oy) ** 2 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count);
  let dx = 0;
  let dy = 0;
  for (const { c } of nearest) {
    dx = Math.max(dx, Math.abs(mercX(c[0]) - ox));
    dy = Math.max(dy, Math.abs(mercY(c[1]) - oy));
  }
  const w = Math.max(1, view.width - padding.left - padding.right);
  const h = Math.max(1, view.height - padding.top - padding.bottom);
  // Centred on the person, the farthest of those pins sets the half-width.
  const zx = dx > 0 ? Math.log2(w / (2 * dx * TILE)) : maxZoom;
  const zy = dy > 0 ? Math.log2(h / (2 * dy * TILE)) : maxZoom;
  const zoom = Math.min(maxZoom, Math.max(minZoom, Math.min(zx, zy)));
  return { center: origin, zoom };
}

/** Where a cluster tap goes: the zoom at which it splits (Mapbox's
 *  expansion zoom), or two steps in when that is unknown; never past 16. */
export function clusterZoom(
  expansion: number | null | undefined,
  current: number | null | undefined,
): number {
  const z = expansion ?? (current ?? 11) + 2;
  return Math.min(16, z);
}

/** A pick from the list or a link (not a pin tap): below street level the
 *  map zooms in far enough that the pin leaves its cluster. undefined = keep
 *  the zoom. */
export const SELECT_MIN_ZOOM = 15;
export function selectionZoom(
  current: number | null | undefined,
): number | undefined {
  return current == null || current < SELECT_MIN_ZOOM ? 15.5 : undefined;
}
