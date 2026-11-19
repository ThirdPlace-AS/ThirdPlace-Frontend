// Window rect of a tapped thumbnail, for a surface that grows out of it
// (PhotoViewer's `from`, 0457). Measured on the tap, not on layout, so a
// scrolled list reports where the thumbnail is now.
import { useCallback, useRef } from "react";
import type { View } from "react-native";

import type { Rect } from "./originMotion";

/** Measures a view in window coordinates; null when it is gone or has no
 *  size (the surface then zooms from the press point or fades). */
export function measureRect(
  node: View | null | undefined,
  done: (rect: Rect | null) => void,
) {
  if (!node) {
    done(null);
    return;
  }
  node.measureInWindow((x, y, width, height) =>
    done(width > 0 && height > 0 ? { x, y, width, height } : null),
  );
}

/** A ref for the thumbnail and a `measure(done)` that reads its rect. */
export function useOriginRect() {
  const ref = useRef<View>(null);
  const measure = useCallback(
    (done: (rect: Rect | null) => void) => measureRect(ref.current, done),
    [],
  );
  return [ref, measure] as const;
}
