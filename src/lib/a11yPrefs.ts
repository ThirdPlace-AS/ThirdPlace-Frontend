import { useSyncExternalStore } from "react";

import type { MapFilters } from "@/components/map/services/mapFilters";

// Tilgjengelighet (PDF p19), Phase 15: the switches change the app.
// - reduceMotion: the app's animations are off (useReducedMotion and
//   Reanimated's global setting), as when the phone asks for it.
// - largerText: every Text one step larger (TEXT_SCALE).
// - wheelchairOnly ("Vis kun rullestolvennlige"): the map and Sveip start
//   with the step-free filter on (PDF hint "Filtrerer steder automatisk").
// Device settings: kept on the phone from L5 (deviceSettings).
export type A11yPrefs = {
  reduceMotion: boolean;
  largerText: boolean;
  wheelchairOnly: boolean;
};

export const DEFAULT_A11Y_PREFS: A11yPrefs = {
  reduceMotion: false,
  largerText: false,
  wheelchairOnly: false,
};

/** "Større tekst": one step up (16 → 18.4 for body text). */
export const TEXT_SCALE = 1.15;

/** The filter "Vis kun rullestolvennlige" turns on. */
export const WHEELCHAIR_FEATURE = "Trinnfri inngang";

let prefs: A11yPrefs = DEFAULT_A11Y_PREFS;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function setA11yPrefs(next: Partial<A11yPrefs>) {
  prefs = { ...prefs, ...next };
  emit();
}

/** Tests (and device settings on start-up). */
export function resetA11yPrefs(to: A11yPrefs = DEFAULT_A11Y_PREFS) {
  prefs = to;
  emit();
}

export function getA11yPrefs(): A11yPrefs {
  return prefs;
}

export function useA11yPrefs(): A11yPrefs {
  return useSyncExternalStore(
    subscribe,
    () => prefs,
    () => prefs,
  );
}

/** 1, or TEXT_SCALE with "Større tekst" (a number, so Text re-renders only
 *  when it changes). */
export function useTextScale(): number {
  return useSyncExternalStore(
    subscribe,
    () => (prefs.largerText ? TEXT_SCALE : 1),
    () => (prefs.largerText ? TEXT_SCALE : 1),
  );
}

/** Filters with the step-free filter on or off. */
export function withWheelchair(f: MapFilters, on: boolean): MapFilters {
  const has = f.accessibility.includes(WHEELCHAIR_FEATURE);
  if (on === has) return f;
  return {
    ...f,
    accessibility: on
      ? [...f.accessibility, WHEELCHAIR_FEATURE]
      : f.accessibility.filter((a) => a !== WHEELCHAIR_FEATURE),
  };
}
