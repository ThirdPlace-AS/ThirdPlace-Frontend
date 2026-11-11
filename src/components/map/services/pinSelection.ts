// The selected pin's filter (user 2026-11-11: "the red focus on the marker
// must be instant on click"). MapboxMap draws the selection (the ember ring
// and the pin, glyph and title again on top) with four layers filtered on the
// selected marker id. React's `selectedMarkerId` stays the source of truth,
// but it arrives in the same render that mounts the detail sheet, about half
// a second after the tap on the emulator. So the pin press also sets the
// layers' filter natively (setNativeProps) before the selection renders: the
// ring shows with the tap. Pure, so the rules are tested here.

/** A Mapbox filter expression on one marker id. */
export type SelectionFilter = ["==", ["get", "markerId"], string];

/** No marker matches this id. */
const NONE = "__none__";

/** The filter that draws `markerId` as the selected pin (none for null). */
export function selectionFilter(
  markerId: string | null | undefined,
): SelectionFilter {
  return ["==", ["get", "markerId"], markerId ?? NONE];
}

/**
 * What the selected layers show after a pin press: the pressed pin when the
 * screen took the selection, else the selection that was already there (the
 * press set the filter natively before knowing; Fabric would keep that value
 * until React's own filter changes, so a declined press must put it back).
 */
export function filterAfterPress(
  accepted: boolean,
  pressed: string,
  current: string | null,
): SelectionFilter {
  return selectionFilter(accepted ? pressed : current);
}
