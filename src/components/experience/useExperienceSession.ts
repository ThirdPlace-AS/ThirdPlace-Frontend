import { useCallback } from "react";
import { createStore, useStore } from "zustand";

// The time the viewer picked for each experience ("Velg tidspunkt"), shared by
// the Tilgjengelighet cards, the time sheet and the floating join card. In
// memory like the other demo stores (persistence is contract-blocked); null =
// the next session.
type State = { chosen: Readonly<Record<string, string>> };
const store = createStore((): State => ({ chosen: {} }));

/** Test helper: forget every picked time. */
export function resetExperienceSessions() {
  store.setState({ chosen: {} });
}

export function useExperienceSession(expId: string) {
  const chosen = useStore(store, (s) => s.chosen[expId]);
  const set = useCallback(
    (sessionId: string) => {
      store.setState({
        chosen: { ...store.getState().chosen, [expId]: sessionId },
      });
    },
    [expId],
  );
  return [chosen ?? null, set] as const;
}
