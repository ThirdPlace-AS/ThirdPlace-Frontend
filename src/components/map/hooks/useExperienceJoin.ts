import { useCallback } from "react";
import { createStore, useStore } from "zustand";

// In-memory join state per experience. BLOCKED_CONTRACT_GAP: there is no
// attendance backend; a reload clears this. Shared so the detail sheet's
// pinned "Bli med" bar (PDF p6) and the detail content (count) agree.
export type JoinState = "none" | "joined" | "waitlisted";

type State = { states: Readonly<Record<string, JoinState>> };
const store = createStore((): State => ({ states: {} }));

/** Test helper: forget every local join. */
export function resetExperienceJoins() {
  store.setState({ states: {} });
}

export function useExperienceJoin(id: string, initial: JoinState) {
  // Only this experience's entry: a join elsewhere does not re-render it.
  const state = useStore(store, (s) => s.states[id]) ?? initial;
  const set = useCallback(
    (next: JoinState) => {
      store.setState({ states: { ...store.getState().states, [id]: next } });
    },
    [id],
  );
  return [state, set] as const;
}
