import { useCallback, useMemo } from "react";
import { createStore, useStore } from "zustand";

// In-memory saved-items store. Persistence is CONTRACT-BLOCKED (CB-5): a
// reload clears this. Keyed by DiscoveryItem.markerId. Shared across all hook
// consumers (preview card toggle + Saved mode) via a tiny external store.

const store = createStore(() => ({ ids: [] as string[] }));
const selectIds = (s: { ids: string[] }) => s.ids;

export function useMapSaved() {
  const savedIds = useStore(store, selectIds);

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds],
  );

  const toggle = useCallback((id: string) => {
    const { ids } = store.getState();
    store.setState({
      ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    });
  }, []);

  // One object per saved list, so callers that depend on it stay stable.
  return useMemo(
    () => ({ savedIds, isSaved, toggle }),
    [savedIds, isSaved, toggle],
  );
}
