import { useCallback, useSyncExternalStore } from "react";

// "Nylig sett" (DEMO): places and experiences whose DETAIL was opened in this
// session, newest first, de-duplicated, capped (master spec §4 Account
// "history"). In-memory only, never sent anywhere; a reload clears it (CB-8,
// like useRecentSearches). Not a ranking signal and not wired to one.

export type ViewedKind = "place" | "experience";
export type ViewedItem = { kind: ViewedKind; id: string; title: string };

const MAX = 6;
let items: readonly ViewedItem[] = [];
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

/** Record that a detail opened (call from the detail surfaces only). */
export function markViewed(item: ViewedItem) {
  if (items[0]?.kind === item.kind && items[0]?.id === item.id) return;
  items = [
    item,
    ...items.filter((x) => !(x.kind === item.kind && x.id === item.id)),
  ].slice(0, MAX);
  emit();
}

export function clearViewed() {
  items = [];
  emit();
}

export function useRecentlyViewed() {
  const viewed = useSyncExternalStore(
    subscribe,
    () => items,
    () => items,
  );
  const clear = useCallback(() => clearViewed(), []);
  return { viewed, clear };
}
