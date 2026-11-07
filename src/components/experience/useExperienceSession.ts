import { useCallback, useSyncExternalStore } from "react";

// The time the viewer picked for each experience ("Velg tidspunkt"), shared by
// the Tilgjengelighet cards, the time sheet and the floating join card. In
// memory like the other demo stores (persistence is contract-blocked); null =
// the next session.
let chosen: Readonly<Record<string, string>> = {};
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

/** Test helper: forget every picked time. */
export function resetExperienceSessions() {
  chosen = {};
  emit();
}

export function useExperienceSession(expId: string) {
  const all = useSyncExternalStore(
    subscribe,
    () => chosen,
    () => chosen,
  );
  const set = useCallback(
    (sessionId: string) => {
      chosen = { ...chosen, [expId]: sessionId };
      emit();
    },
    [expId],
  );
  return [all[expId] ?? null, set] as const;
}
