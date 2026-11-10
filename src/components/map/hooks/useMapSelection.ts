import { useCallback, useMemo, useState } from "react";

import type { SheetTarget } from "../sheetTypes";
import { type DiscoveryItem, markerId } from "../types/mapPresentation";

// Google-Maps-style selection: a single draggable detail sheet (see
// MapDetailSheet) with snap points [peek, mid, full]. Tapping a map marker opens
// the sheet at the PEEK snap (index 0, ~35%) so a slice of the detail shows right
// away; the user drags up for more. Opening from a list row / search result goes
// straight to the MID snap (index 1). `openIndex` tells the sheet which snap to
// animate to when a new target opens.
export const SNAP_PEEK = 0;
export const SNAP_MID = 1;

// What the Android back key does on the map, from the detail-stack depth and
// whether the experience page is full screen: step back inside the sheet,
// collapse the page to the mid snap, close the sheet, or (nothing open) let
// navigation handle it. Page → 60 % → close (Phase 11 G5).
export type MapBackAction = "back" | "collapse" | "close" | "none";
export function mapBackAction(
  stackDepth: number,
  isPage = false,
): MapBackAction {
  if (stackDepth > 1) return "back";
  if (stackDepth === 1) return isPage ? "collapse" : "close";
  return "none";
}

export function useMapSelection() {
  const [sheetStack, setSheetStack] = useState<SheetTarget[]>([]);
  const [openIndex, setOpenIndex] = useState<number>(SNAP_PEEK);
  // Bumped on every selection so the detail sheet re-snaps open EVERY time a
  // marker/row is tapped — even when the target is unchanged (e.g. re-tapping
  // the marker already in focus) or the sheet stayed mounted. Without it, the
  // open effect keyed on the target alone silently skips repeat taps.
  const [openNonce, setOpenNonce] = useState(0);

  // Marker tap: open the detail sheet at the peek snap (shows ~16% immediately).
  const selectMarker = useCallback((item: DiscoveryItem) => {
    setOpenIndex(SNAP_PEEK);
    setOpenNonce((n) => n + 1);
    setSheetStack([{ kind: item.kind, id: item.id }]);
  }, []);

  // Open a detail target directly (e.g. from a list row or search) at the mid
  // snap, skipping the peek.
  const openTarget = useCallback((t: SheetTarget) => {
    setOpenIndex(SNAP_MID);
    setOpenNonce((n) => n + 1);
    setSheetStack([t]);
  }, []);

  const push = useCallback(
    (t: SheetTarget) => setSheetStack((s) => [...s, t]),
    [],
  );
  const back = useCallback(() => setSheetStack((s) => s.slice(0, -1)), []);
  const close = useCallback(() => setSheetStack([]), []);

  // The marker currently in focus (the sheet root) — drives pin highlight + list
  // row selected state so map and list stay in sync.
  const selectedMarkerId = useMemo(() => {
    const root = sheetStack[0];
    return root ? markerId(root.kind, root.id) : null;
  }, [sheetStack]);

  // One object per selection state (speed pass review): a caller that keeps
  // the whole object in a dependency list then changes only with it.
  return useMemo(
    () => ({
      sheetStack,
      openIndex,
      openNonce,
      selectedMarkerId,
      selectMarker,
      openTarget,
      push,
      back,
      close,
    }),
    [
      sheetStack,
      openIndex,
      openNonce,
      selectedMarkerId,
      selectMarker,
      openTarget,
      push,
      back,
      close,
    ],
  );
}
