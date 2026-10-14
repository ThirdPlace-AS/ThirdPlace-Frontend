import * as Location from "expo-location";
import { useCallback, useState } from "react";

import { MAP_CENTER, type MockArea } from "@/fixtures";

// Location states we present. "idle" = never requested; "unavailable" = the
// permission/GPS API could not be reached (web blocked, Expo Go limits, revoked).
export type LocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

// Owns device-location permission + a manual-area fallback. Never fabricates a
// position: real coords come only from a granted GPS fix; otherwise the camera
// center falls back to a manually chosen Oslo area, then the demo default.
// Real GPS is native-verification-outstanding (NV-6).
export function useMapLocation() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [coord, setCoord] = useState<[number, number] | null>(null);
  const [area, setArea] = useState<MockArea | null>(null);
  const [precise, setPrecise] = useState(false);

  const request = useCallback(async () => {
    setStatus("requesting");
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        setStatus("denied");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoord([pos.coords.longitude, pos.coords.latitude]);
      setArea(null);
      setPrecise(pos.coords.accuracy != null && pos.coords.accuracy <= 100);
      setStatus("granted");
    } catch {
      // API unreachable (web geolocation blocked, Expo Go, etc.) — never guess.
      setStatus("unavailable");
    }
  }, []);

  // Manual fallback: pick a known area so public content stays browsable without
  // precise GPS. Clears any GPS fix; leaves permission status as-is.
  const selectArea = useCallback((a: MockArea) => {
    setArea(a);
    setCoord(null);
    setPrecise(false);
  }, []);

  // Camera center priority: GPS fix > manual area > demo default.
  const center: [number, number] = coord ?? area?.coord ?? MAP_CENTER;
  const areaLabel = area
    ? area.name
    : coord
      ? precise
        ? "Min posisjon"
        : "Omtrentlig posisjon"
      : null;

  return {
    status,
    coord,
    area,
    precise,
    center,
    areaLabel,
    request,
    selectArea,
  };
}
