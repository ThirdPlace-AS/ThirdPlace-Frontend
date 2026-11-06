import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import { autoStyleKey, type MapStyleKey } from "@/components/map/mapStyles";
import { useScheme } from "@/theme";

// How often the follow-the-clock timer re-checks the current period while the
// map is open. 5 min is well under the narrowest band (3h) so no transition is
// missed, without churning the native map.
const TICK_MS = 5 * 60 * 1000;

const currentHour = () => new Date().getHours();

// Owns the base-map style key and whether it auto-follows the time of day.
//
// `auto` (default true): the key tracks the local clock — computed on mount,
// re-checked on a timer and when the app returns to the foreground, so a
// dusk→night transition flips without a reload. A manual pick from the layer
// sheet (`selectStyle`) turns auto OFF and sticks; `enableAuto` turns it back on
// and snaps straight to the current period's style.
//
// `Date` / `AppState` / timers live here so `mapStyles.ts` stays pure.
export function useTimeOfDayStyle() {
  const dark = useScheme() === "dark";
  const [hour, setHour] = useState(currentHour);
  const [manualKey, setManualKey] = useState<MapStyleKey | null>(null);
  const auto = manualKey === null;
  // Auto follows the clock, and the night style while the app is dark.
  const styleKey = manualKey ?? autoStyleKey(hour, dark);

  // Only call setState when the hour actually changes, to avoid needless
  // re-renders / native camera churn on every tick.
  const applyCurrent = useCallback(() => {
    const next = currentHour();
    setHour((prev) => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    if (!auto) return;

    // Initial key comes from the useState initializer; enableAuto() snaps on
    // re-enable; the AppState "active" handler catches up after backgrounding.
    // So the effect only needs the timer + foreground listener here.
    const interval = setInterval(applyCurrent, TICK_MS);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") applyCurrent();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [auto, applyCurrent]);

  const selectStyle = useCallback((key: MapStyleKey) => {
    setManualKey(key);
  }, []);

  const enableAuto = useCallback(() => {
    setHour(currentHour());
    setManualKey(null);
  }, []);

  return { styleKey, auto, selectStyle, enableAuto };
}
