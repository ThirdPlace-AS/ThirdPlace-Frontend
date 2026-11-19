// Math for surfaces that open from where they were tapped (0457). Pure and
// worklet-safe: Overlay, Sheet and PhotoViewer call these inside their
// animated styles with the presence progress p (0 closed → 1 open).
//
// React Native scales a view about its centre. To make a scale look anchored
// at another point, the view also moves by (origin − centre) · (1 − scale).

// Every number a worklet needs is a parameter: a default value or a module
// constant read inside one is not captured for the UI thread ("Property
// 'ZOOM_FROM_SCALE' doesn't exist").
import { origin as motionOrigin } from "@/theme/motion";

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type Size = { width: number; height: number };
export type OriginFrame = {
  translateX: number;
  translateY: number;
  scale: number;
};

/** Overlay zoom: starts at this scale, the rest is the fade. */
export const ZOOM_FROM_SCALE = motionOrigin.zoomFrom;
/** Content sheet: grows from this scale while it slides up. */
export const SHEET_FROM_SCALE = motionOrigin.sheetFrom;

/** Translate that makes scale `s` look anchored at `origin` for a view
 *  centred at `center`. */
export function scaleAbout(origin: Point, center: Point, s: number) {
  "worklet";
  return {
    translateX: (origin.x - center.x) * (1 - s),
    translateY: (origin.y - center.y) * (1 - s),
  };
}

/** A full-size view (at 0,0) zooming in from a point. */
export function zoomFromPoint(
  origin: Point,
  size: Size,
  p: number,
  fromScale: number,
): OriginFrame {
  "worklet";
  const scale = fromScale + (1 - fromScale) * p;
  const t = scaleAbout(
    origin,
    { x: size.width / 2, y: size.height / 2 },
    scale,
  );
  return { ...t, scale };
}

/** A full-size view (at 0,0) growing out of a rect (a tapped thumbnail):
 *  at p = 0 it covers the rect, at p = 1 the whole screen. */
export function growFromRect(rect: Rect, size: Size, p: number): OriginFrame {
  "worklet";
  const from = Math.min(
    1,
    Math.max(rect.width / size.width, rect.height / size.height),
  );
  const scale = from + (1 - from) * p;
  return {
    translateX: (rect.x + rect.width / 2 - size.width / 2) * (1 - p),
    translateY: (rect.y + rect.height / 2 - size.height / 2) * (1 - p),
    scale,
  };
}
