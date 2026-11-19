import { useCallback, useRef, useState } from "react";

import { distanceMeters } from "@/lib/distance";

import type { FocusPadding } from "../services/pinCamera";
import { LOCATE_REFINE_M, type OnPosition } from "./useMapLocation";

/** Where the native map's camera flies next (Posisjon, a picked area). */
export type CameraTarget = {
  /** One per request; the map flies once per seq. */
  seq: number;
  coord: [number, number];
  zoom: number;
  /** Room around the point (top controls, the sheet's peek). */
  padding?: FocusPadding;
  /** A refinement of an earlier fly (Posisjon's fresh fix after the position
   *  known at once): the map skips it if the user has touched the map since
   *  that fly, so the camera never pulls back to them. */
  followUp?: number;
};

/** Whether the map should still make a fly: a plain request always; a
 *  follow-up only if the fly it refines happened and nobody has touched the
 *  map since (`touchedAt` and the values in `flownAt` are times in ms). */
export function followUpAllowed(
  followUp: number | undefined,
  flownAt: ReadonlyMap<number, number>,
  touchedAt: number,
): boolean {
  if (followUp === undefined) return true;
  const at = flownAt.get(followUp);
  return at !== undefined && touchedAt < at;
}

/** Posisjon's camera for one tap: fly to the first position it gets, then
 *  ease to the fresh fix only when that is more than LOCATE_REFINE_M away
 *  (as a follow-up of the first fly). `fly` returns the request's seq. */
export function locateFly(
  fly: (coord: [number, number], followUp?: number) => number,
): OnPosition {
  let flown: { seq: number; coord: [number, number] } | null = null;
  return (coord, fresh) => {
    if (!flown) {
      flown = { seq: fly(coord), coord };
      return;
    }
    if (fresh && distanceMeters(flown.coord, coord) > LOCATE_REFINE_M)
      fly(coord, flown.seq);
  };
}

// Owns the camera's next target. The coordinate travels with the request
// (R1b, user 2026-11-10: Posisjon must reach the user): it used to be the
// screen's `center` prop, read when a signal changed, which fell back to the
// default place when no position was in. SoftMap ignores it.
export function useMapCamera() {
  const seq = useRef(0);
  const [target, setTarget] = useState<CameraTarget | null>(null);
  /** Fly to `coord`; returns the request's seq (for a later follow-up). */
  const flyTo = useCallback(
    (
      coord: [number, number],
      zoom = 13,
      opts: { padding?: FocusPadding; followUp?: number } = {},
    ): number => {
      seq.current += 1;
      setTarget({ seq: seq.current, coord, zoom, ...opts });
      return seq.current;
    },
    [],
  );
  return { target, flyTo };
}
