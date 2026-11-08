import { useSyncExternalStore } from "react";

// Interests and preferences the user picks in onboarding (PDF p2–p3) and can
// change later under Innstillinger → Preferanser (PDF p13). One list of
// choices for both, and one in-memory store, so what onboarding picked is
// what Preferanser shows. BLOCKED_CONTRACT_GAP: no preference backend, and
// how answers affect recommendations is not specified, so the app makes no
// claim about it. A reload clears the store, like the other demo stores.

export type PreferenceRow = { label: string; options: readonly string[] };

/** "Hva liker du?" (PDF p3) and Rediger profil's "Legg til" (PDF p13). */
export const INTEREST_OPTIONS: readonly string[] = [
  "Kaffe",
  "Jazz",
  "Løping",
  "Fotografi",
  "Keramikk",
  "Brettspill",
  "Klatring",
  "Vin",
  "Bakst",
  "Design",
  "Litteratur",
  "Yoga",
  "Sjakk",
  "Vinyl",
  "Matlaging",
  "Fotball",
  "Kunst",
  "Padel",
  "Sopp-tur",
  "Strikking",
  "Film",
  "Tech",
];

const SOCIAL: PreferenceRow = {
  label: "Sosial komfort",
  options: ["Liten gruppe", "Middels", "Stor"],
};
const SPENDING: PreferenceRow = {
  label: "Forbruksstil",
  options: ["Budsjett", "Moderat", "Raus"],
};
const ENERGY: PreferenceRow = {
  label: "Energinivå",
  options: ["Rolig", "Balansert", "Høy"],
};
const GROUP_SIZE: PreferenceRow = {
  label: "Gruppestørrelse",
  options: ["2–4", "5–10", "10+"],
};
const ALCOHOL: PreferenceRow = {
  label: "Alkohol",
  options: ["Nei", "Av og til", "Gjerne"],
};

/** Onboarding "Dine preferanser" (PDF p3). */
export const ONBOARDING_PREFERENCES: readonly PreferenceRow[] = [
  SOCIAL,
  SPENDING,
  ENERGY,
  ALCOHOL,
];

/** Preferanser (PDF p13): adds Gruppestørrelse, in the PDF's order. */
export const PREFERENCE_ROWS: readonly PreferenceRow[] = [
  SOCIAL,
  SPENDING,
  ENERGY,
  GROUP_SIZE,
  ALCOHOL,
];

/** Row label → chosen option. Rows with nothing chosen are absent. */
export type Preferences = Readonly<Record<string, string>>;

const EMPTY: Preferences = {};
let current: Preferences = EMPTY;
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

/** Replaces the saved preferences; empty choices are dropped. */
export function setPreferences(next: Record<string, string>) {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(next)) if (v) clean[k] = v;
  current = clean;
  emit();
}

/** Logout and tests: nothing chosen. */
export function resetPreferences() {
  current = EMPTY;
  emit();
}

export function getPreferences(): Preferences {
  return current;
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );
}
