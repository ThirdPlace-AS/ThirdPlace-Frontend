import { useCallback, useSyncExternalStore } from "react";

// In-memory recent searches. Persistence + private search history are
// CONTRACT-BLOCKED (CB-8) — this clears on reload and is never sent anywhere.
// Most-recent first, de-duplicated, capped.

const MAX = 6;
let queries: string[] = [];
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

export function useRecentSearches() {
  const recent = useSyncExternalStore(
    subscribe,
    () => queries,
    () => queries,
  );

  const add = useCallback((raw: string) => {
    const q = raw.trim();
    if (q === "") return;
    queries = [q, ...queries.filter((x) => x !== q)].slice(0, MAX);
    emit();
  }, []);

  const remove = useCallback((q: string) => {
    queries = queries.filter((x) => x !== q);
    emit();
  }, []);

  const clear = useCallback(() => {
    queries = [];
    emit();
  }, []);

  return { recent, add, remove, clear };
}
