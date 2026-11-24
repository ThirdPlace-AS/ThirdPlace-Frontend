// Colour-scheme store (docs/design/DESIGN_SYSTEM.md §2 "Theme").
//
// Preference is "light" | "dark" | "system". The default is "light" until the
// Phase 5 dark-mode sweep has verified every route; the sandbox
// (app/_sandbox/theme.tsx) can switch it for preview. In-memory only, like the
// other demo stores — persistence is contract-blocked.
import { createContext, useContext } from "react";
import { useColorScheme } from "react-native";
import { createStore, useStore } from "zustand";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tokens = require("./tokens.js") as {
  palette: Record<Scheme, Record<string, string>>;
};

export type Scheme = "light" | "dark";
export type SchemePreference = Scheme | "system";

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

/** Pure resolver — exported for tests. */
export function resolveScheme(
  pref: SchemePreference,
  system: string | null | undefined,
): Scheme {
  if (pref === "system") return system === "dark" ? "dark" : "light";
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
  return forced ?? resolveScheme(pref, system);
}

export type ThemeColors = typeof tokens.palette.light;

/** Hex colours of the active scheme, for native colour props (Ionicons color, Switch, etc.). */
export function useThemeColors(): ThemeColors {
  return tokens.palette[useScheme()];
}
