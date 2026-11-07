import { useSyncExternalStore } from "react";

// Chats the viewer has pinned to the top of the Chat tab (Phase 18, screen
// benchmark: WhatsApp's and Telegram's pinned chats). The newest pin comes
// first. In memory like the other demo stores and cleared on logout; no limit
// is set, since none is specified. BLOCKED_CONTRACT_GAP: no chat-list backend.
let pinned: readonly string[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function togglePinnedChat(id: string) {
  pinned = pinned.includes(id)
    ? pinned.filter((x) => x !== id)
    : [id, ...pinned];
  emit();
}

/** Logout and tests. */
export function resetPinnedChats() {
  pinned = [];
  emit();
}

export function usePinnedChats(): readonly string[] {
  return useSyncExternalStore(
    subscribe,
    () => pinned,
    () => pinned,
  );
}
