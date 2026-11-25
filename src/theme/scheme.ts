// Colour-scheme store (docs/design/DESIGN_SYSTEM.md §2 "Theme").
//
// Preference is "light" | "dark" | "system" (default: follow the phone). Picked
// under Innstillinger → Utseende (user request 2026-11-24) or forced from the
// dev-only sandbox (app/_sandbox/theme.tsx). A device choice: deviceSettings.ts
// keeps it on the phone across restarts.
import { createContext, useContext } from "react";
import {
  AppState,
  useColorScheme,
  type NativeEventSubscription,
} from "react-native";
import { createStore, useStore } from "zustand";

import { periodForHour } from "@/components/map/mapStyles";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tokens = require("./tokens.js") as {
  palette: Record<Scheme, Record<string, string>>;
};

export type Scheme = "light" | "dark";
/** "auto" (user 2026-11-25): dark while the map's own auto style is Natt
 *  (periodForHour, 20–05), light otherwise, so the app turns with the map. */
export type SchemePreference = Scheme | "system" | "auto";

export const DEFAULT_SCHEME_PREFERENCE: SchemePreference = "system";

type State = { preference: SchemePreference };
const store = createStore(
  (): State => ({ preference: DEFAULT_SCHEME_PREFERENCE }),
);
const selectPreference = (s: State) => s.preference;

export function setSchemePreference(next: SchemePreference) {
  if (next === store.getState().preference) return;
  store.setState({ preference: next });
}

export function getSchemePreference(): SchemePreference {
  return store.getState().preference;
}

export function useSchemePreference(): SchemePreference {
  return useStore(store, selectPreference);
}

export const SCHEME_PREFERENCES: readonly SchemePreference[] = [
  "system",
  "auto",
  "light",
  "dark",
];

// The local hour, for "auto". It ticks only while "auto" is picked: every
// 5 minutes (as the map's useTimeOfDayStyle) and when the app comes back to
// the foreground, and changes state only when the hour changes.
const CLOCK_TICK_MS = 5 * 60 * 1000;
const clock = createStore(() => ({ hour: new Date().getHours() }));
const selectHour = (s: { hour: number }) => s.hour;
let clockTimer: ReturnType<typeof setInterval> | null = null;
let clockSub: NativeEventSubscription | null = null;

function tickClock() {
  const hour = new Date().getHours();
  if (hour !== clock.getState().hour) clock.setState({ hour });
}

function syncClock() {
  const on = store.getState().preference === "auto";
  if (on && !clockTimer) {
    tickClock();
    clockTimer = setInterval(tickClock, CLOCK_TICK_MS);
    clockSub = AppState.addEventListener("change", (s) => {
      if (s === "active") tickClock();
    });
  } else if (!on && clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
    clockSub?.remove();
    clockSub = null;
  }
}
store.subscribe(syncClock);

export function onSchemePreferenceChange(l: () => void): () => void {
  return store.subscribe(() => l());
}

/** Device settings on start-up, and tests. Unknown values fall back. */
export function restoreSchemePreference(saved: unknown) {
  const preference = SCHEME_PREFERENCES.includes(saved as SchemePreference)
    ? (saved as SchemePreference)
    : DEFAULT_SCHEME_PREFERENCE;
  store.setState({ preference });
}

/** Pure resolver — exported for tests. */
export function resolveScheme(
  pref: SchemePreference,
  system: string | null | undefined,
  hour: number = new Date().getHours(),
): Scheme {
  if (pref === "system") return system === "dark" ? "dark" : "light";
  if (pref === "auto")
    return periodForHour(hour) === "night" ? "dark" : "light";
  return pref;
}

/** A subtree drawn in one scheme whatever the phone's (Sveip's details sit
 *  on the dark deck, 2026-11-18). Set through `SchemeScope` (ThemeRoot.tsx),
 *  which also applies that scheme's colour variables. */
export const SchemeOverrideContext = createContext<Scheme | null>(null);

/** The active scheme ("light" | "dark"). */
export function useScheme(): Scheme {
  const forced = useContext(SchemeOverrideContext);
  const pref = useSchemePreference();
  const system = useColorScheme();
  const hour = useStore(clock, selectHour);
  return forced ?? resolveScheme(pref, system, hour);
}

export type ThemeColors = typeof tokens.palette.light;

/** Hex colours of the active scheme, for native colour props (Ionicons color, Switch, etc.). */
export function useThemeColors(): ThemeColors {
  return tokens.palette[useScheme()];
}
