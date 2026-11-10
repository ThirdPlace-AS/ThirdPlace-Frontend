// Where the camera goes when a pin is picked (user 2026-11-10: a tapped
// marker is centred on screen and the map zooms in a bit, smoothly). Pure, so
// the tests pin the rules; MapboxMap applies them.

/** The page sheet's lowest snap is 35 % of the window, and at least this tall:
 *  it shows the handle, the ✕ row and the top of the gallery. MapDetailSheet's
 *  snap points use the same numbers. */
export const PAGE_PEEK_MIN = 300;

export function pagePeekHeight(windowH: number): number {
  return Math.max(Math.round(windowH * 0.35), PAGE_PEEK_MIN);
}

/** A pin tap zooms one step closer, up to this level. */
export const PIN_TAP_MAX_ZOOM = 17;

/** One step closer, never past street level, and never out (a pin tapped at
 *  zoom 18 keeps 18). */
export function pinTapZoom(current: number): number {
  if (current >= PIN_TAP_MAX_ZOOM) return current;
  return Math.min(PIN_TAP_MAX_ZOOM, current + 1);
}

export type FocusPadding = {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

/** Gap between the centred pin's area and the sheet's top edge. */
const PEEK_GAP = 8;

/**
 * Camera padding that centres a point in the part of the map left in view:
 * below the search bar and mode chips (`top`), above the detail sheet's peek.
 * The map ends at the tab bar (`mapH` < `windowH`); the page sheet covers the
 * tab bar too, so only the rest of its peek covers the map.
 */
export function focusPadding({
  windowH,
  mapH,
  top,
}: {
  windowH: number;
  mapH: number;
  top: number;
}): FocusPadding {
  const belowMap = Math.max(0, windowH - mapH);
  const covered = Math.max(0, pagePeekHeight(windowH) - belowMap);
  const paddingTop = Math.max(0, Math.round(top));
  // Mapbox refuses padding that leaves no room: keep at least a third of the
  // map in view whatever the measurements say.
  const room = mapH - paddingTop - covered - PEEK_GAP;
  const paddingBottom =
    room >= mapH / 3
      ? covered + PEEK_GAP
      : Math.max(0, mapH * (2 / 3) - paddingTop);
  return {
    paddingTop,
    paddingBottom: Math.round(paddingBottom),
    paddingLeft: 0,
    paddingRight: 0,
  };
}

/** The same point, give or take float noise from the native side. */
export function sameCoord(
  a: readonly [number, number] | null | undefined,
  b: readonly [number, number] | null | undefined,
): boolean {
  if (!a || !b) return false;
  return Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7;
}
