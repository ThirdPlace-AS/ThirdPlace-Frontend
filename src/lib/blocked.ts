import { createStore, useStore } from "zustand";

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

const store = createStore(() => ({ entries: SEED }));
const selectEntries = (s: { entries: readonly BlockedEntry[] }) => s.entries;

/** Blokker: adds the person (or blocks them again). */
export function blockPerson(key: string, name: string) {
  const { entries } = store.getState();
  const existing = entries.find((e) => e.key === key);
  const next = existing
    ? entries.map((e) => (e.key === key ? { ...e, blocked: true } : e))
    : [...entries, { key, name, detail: "Blokkert i dag", blocked: true }];
  store.setState({ entries: next });
}

/** Avblokkér / Angre on Blokkerte brukere: the row stays until you leave. */
export function setBlocked(key: string, blocked: boolean) {
  store.setState(({ entries }) => ({
    entries: entries.map((e) => (e.key === key ? { ...e, blocked } : e)),
  }));
}

/** Logout and tests: back to the fixture rows. */
export function resetBlocked() {
  store.setState({ entries: SEED });
}

export function useBlocked(): readonly BlockedEntry[] {
  return useStore(store, selectEntries);
}

export function blockedCount(list: readonly BlockedEntry[]): number {
  return list.filter((e) => e.blocked).length;
}
