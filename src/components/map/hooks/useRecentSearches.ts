import { useCallback } from "react";
import { createStore, useStore } from "zustand";

// In-memory recent searches. Persistence + private search history are
// CONTRACT-BLOCKED (CB-8) — this clears on reload and is never sent anywhere.
// Most-recent first, de-duplicated, capped.

const MAX = 6;
const store = createStore(() => ({ queries: [] as string[] }));
const selectQueries = (s: { queries: string[] }) => s.queries;

export function useRecentSearches() {
  const recent = useStore(store, selectQueries);

  const add = useCallback((raw: string) => {
    const q = raw.trim();
    if (q === "") return;
    const { queries } = store.getState();
    store.setState({
      queries: [q, ...queries.filter((x) => x !== q)].slice(0, MAX),
    });
  }, []);

  const remove = useCallback((q: string) => {
    store.setState({
      queries: store.getState().queries.filter((x) => x !== q),
    });
  }, []);

  const clear = useCallback(() => {
    store.setState({ queries: [] });
  }, []);

  return { recent, add, remove, clear };
}
