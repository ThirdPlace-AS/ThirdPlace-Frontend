import { createStore, useStore } from "zustand";

import { reorderSubset } from "@/lib/reorder";

// Chats the viewer has pinned to the top of the Chat tab (Phase 18, screen
// benchmark: WhatsApp's and Telegram's pinned chats). The newest pin comes
// first. In memory like the other demo stores and cleared on logout; no limit
// is set, since none is specified. BLOCKED_CONTRACT_GAP: no chat-list backend.
const store = createStore(() => ({ pinned: [] as readonly string[] }));
const selectPinned = (s: { pinned: readonly string[] }) => s.pinned;

export function togglePinnedChat(id: string) {
  const { pinned } = store.getState();
  store.setState({
    pinned: pinned.includes(id)
      ? pinned.filter((x) => x !== id)
      : [id, ...pinned],
  });
}

/**
 * Drag to reorder (P9): `shownInNewOrder` is the Festet list as the viewer
 * left it; pins hidden by a search keep their places.
 */
export function setPinnedOrder(shownInNewOrder: readonly string[]) {
  const { pinned } = store.getState();
  store.setState({ pinned: reorderSubset(pinned, shownInNewOrder) });
}

/** Logout and tests. */
export function resetPinnedChats() {
  store.setState({ pinned: [] });
}

export function usePinnedChats(): readonly string[] {
  return useStore(store, selectPinned);
}
