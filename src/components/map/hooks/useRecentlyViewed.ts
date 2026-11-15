import { useCallback } from "react";
import { createStore, useStore } from "zustand";

// "Nylig sett": places and experiences whose DETAIL was opened in this
// session, newest first, de-duplicated, capped (master spec §4 Account
// "history"). In-memory only, never sent anywhere; a reload clears it (CB-8,
// like useRecentSearches). Not a ranking signal and not wired to one.

export type ViewedKind = "place" | "experience";
export type ViewedItem = { kind: ViewedKind; id: string; title: string };

const MAX = 6;
type State = { items: readonly ViewedItem[] };
const store = createStore((): State => ({ items: [] }));
const selectItems = (s: State) => s.items;

/** Record that a detail opened (call from the detail surfaces only). */
export function markViewed(item: ViewedItem) {
  const { items } = store.getState();
  if (items[0]?.kind === item.kind && items[0]?.id === item.id) return;
  store.setState({
    items: [
      item,
      ...items.filter((x) => !(x.kind === item.kind && x.id === item.id)),
    ].slice(0, MAX),
  });
}

export function clearViewed() {
  store.setState({ items: [] });
}

export function useRecentlyViewed() {
  const viewed = useStore(store, selectItems);
  const clear = useCallback(() => clearViewed(), []);
  return { viewed, clear };
}
