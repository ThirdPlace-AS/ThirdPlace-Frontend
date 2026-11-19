// What a touch on a slider's track is doing (speed-pass review, 0360). Both
// Filtre sliders take the touch on their whole track, and Filtre scrolls: a
// slightly diagonal swipe through the sheet that starts on a track moved a
// thumb before the sheet's scroll view took the touch (the price slider then
// filtered out everything free; Avstand jumped to the step under the finger).

/** Travel (dp) before a touch counts as a drag or a scroll. */
export const DRAG_SLOP = 4;

/** "drag" once the finger has gone DRAG_SLOP sideways and more sideways than
 *  up or down; "scroll" once it has gone DRAG_SLOP up or down first (the
 *  touch then moves no thumb for the rest of its life); else "wait". */
export function dragIntent(
  dx: number,
  dy: number,
  slop = DRAG_SLOP,
): "drag" | "scroll" | "wait" {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ay >= slop && ay >= ax) return "scroll";
  if (ax >= slop && ax > ay) return "drag";
  return "wait";
}
