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

// expo-location is loaded lazily so a build without the native module doesn't
// crash at import: the calls just report "unavailable" and the manual-area
// fallback takes over.
type LocationModule = typeof import("expo-location");
// A watch subscription (position or heading); both expose remove().
type Subscription = { remove: () => void };
type Position = {
  coords: { longitude: number; latitude: number; accuracy: number | null };
  timestamp?: number;
};

// Location states we present. "idle" = never requested; "unavailable" = no
// position could be found (location services off, no fix in time, or the API
// can't be reached: web, Expo Go, revoked).
export type LocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

/** What Posisjon got: a position, none at all, or no permission yet. */
export type LocateResult = "located" | "unavailable" | "needs-permission";

/** A position for the map: where it is, and whether it is the fresh fix
 *  (after a position known earlier). */
export type OnPosition = (coord: [number, number], fresh: boolean) => void;

/** A fresh fix gets this long, all tries together. */
export const LOCATE_TIMEOUT_MS = 10_000;
/** Posisjon eases on to the fresh fix only when it is this far (metres) from
 *  the position it flew to at once. */
export const LOCATE_REFINE_M = 30;
/** The phone's cached position is used at once when it is this recent … */
const LAST_KNOWN_MAX_AGE_MS = 2 * 60_000;
/** … and this accurate (metres). */
const LAST_KNOWN_ACCURACY_M = 500;

function coordOf(p: Position): [number, number] {
  return [p.coords.longitude, p.coords.latitude];
}

function isPrecise(p: Position): boolean {
  return p.coords.accuracy != null && p.coords.accuracy <= 100;
}

