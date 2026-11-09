import { useCallback, useEffect, useRef, useState } from "react";

import { MAP_CENTER, type MockArea } from "@/fixtures";
import { reportFix, setOriginArea } from "@/lib/origin";
import {
  clearUserFix,
  getUserLocation,
  resetUserLocation,
  setUserCoord,
  setUserHeading,
} from "@/lib/userLocation";

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
// Once granted it WATCHES position + compass heading so the user puck stays
// visible and its direction arrow tracks facing. Real GPS/heading is
// native-verification-outstanding (NV-6).
//
// Speed pass (0346): the live position and heading go to the userLocation
// store, which only the location dot reads, so a GPS fix or a compass reading
// no longer renders the map screen. The screen pauses the watches while the
// map is not in front (pause / resume).
export function useMapLocation() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  // Whether the phone's fix is in use (the coordinate itself is in the store).
  const [hasFix, setHasFix] = useState(false);
  const [area, setArea] = useState<MockArea | null>(null);
  const [precise, setPrecise] = useState(false);

  const posSub = useRef<Subscription | null>(null);
  const headSub = useRef<Subscription | null>(null);
  // Bumped by stop(): a watch that resolves after stop() (area picked, or
  // unmount, during the await) belongs to a dead request and is removed at once.
  const gen = useRef(0);
  // The map follows the phone (a granted request, no manual area since): the
  // watches come back when the map is in front again.
  const following = useRef(false);

  const stop = useCallback(() => {
    gen.current += 1;
    posSub.current?.remove();
    headSub.current?.remove();
    posSub.current = null;
    headSub.current = null;
  }, []);

  // Watch position + heading so the puck stays current. Replaces any prior
  // watches. Failures are non-fatal: the one-shot fix already shows the puck.
  const startWatches = useCallback(
    async (Location: LocationModule) => {
      stop();
      const mine = gen.current;
      const live = () => gen.current === mine;
      try {
        const ps = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
          (p) => {
            if (!live()) return;
            const next: [number, number] = [
              p.coords.longitude,
              p.coords.latitude,
            ];
            setUserCoord(next);
            // Jitter stays out of distances; a real move (> 250 m) counts.
            reportFix(next);
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
          setUserHeading(deg >= 0 ? deg : null);
        });
        if (!live()) {
          hs.remove();
          return;
        }
        headSub.current = hs;
      } catch {
        // Watching unsupported (e.g. web, no magnetometer) — keep the fix.
      }
    },
    [stop],
  );

  /** Resolves true once a GPS fix is in (so the caller can fly to it). */
  const request = useCallback(async (): Promise<boolean> => {
    setStatus("requesting");
    let ok = false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Location: LocationModule = require("expo-location");
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        setStatus("denied");
        return false;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const fix: [number, number] = [pos.coords.longitude, pos.coords.latitude];
      setUserCoord(fix);
      setHasFix(true);
      // A fresh request (Posisjon, the location sheet): distances follow the
      // phone from here.
      reportFix(fix, { force: true });
      setArea(null);
      setPrecise(pos.coords.accuracy != null && pos.coords.accuracy <= 100);
      setStatus("granted");
      ok = true;
      following.current = true;
      await startWatches(Location);
    } catch {
      // API unreachable (web geolocation blocked, Expo Go, etc.) — never guess.
      setStatus("unavailable");
    }
    return ok;
  }, [startWatches]);

  /** True when the OS already granted location (no prompt is shown). */
  const hasPermission = useCallback(async (): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Location: LocationModule = require("expo-location");
      const perm = await Location.getForegroundPermissionsAsync();
      return perm.status === "granted";
    } catch {
      return false;
    }
  }, []);

  // Manual fallback: pick a known area so public content stays browsable without
  // precise GPS. Clears any GPS fix + watches; leaves permission status as-is.
  const selectArea = useCallback(
    (a: MockArea) => {
      following.current = false;
      stop();
      setArea(a);
      setOriginArea(a.coord);
      clearUserFix();
      setHasFix(false);
      setPrecise(false);
    },
    [stop],
  );

  /** The map left the screen: stop watching (the store keeps the last fix). */
  const pause = useCallback(() => {
    if (following.current) stop();
  }, [stop]);

  /** The map is back in front: watch again if it was following the phone. */
  const resume = useCallback(() => {
    if (!following.current || posSub.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Location: LocationModule = require("expo-location");
      void startWatches(Location);
    } catch {
      // The native module is gone (it was there for the request): keep the fix.
    }
  }, [startWatches]);

  // Tear down watches on unmount, and forget the position with the screen (as
  // when it was this hook's state): signing out unmounts the map.
  useEffect(
    () => () => {
      stop();
      resetUserLocation();
    },
    [stop],
  );

  // The phone's fix as of this render (the store holds the live one).
  const coord = hasFix ? getUserLocation().coord : null;
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
    hasPermission,
    pause,
    resume,
  };
}
