import { createStore, useStore } from "zustand";

// One-time hints this phone has shown (Phase 16): a device setting, kept by
// deviceSettings.ts like Kartlag and Tilgjengelighet, so a hint the user has
// dismissed does not come back after a restart. Nothing about the account.
// Phase 18 adds the hidden gestures: long-press a message (reactions,
// "Svar") and long-press the Profil tab (account switch, PDF p27).
export type HintKey = "swipeGestures" | "chatLongPress" | "profileSwitch";
export type Hints = Record<HintKey, boolean>;
export const DEFAULT_HINTS: Hints = {
  swipeGestures: false,
  chatLongPress: false,
  profileSwitch: false,
};

const store = createStore(() => ({ hints: DEFAULT_HINTS }));
// At most one hint per app session (screen benchmark: tips that pile up get
// dismissed unread). Kept in memory only: a new session may show the next.
let sessionHint: string | null = null;

/** True when `key` may show now: not seen yet and no other hint has shown
 *  this session. Takes the session's slot for `key`. */
export function claimHint(key: HintKey): boolean {
  if (store.getState().hints[key]) return false;
  return claimSessionSlot(key);
}

/** The session's one slot for anything shown once (a hint, or "Nytt i
 *  ThirdPlace"): true if `id` has it or takes it now. */
export function claimSessionSlot(id: string): boolean {
  if (sessionHint !== null && sessionHint !== id) return false;
  sessionHint = id;
  return true;
}

/** Tests and the dev sandbox: a fresh session. */
export function resetHintSession() {
  sessionHint = null;
}

export function onHintsChange(l: () => void): () => void {
  return store.subscribe(() => l());
}

export function getHints(): Hints {
  return store.getState().hints;
}

export function markHintSeen(key: HintKey) {
  const { hints } = store.getState();
  if (hints[key]) return;
  store.setState({ hints: { ...hints, [key]: true } });
}

/** Device settings on start-up, tests and the dev sandbox. Only `true`
 *  counts as seen; anything else shows the hint again. */
export function restoreHints(saved: Partial<Hints> | undefined) {
  const next = { ...DEFAULT_HINTS };
  for (const key of Object.keys(DEFAULT_HINTS) as HintKey[]) {
    next[key] = saved?.[key] === true;
  }
  store.setState({ hints: next });
}

export function useHintSeen(key: HintKey): boolean {
  return useStore(store, (s) => s.hints[key]);
}
