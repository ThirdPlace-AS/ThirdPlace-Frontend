// Colour-scheme store (docs/design/DESIGN_SYSTEM.md §2 "Theme").
//
// Preference is "light" | "dark" | "system". The default is "light" until the
// Phase 5 dark-mode sweep has verified every route; the sandbox
// (app/_sandbox/theme.tsx) can switch it for preview. In-memory only, like the
// other demo stores — persistence is contract-blocked.
import { useSyncExternalStore } from "react";
import { useColorScheme } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tokens = require("./tokens.js") as {
  palette: Record<Scheme, Record<string, string>>;
};

export type Scheme = "light" | "dark";
export type SchemePreference = Scheme | "system";

export const DEFAULT_SCHEME_PREFERENCE: SchemePreference = "light";

let preference: SchemePreference = DEFAULT_SCHEME_PREFERENCE;
const listeners = new Set<() => void>();

export function setSchemePreference(next: SchemePreference) {
  if (next === preference) return;
  preference = next;
  listeners.forEach((l) => l());
}

export function getSchemePreference(): SchemePreference {
  return preference;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSchemePreference(): SchemePreference {
  return useSyncExternalStore(
    subscribe,
    getSchemePreference,
    getSchemePreference,
  );
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
