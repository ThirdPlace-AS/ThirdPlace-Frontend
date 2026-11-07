import { useSyncExternalStore } from "react";

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

let hints: Hints = DEFAULT_HINTS;
// At most one hint per app session (screen benchmark: tips that pile up get
// dismissed unread). Kept in memory only: a new session may show the next.
let sessionHint: string | null = null;

/** True when `key` may show now: not seen yet and no other hint has shown
 *  this session. Takes the session's slot for `key`. */
export function claimHint(key: HintKey): boolean {
  if (hints[key]) return false;
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
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function onHintsChange(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getHints(): Hints {
  return hints;
}

export function markHintSeen(key: HintKey) {
  if (hints[key]) return;
  hints = { ...hints, [key]: true };
  emit();
}

/** Device settings on start-up, tests and the dev sandbox. Only `true`
 *  counts as seen; anything else shows the hint again. */
export function restoreHints(saved: Partial<Hints> | undefined) {
  const next = { ...DEFAULT_HINTS };
  for (const key of Object.keys(DEFAULT_HINTS) as HintKey[]) {
    next[key] = saved?.[key] === true;
  }
  hints = next;
  emit();
}

export function useHintSeen(key: HintKey): boolean {
  return useSyncExternalStore(
    onHintsChange,
    () => hints[key],
    () => hints[key],
  );
}
