import { useCallback, useEffect, useRef, useState } from "react";

import { MAP_CENTER, type MockArea } from "@/fixtures";

// expo-location is loaded lazily inside request() so a build that doesn't include
// the native module doesn't crash at import — the request just resolves to
// "unavailable" and the manual-area fallback takes over.
type LocationModule = typeof import("expo-location");
// A watch subscription (position or heading) — both expose remove().
type Subscription = { remove: () => void };

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
// Once granted it WATCHES position + compass heading continuously so the user
// puck stays visible and its direction arrow tracks facing. Real GPS/heading is
// native-verification-outstanding (NV-6).
export function useMapLocation() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [coord, setCoord] = useState<[number, number] | null>(null);
  const [area, setArea] = useState<MockArea | null>(null);
  const [precise, setPrecise] = useState(false);
  // Device heading in degrees (0 = north), or null until a reading arrives.
  const [heading, setHeading] = useState<number | null>(null);

  const posSub = useRef<Subscription | null>(null);
  const headSub = useRef<Subscription | null>(null);
  // Bumped by stop(): a watch that resolves after stop() (area picked, or
  // unmount, during the await) belongs to a dead request and is removed at once.
  const gen = useRef(0);

  const stop = useCallback(() => {
    gen.current += 1;
    posSub.current?.remove();
    headSub.current?.remove();
    posSub.current = null;
    headSub.current = null;
  }, []);

  const request = useCallback(async () => {
    setStatus("requesting");
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Location: LocationModule = require("expo-location");
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

      // Continuously watch position + heading so the puck stays current. Replace
      // any prior watches. Failures here are non-fatal — the one-shot fix above
      // already made the puck visible.
      stop();
      const mine = gen.current;
      const live = () => gen.current === mine;
      try {
        const ps = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
          (p) => {
            if (!live()) return;
            setCoord([p.coords.longitude, p.coords.latitude]);
            setPrecise(p.coords.accuracy != null && p.coords.accuracy <= 100);
          },
        );
        if (!live()) {
          ps.remove();
          return;
        }
        posSub.current = ps;
        const hs = await Location.watchHeadingAsync((h) => {
          if (!live()) return;
          const deg = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
          setHeading(deg >= 0 ? deg : null);
        });
        if (!live()) {
          hs.remove();
          return;
        }
        headSub.current = hs;
      } catch {
        // Watching unsupported (e.g. web, no magnetometer) — keep the fix.
      }
    } catch {
      // API unreachable (web geolocation blocked, Expo Go, etc.) — never guess.
      setStatus("unavailable");
    }
  }, [stop]);

  // Manual fallback: pick a known area so public content stays browsable without
  // precise GPS. Clears any GPS fix + watches; leaves permission status as-is.
  const selectArea = useCallback(
    (a: MockArea) => {
      stop();
      setArea(a);
      setCoord(null);
      setPrecise(false);
      setHeading(null);
    },
    [stop],
  );

  // Tear down watches on unmount.
  useEffect(() => stop, [stop]);

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
    heading,
    center,
    areaLabel,
    request,
    selectArea,
  };
}
