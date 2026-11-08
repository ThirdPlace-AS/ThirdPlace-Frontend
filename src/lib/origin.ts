// Where distances are measured from (Phase 19, founder 2026-11-08): the
// phone's position while the map follows it, else the area picked in Hvor or
// the location sheet, else Grünerløkka (the demo map centre). In memory only.
//
// GPS moves a little all the time; the origin only moves on the first fix,
// when Posisjon is pressed, or after the phone has really moved (more than
// ORIGIN_MOVE_M), so lists and the Sveip deck don't jump on jitter.
import { useSyncExternalStore } from "react";

import { MAP_CENTER } from "@/fixtures";

import { distanceMeters, formatDistance } from "./distance";

export type OriginSource = "gps" | "area" | "default";
export type Origin = { coord: [number, number]; source: OriginSource };

export const ORIGIN_MOVE_M = 250;

const DEFAULT: Origin = { coord: MAP_CENTER, source: "default" };
let state: Origin = DEFAULT;
const listeners = new Set<() => void>();

function set(next: Origin) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getOrigin(): Origin {
  return state;
}

export function useOrigin(): Origin {
  return useSyncExternalStore(subscribe, getOrigin, getOrigin);
}

/** A GPS fix. Moves the origin on the first fix, when `force` is set
 *  (Posisjon), or once the phone is more than ORIGIN_MOVE_M away. */
export function reportFix(
  coord: [number, number],
  opts: { force?: boolean } = {},
): void {
  if (
    opts.force ||
    state.source !== "gps" ||
    distanceMeters(state.coord, coord) > ORIGIN_MOVE_M
  )
    set({ coord, source: "gps" });
}

/** A picked area (Hvor or the location sheet): the map stops following the
 *  phone there, so distances follow the area. */
export function setOriginArea(coord: [number, number]): void {
  set({ coord, source: "area" });
}

/** Back to Grünerløkka (sign-out, tests). */
export function resetOrigin(): void {
  set(DEFAULT);
}

/** Distance from the origin to a point, in metres. */
export function distanceFromOrigin(
  coord: [number, number],
  origin: Origin = state,
): number {
  return distanceMeters(origin.coord, coord);
}

/** "350 m" · "1,4 km" · "38 km" from the origin. */
export function distanceLabelFor(
  coord: [number, number],
  origin: Origin = state,
): string {
  return formatDistance(distanceFromOrigin(coord, origin));
}
