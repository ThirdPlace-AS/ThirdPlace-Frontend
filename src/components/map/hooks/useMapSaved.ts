import { useCallback, useMemo, useSyncExternalStore } from "react";

// In-memory saved-items store. Persistence is CONTRACT-BLOCKED (CB-5): a
// reload clears this. Keyed by DiscoveryItem.markerId. Shared across all hook
// consumers (preview card toggle + Saved mode) via a tiny external store.

let ids: string[] = [];
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

export function useMapSaved() {
  const savedIds = useSyncExternalStore(
    subscribe,
    () => ids,
    () => ids,
  );

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds],
  );

  const toggle = useCallback((id: string) => {
    ids = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    emit();
  }, []);

  // One object per saved list, so callers that depend on it stay stable.
  return useMemo(
    () => ({ savedIds, isSaved, toggle }),
    [savedIds, isSaved, toggle],
  );
}
