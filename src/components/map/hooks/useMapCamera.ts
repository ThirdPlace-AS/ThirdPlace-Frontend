import { useCallback, useState } from "react";

// Owns the camera recenter signal. There is NO real GPS (fixtures-only); bumping
// the signal animates the native map back to the MOCK demo center. SoftMap ignores
// it. Real location recenter arrives with expo-location in Milestone 6.
export function useMapCamera() {
  const [recenterSignal, setRecenterSignal] = useState(0);
  const recenter = useCallback(() => setRecenterSignal((n) => n + 1), []);
  return { recenterSignal, recenter };
}