/** `p`, or null once `ms` have passed. */
function within<T>(p: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    p,
    new Promise<null>((resolve) => {
      timer = setTimeout(() => resolve(null), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

/** A fresh fix: Balanced accuracy first (Wi-Fi and cell towers, quick
 *  indoors), then GPS. With location services off the phone shows its own
 *  dialog to turn them on; if that is declined there is no second try. */
async function freshFix(
  Location: LocationModule,
  ms: number,
): Promise<Position | null> {
  const until = Date.now() + ms;
  for (const accuracy of [Location.Accuracy.Balanced, Location.Accuracy.High]) {
    const left = until - Date.now();
    if (left <= 0) return null;
    try {
      return await within(Location.getCurrentPositionAsync({ accuracy }), left);
    } catch {
      const on = await Location.hasServicesEnabledAsync?.().catch(() => false);
      if (on === false) return null;
    }
  }
  return null;
}

// Owns device-location permission + a manual-area fallback. Never fabricates a
// position: real coords come only from the phone; otherwise the map's centre
// falls back to a manually chosen area, then the demo default. Once located it
// WATCHES position + compass heading so the user puck stays current. Real GPS
// on a phone is native-verification-outstanding (NV-6).
//
// Speed pass (0346): the live position and heading go to the userLocation
// store, which only the location dot reads, so a GPS fix or a compass reading
// no longer renders the map screen. The screen pauses the watches while the
// map is not in front (pause / resume).
//
// Posisjon (R1b, user 2026-11-10: "the location button must take the user to
// their current location"): locate() hands the map the best position known at
// once (the app's fix, else the map engine's, else the phone's recent cached
// one), then a fresh fix. It no longer waits for a fresh fix and both watches
// before anything moves, and when no position can be found it says so instead
// of the map flying to the default place.
export function useMapLocation() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  // Whether the phone's fix is in use (the coordinate itself is in the store).
  const [hasFix, setHasFix] = useState(false);
  const [area, setArea] = useState<MockArea | null>(null);
  const [precise, setPrecise] = useState(false);
  // A fresh fix is on its way (the Posisjon button shows a spinner).
  const [locating, setLocating] = useState(false);

  const posSub = useRef<Subscription | null>(null);
  const headSub = useRef<Subscription | null>(null);
  // Bumped by stop(): a watch that resolves after stop() (area picked, or
  // unmount, during the await) belongs to a dead request and is removed at once.
  const gen = useRef(0);
  // Bumped by each locate() and on unmount: an older call's positions are
  // dropped.
  const locateGen = useRef(0);
  // The map follows the phone (a position in use, no manual area since): the
  // watches come back when the map is in front again.
  const following = useRef(false);
  // When the fix in the store was taken (the position's own timestamp; 0 when
  // unknown), so an older last-known position never replaces a newer fix.
  const fixAt = useRef(0);

  const stop = useCallback(() => {
    gen.current += 1;
    posSub.current?.remove();
    headSub.current?.remove();
    posSub.current = null;
    headSub.current = null;
  }, []);

  // Watch position + heading so the puck stays current. Replaces any prior
  // watches. Failures are non-fatal: the fix already shows the puck.
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
            const next = coordOf(p);
            fixAt.current = p.timestamp ?? 0;
            setUserCoord(next);
            // Jitter stays out of distances; a real move (> 250 m) counts.
            reportFix(next);
            setPrecise(isPrecise(p));
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

  // A position Posisjon goes to: the map follows the phone from here, and
  // distances measure from it (the origin, even after a manual area).
  const adopt = useCallback(
    (coord: [number, number], at: number, accurate?: boolean) => {
      fixAt.current = at;
      setUserCoord(coord);
      setHasFix(true);
      reportFix(coord, { force: true });
      setArea(null);
      setStatus("granted");
      following.current = true;
      if (accurate !== undefined) setPrecise(accurate);
    },
    [],
  );

  /**
   * Posisjon without asking: "needs-permission" when the OS has not given
   * location; otherwise `onPosition` gets the best position known at once and
   * then the fresh fix (if one comes). Resolves once the watches run.
   */
  const locate = useCallback(
    async (onPosition?: OnPosition): Promise<LocateResult> => {
      let Location: LocationModule;
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        Location = require("expo-location");
      } catch {
        setStatus("unavailable");
        return "unavailable";
      }
      const mine = ++locateGen.current;
      const live = () => locateGen.current === mine;
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status !== "granted") return "needs-permission";
      } catch {
        if (live()) setStatus("unavailable");
        return "unavailable";
      }
      if (!live()) return "located";

      // 1. The best position known now: the app's fix, else the map engine's
      // (what the dot shows), else the phone's recent cached one.
      const s = getUserLocation();
      let known: [number, number] | null = s.coord ?? s.nativeCoord;
      // The app's own fix keeps its time; the map engine's has none.
      let knownAt = s.coord ? fixAt.current : 0;
      if (!known) {
        try {
          const last = (await Location.getLastKnownPositionAsync({
            maxAge: LAST_KNOWN_MAX_AGE_MS,
            requiredAccuracy: LAST_KNOWN_ACCURACY_M,
          })) as Position | null;
          if (last) {
            known = coordOf(last);
            knownAt = last.timestamp ?? 0;
          }
        } catch {
          // No cached position: the fresh fix decides.
        }
        if (!live()) return "located";
      }
      if (known) {
        adopt(known, knownAt);
        onPosition?.(known, false);
      }

      // 2. A fresh fix.
      setLocating(true);
      const fresh = (await freshFix(
        Location,
        LOCATE_TIMEOUT_MS,
      )) as Position | null;
      if (!live()) return "located";
      setLocating(false);
      if (fresh) {
        const coord = coordOf(fresh);
        adopt(coord, fresh.timestamp ?? 0, isPrecise(fresh));
        onPosition?.(coord, true);
      } else if (!known) {
        setStatus("unavailable");
        return "unavailable";
      }
      await startWatches(Location);
      return "located";
    },
    [adopt, startWatches],
  );

  /** Ask for location (the OS prompt while it can still ask), then locate.
   *  "denied" when the answer is no. */
  const request = useCallback(
    async (onPosition?: OnPosition): Promise<LocateResult | "denied"> => {
      setStatus("requesting");
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Location: LocationModule = require("expo-location");
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== "granted") {
          setStatus("denied");
          return "denied";
        }
      } catch {
        // API unreachable (web geolocation blocked, Expo Go, etc.): never guess.
        setStatus("unavailable");
        return "unavailable";
      }
      const result = await locate(onPosition);
      if (result === "needs-permission") setStatus("denied");
      return result;
    },
    [locate],
  );

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
      locateGen.current += 1;
      setLocating(false);
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
      // The phone may have moved while the map was away, and the watch's first
      // fix can take a while: until then the dot and Posisjon would use the
      // old one (review of the speed pass). The phone's last known position
      // (kept fresh by the map engine's own tracking) replaces it at once
      // when it is newer; distances move only on a real move, as for any fix.
      Location.getLastKnownPositionAsync?.()
        .then((p) => {
          if (!p || !following.current || (p.timestamp ?? 0) <= fixAt.current)
            return;
          fixAt.current = p.timestamp ?? 0;
          const next = coordOf(p);
          setUserCoord(next);
          reportFix(next);
        })
        .catch(() => {});
    } catch {
      // The native module is gone (it was there for the request): keep the fix.
    }
  }, [startWatches]);

  // Tear down watches on unmount, and forget the position with the screen (as
  // when it was this hook's state): signing out unmounts the map.
  useEffect(
    () => () => {
      locateGen.current += 1;
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
    locating,
    locate,
    request,
    selectArea,
    hasPermission,
    pause,
    resume,
  };
}
