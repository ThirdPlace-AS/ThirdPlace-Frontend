// Where the last press landed (0457, "surfaces open from the tap"). The ui
// Pressable writes it on press-in; a Sheet or Overlay that opens right after
// reads it once and grows from that point. One module variable, no React
// state, so a press costs one assignment.
import type { Point } from "@/components/ui/originMotion";
import { origin } from "@/theme/motion";

/** A press older than this did not open the surface (a timer or a network
 *  answer did), so the surface keeps its plain animation. */
export const PRESS_ORIGIN_MAX_AGE = origin.pressMaxAge;

let last: { x: number; y: number; at: number } | null = null;

export function notePressOrigin(x: number, y: number, at = Date.now()) {
  last = { x, y, at };
}

/** The last press point in window coordinates, or null when there was none
 *  in the last {@link PRESS_ORIGIN_MAX_AGE} ms. Not consumed: two surfaces
 *  opened by one tap both grow from it. */
export function recentPressOrigin(now = Date.now()): Point | null {
  if (!last || now - last.at > PRESS_ORIGIN_MAX_AGE || now < last.at) {
    return null;
  }
  return { x: last.x, y: last.y };
}

/** Test helper. */
export function resetPressOrigin() {
  last = null;
}
