import { useSyncExternalStore } from "react";

import { chats, type MockChat } from "@/fixtures";
import { isMember, useJoinedChats } from "@/lib/joinedChats";

// Chats the viewer has opened this session (Phase 16): opening a thread reads
// it, so its unread count and the Chat tab badge drop. In memory like the
// other demo stores; read state from a server is contract-blocked
// (BLOCKED_CONTRACT_GAP). Counts come from the fixture chats, never invented.
let read: ReadonlySet<string> = new Set();
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

export function markChatRead(id: string) {
  if (read.has(id)) return;
  read = new Set([...read, id]);
  emit();
}

/** Tests and logout. */
export function resetChatReads() {
  read = new Set();
  emit();
}

export function useChatReads(): ReadonlySet<string> {
  return useSyncExternalStore(
    subscribe,
    () => read,
    () => read,
  );
}

export function getChatReads(): ReadonlySet<string> {
  return read;
}

/** Unread messages left in a chat after this session's reads. */
export function unreadOf(chat: MockChat, readSet: ReadonlySet<string>): number {
  return readSet.has(chat.id) ? 0 : chat.unread;
}

/** Active chats the viewer is in that still have unread messages: the Chat
 *  tab's badge (WhatsApp / Instagram count chats, not messages). */
export function useUnreadChatCount(): number {
  const readSet = useChatReads();
  const joined = useJoinedChats();
  return chats.filter(
    (c) =>
      c.status === "active" && isMember(c, joined) && unreadOf(c, readSet) > 0,
  ).length;
}

/** Where "Nye meldinger" goes (Phase 18): the first of the last `unread`
 *  messages from others, or null when nothing was unread. */
export function firstUnreadId(
  messages: readonly { id: string; mine: boolean }[],
  unread: number,
): string | null {
  let left = unread;
  let at: string | null = null;
  for (let i = messages.length - 1; i >= 0 && left > 0; i--) {
    const m = messages[i];
    if (!m || m.mine) continue;
    at = m.id;
    left -= 1;
  }
  return at;
}
