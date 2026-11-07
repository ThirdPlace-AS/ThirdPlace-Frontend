import { useSyncExternalStore } from "react";

import type { MockChat } from "@/fixtures";

// Chats the viewer joined this session (experience or place chats marked
// `member: false` in the fixtures). In memory, like the other demo stores:
// persistence is contract-blocked (BLOCKED_CONTRACT_GAP), a reload clears it.
let joined: ReadonlySet<string> = new Set();
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

export function joinChat(id: string) {
  if (joined.has(id)) return;
  joined = new Set([...joined, id]);
  emit();
}

export function leaveChat(id: string) {
  if (!joined.has(id)) return;
  const next = new Set(joined);
  next.delete(id);
  joined = next;
  emit();
}

/** Test helper: forget every joined chat. */
export function resetJoinedChats() {
  joined = new Set();
  emit();
}

export function useJoinedChats(): ReadonlySet<string> {
  return useSyncExternalStore(
    subscribe,
    () => joined,
    () => joined,
  );
}

/** Whether the viewer is in this chat (fixture member or joined here). */
export function isMember(
  chat: Pick<MockChat, "id" | "member">,
  set: ReadonlySet<string>,
) {
  return chat.member !== false || set.has(chat.id);
}
