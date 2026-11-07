import { useSyncExternalStore } from "react";

// Personvern's switches (PDF p19 Synlighet, p21 Datadeling), shared by the
// Personvern page and the Personvernsjekk walk (Phase 18) so both show and
// change the same values. "Vis meg som deltaker" lives in src/lib/going.ts
// (the experience cards read it). In memory like the account's other
// settings: nothing about the account is kept on the phone, and logout
// brings back these defaults. BLOCKED_CONTRACT_GAP: no consent store or
// visibility gate; the switches change nothing outside the app's screens.

export type PrivacyPrefs = {
  mapVisible: boolean;
  profileVisible: boolean;
  discoverable: boolean;
  shareActivity: boolean;
  personalised: boolean;
  analytics: boolean;
};

/** As drawn: p19 Synlighet on, on, off; p21 Datadeling on, on, off. */
export const DEFAULT_PRIVACY_PREFS: PrivacyPrefs = {
  mapVisible: true,
  profileVisible: true,
  discoverable: false,
  shareActivity: true,
  personalised: true,
  analytics: false,
};

let prefs: PrivacyPrefs = DEFAULT_PRIVACY_PREFS;
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

export function setPrivacyPref(key: keyof PrivacyPrefs, value: boolean) {
  if (prefs[key] === value) return;
  prefs = { ...prefs, [key]: value };
  emit();
}

export function getPrivacyPrefs(): PrivacyPrefs {
  return prefs;
}

/** Logout and tests. */
export function resetPrivacyPrefs() {
  prefs = DEFAULT_PRIVACY_PREFS;
  emit();
}

export function usePrivacyPrefs(): PrivacyPrefs {
  return useSyncExternalStore(
    subscribe,
    () => prefs,
    () => prefs,
  );
}
