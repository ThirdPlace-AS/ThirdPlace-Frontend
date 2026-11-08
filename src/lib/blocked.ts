import { useSyncExternalStore } from "react";

// Who the viewer has blocked (Phase 15). Blokker on a person page or an
// experience's host adds them here, so Blokkerte brukere (PDF p21) and the
// count on Personvern show them. Seeded with the two fixture rows; in memory
// like the other demo stores. Hiding a blocked person's content across the app
// needs the block model and stays contract-blocked (BLOCKED_CONTRACT_GAP).
export type BlockedEntry = {
  key: string;
  name: string;
  /** "Upassende meldinger · Blokkert 10. juli", or "Blokkert i dag". */
  detail: string;
  blocked: boolean;
};

const SEED: readonly BlockedEntry[] = [
  {
    key: "anonym",
    name: "Anonym bruker",
    detail: "Upassende meldinger · Blokkert 10. juli",
    blocked: true,
  },
  {
    key: "spamkonto42",
    name: "SpamKonto42",
    detail: "Spam i gruppechat · Blokkert 28. juni",
    blocked: true,
  },
];

let entries: readonly BlockedEntry[] = SEED;
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

/** Blokker: adds the person (or blocks them again). */
export function blockPerson(key: string, name: string) {
  const existing = entries.find((e) => e.key === key);
  entries = existing
    ? entries.map((e) => (e.key === key ? { ...e, blocked: true } : e))
    : [...entries, { key, name, detail: "Blokkert i dag", blocked: true }];
  emit();
}

/** Avblokkér / Angre on Blokkerte brukere: the row stays until you leave. */
export function setBlocked(key: string, blocked: boolean) {
  entries = entries.map((e) => (e.key === key ? { ...e, blocked } : e));
  emit();
}

/** Logout and tests: back to the fixture rows. */
export function resetBlocked() {
  entries = SEED;
  emit();
}

export function useBlocked(): readonly BlockedEntry[] {
  return useSyncExternalStore(
    subscribe,
    () => entries,
    () => entries,
  );
}

export function blockedCount(list: readonly BlockedEntry[]): number {
  return list.filter((e) => e.blocked).length;
}
