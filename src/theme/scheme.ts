// Colour-scheme store (docs/design/DESIGN_SYSTEM.md §2 "Theme").
//
// Preference is "light" | "dark" | "system" (default: follow the phone). Picked
// under Innstillinger → Utseende (user request 2026-11-24) or forced from the
// dev-only sandbox (app/_sandbox/theme.tsx). A device choice: deviceSettings.ts
// keeps it on the phone across restarts.
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

export const SCHEME_PREFERENCES: readonly SchemePreference[] = [
  "system",
  "light",
  "dark",
];

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
): Scheme {
  if (pref === "system") return system === "dark" ? "dark" : "light";
  return pref;
}

/** The active scheme ("light" | "dark"). */
export function useScheme(): Scheme {
  const pref = useSchemePreference();
  const system = useColorScheme();
  return resolveScheme(pref, system);
}

export type ThemeColors = typeof tokens.palette.light;

/** Hex colours of the active scheme, for native colour props (Ionicons color, Switch, etc.). */
export function useThemeColors(): ThemeColors {
  return tokens.palette[useScheme()];
}
