import { useSyncExternalStore } from "react";

// One-time hints this phone has shown (Phase 16): a device setting, kept by
// deviceSettings.ts like Kartlag and Tilgjengelighet, so a hint the user has
// dismissed does not come back after a restart. Nothing about the account.
export type HintKey = "swipeGestures";
export type Hints = Record<HintKey, boolean>;
export const DEFAULT_HINTS: Hints = { swipeGestures: false };

let hints: Hints = DEFAULT_HINTS;
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
