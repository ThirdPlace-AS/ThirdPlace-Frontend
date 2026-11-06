import { useCallback, useSyncExternalStore } from "react";

// In-memory join state per experience (DEMO). BLOCKED_CONTRACT_GAP: there is
// no attendance backend; a reload clears this. Shared so the detail sheet's
// pinned "Bli med" bar (PDF p6) and the detail content (count, DemoNote) agree.
export type JoinState = "none" | "joined" | "waitlisted";

let states: Readonly<Record<string, JoinState>> = {};
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Test helper: forget every local join. */
export function resetExperienceJoins() {
  states = {};
  emit();
}

export function useExperienceJoin(id: string, initial: JoinState) {
  const all = useSyncExternalStore(
    subscribe,
    () => states,
    () => states,
  );
  const state = all[id] ?? initial;
  const set = useCallback(
    (next: JoinState) => {
      states = { ...states, [id]: next };
      emit();
    },
    [id],
  );
  return [state, set] as const;
}
