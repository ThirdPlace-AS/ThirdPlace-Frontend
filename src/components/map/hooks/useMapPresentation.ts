import { useCallback, useState } from "react";

export type MapView = "map" | "list";

// Owns the Map/List presentation toggle. Selection + discovery state live in their
// own hooks so switching views preserves context (journey K).
export function useMapPresentation(initial: MapView = "map") {
  const [view, setView] = useState<MapView>(initial);
  const toggle = useCallback(
    () => setView((v) => (v === "map" ? "list" : "map")),
    [],
  );
  return { view, setView, toggle };
}
