import { useCallback, useMemo, useState } from "react";

import type { SheetTarget } from "../sheetTypes";
import { type DiscoveryItem, markerId } from "../types/mapPresentation";

// Splits selection into two layers (the preview-card model):
//   - `preview`: a lightweight floating card for the tapped marker/list row.
//   - `sheetStack`: the expanded detail sheet (reuses the existing MapDetailSheet
//     in-sheet navigation stack).
// Selecting a marker sets the preview; expanding promotes it onto the stack.
export function useMapSelection() {
  const [preview, setPreview] = useState<DiscoveryItem | null>(null);
  const [sheetStack, setSheetStack] = useState<SheetTarget[]>([]);

  const selectPreview = useCallback((item: DiscoveryItem) => {
    setPreview(item);
  }, []);

  const clearPreview = useCallback(() => setPreview(null), []);

  // Promote the current preview into the full detail sheet.
  const expand = useCallback(() => {
    setPreview((p) => {
      if (p) setSheetStack([{ kind: p.kind, id: p.id }]);
      return null;
    });
  }, []);

  // Open a detail target directly (e.g. from a list row), skipping the preview.
  const openTarget = useCallback((t: SheetTarget) => {
    setPreview(null);
    setSheetStack([t]);
  }, []);

  const push = useCallback(
    (t: SheetTarget) => setSheetStack((s) => [...s, t]),
    [],
  );
  const back = useCallback(() => setSheetStack((s) => s.slice(0, -1)), []);
  const close = useCallback(() => setSheetStack([]), []);

  // The marker currently in focus (preview first, else the sheet root) — drives
  // pin highlight + list row selected state so map and list stay in sync.
  const selectedMarkerId = useMemo(() => {
    if (preview) return preview.markerId;
    const root = sheetStack[0];
    return root ? markerId(root.kind, root.id) : null;
  }, [preview, sheetStack]);

  return {
    preview,
    sheetStack,
    selectedMarkerId,
    selectPreview,
    clearPreview,
    expand,
    openTarget,
    push,
    back,
    close,
  };
}
