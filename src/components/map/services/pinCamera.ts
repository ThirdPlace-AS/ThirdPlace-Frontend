// Where the camera goes when a pin is picked (user 2026-11-10: a tapped
// marker is centred on screen and the map zooms in a bit, smoothly; user
// 2026-11-11: "clicking a marker should only zoom to a cearten zoom level
// after that just move the screen to the next marker", street level, 16).
// Pure, so the tests pin the rules; MapboxMap applies them.
import { duration } from "@/theme/motion";

/** The page sheet's lowest snap is 35 % of the window, and at least this tall:
 *  it shows the handle, the ✕ row and the top of the gallery. MapDetailSheet's
 *  snap points use the same numbers. */
export const PAGE_PEEK_MIN = 300;

export function pagePeekHeight(windowH: number): number {
  return Math.max(Math.round(windowH * 0.35), PAGE_PEEK_MIN);
}

/** How close a pin tap takes the map: once there, taps only pan. The user
 *  picked 14.5 after seeing 14.5, 15 and 16 on the device (16 showed about
 *  250 m and left the next markers off screen; 14.5 keeps several in view,
 *  names readable). A pick from the list or a link still zooms past the
 *  clusters (`selectionZoom` in bounds.ts: 15.5 below 15), so its pin can be
 *  seen; a tap after it then only pans. */
export const FOCUS_ZOOM = 14.5;

/** Up to FOCUS_ZOOM once, then the zoom stays: a tap at 14.5 or closer only
 *  pans, and nothing ever zooms out (a pin tapped at 17.4 keeps 17.4). A
 *  change of zoom also makes the map draw its tiles and pins again, which is
 *  slow on a phone; a pan keeps them. A tapped pin is never in a cluster,
 *  and zooming in only splits clusters, so it stays visible. */
export function pinTapZoom(current: number): number {
  return current < FOCUS_ZOOM ? FOCUS_ZOOM : current;
}

/** How long the move takes: a pan or a short zoom `duration.focus`; from
 *  far out (more than two levels to go) a little longer, so the zoom does
 *  not lurch. Reduced motion: no animation. */
export function pinTapDuration(
  from: number,
  to: number,
  reduced: boolean,
): number {
  if (reduced) return 0;
  return to - from > 2 ? duration.focusFar : duration.focus;
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
