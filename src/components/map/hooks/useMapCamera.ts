import { useCallback, useState } from "react";

// Owns the camera recenter signal. There is NO real GPS (fixtures-only); bumping
// the signal animates the native map back to the MOCK demo center. SoftMap ignores
// it. Real location recenter arrives with expo-location in Milestone 6.
export function useMapCamera() {
  const [recenterSignal, setRecenterSignal] = useState(0);
  // Zoom for the next recenter: 13 for an area, 15 when flying to the user
  // (Phase 11 G8, "Posisjon" zooms in on the user).
  const [recenterZoom, setRecenterZoom] = useState(13);
  const recenter = useCallback((zoom = 13) => {
    setRecenterZoom(zoom);
    setRecenterSignal((n) => n + 1);
  }, []);
  return { recenterSignal, recenterZoom, recenter };
}
