// The phone's live position and compass heading for the map's location dot
// (speed pass 0346). Only the dot subscribes: the map screen reads the
// position when it needs it (Posisjon, the camera centre), so a GPS fix or a
// compass reading no longer renders the whole map. A compass sends readings
// up to 20 times a second on a 2° change; the dot only takes a reading once
// the phone has turned HEADING_MIN_TURN degrees and HEADING_MIN_GAP_MS has
// passed. Device data, kept in memory only.
import { useSyncExternalStore } from "react";

export type UserLocationState = {
  /** The app's own fix (after Posisjon or the location sheet). */
  coord: [number, number] | null;
  /** The map engine's position updates (OS permission given): the dot
   *  before Posisjon. */
  nativeCoord: [number, number] | null;
  /** Compass heading in degrees (0 = north), or null when unknown. */
  heading: number | null;
};

/** A heading reading counts once the phone has turned this far … */
export const HEADING_MIN_TURN = 4;
/** … and at least this long after the last reading that counted. */
export const HEADING_MIN_GAP_MS = 200;

const EMPTY: UserLocationState = {
  coord: null,
  nativeCoord: null,
  heading: null,
};

let state: UserLocationState = EMPTY;
let lastHeadingAt = Number.NEGATIVE_INFINITY;
const listeners = new Set<() => void>();

function set(next: UserLocationState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function sameCoord(
  a: [number, number] | null,
  b: [number, number] | null,
): boolean {
  return a === b || (!!a && !!b && a[0] === b[0] && a[1] === b[1]);
}

/** Whether a new compass reading should replace the shown heading (pure). */
export function headingCounts(
  prev: number | null,
  next: number | null,
  sinceMs: number,
): boolean {
  if (next === null) return prev !== null;
  if (prev === null) return true;
  const turn = Math.abs(((next - prev + 540) % 360) - 180);
  return turn >= HEADING_MIN_TURN && sinceMs >= HEADING_MIN_GAP_MS;
}

export function setUserCoord(coord: [number, number] | null) {
  if (sameCoord(state.coord, coord)) return;
  set({ ...state, coord });
}

export function setNativeCoord(coord: [number, number] | null) {
  if (sameCoord(state.nativeCoord, coord)) return;
  set({ ...state, nativeCoord: coord });
}

export function setUserHeading(heading: number | null, now = Date.now()) {
  if (!headingCounts(state.heading, heading, now - lastHeadingAt)) return;
  lastHeadingAt = now;
  set({ ...state, heading });
}

/** A manual area replaces the phone: no fix and no heading. The map
 *  engine's own position stays (it only shows the dot). */
export function clearUserFix() {
  lastHeadingAt = Number.NEGATIVE_INFINITY;
  if (state.coord === null && state.heading === null) return;
  set({ ...state, coord: null, heading: null });
}

export function getUserLocation(): UserLocationState {
  return state;
}

/** The live position and heading (re-renders the caller on each change). */
export function useUserLocation(): UserLocationState {
  return useSyncExternalStore(subscribe, getUserLocation, getUserLocation);
}

/** Tests and sign-out: back to no position. */
export function resetUserLocation() {
  lastHeadingAt = Number.NEGATIVE_INFINITY;
  set(EMPTY);
}
