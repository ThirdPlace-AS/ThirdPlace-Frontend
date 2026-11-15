import { createStore, useStore } from "zustand";

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

type State = { prefs: A11yPrefs };
const store = createStore((): State => ({ prefs: DEFAULT_A11Y_PREFS }));
const selectPrefs = (s: State) => s.prefs;
const selectTextScale = (s: State) => (s.prefs.largerText ? TEXT_SCALE : 1);

/** deviceSettings.ts writes the prefs to the phone when they change. */
export function onA11yPrefsChange(l: () => void): () => void {
  return store.subscribe(() => l());
}

export function setA11yPrefs(next: Partial<A11yPrefs>) {
  store.setState({ prefs: { ...store.getState().prefs, ...next } });
}

/** Tests, and device settings on start-up (unknown values fall back). */
export function resetA11yPrefs(to: Partial<A11yPrefs> = DEFAULT_A11Y_PREFS) {
  const pick = (k: keyof A11yPrefs) =>
    typeof to[k] === "boolean" ? (to[k] as boolean) : DEFAULT_A11Y_PREFS[k];
  store.setState({
    prefs: {
      reduceMotion: pick("reduceMotion"),
      largerText: pick("largerText"),
      wheelchairOnly: pick("wheelchairOnly"),
    },
  });
}

export function getA11yPrefs(): A11yPrefs {
  return store.getState().prefs;
}

export function useA11yPrefs(): A11yPrefs {
  return useStore(store, selectPrefs);
}

/** 1, or TEXT_SCALE with "Større tekst" (a number, so Text re-renders only
 *  when it changes). */
export function useTextScale(): number {
  return useStore(store, selectTextScale);
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
