import { useSyncExternalStore } from "react";

import type { MockChat } from "@/fixtures";

// Chats the viewer joined this session (experience or place chats marked
// `member: false` in the fixtures) and chats they left (Forlat, Phase 15:
// a left chat leaves the list even when the fixtures make them a member). In
// memory, like the other demo stores: persistence is contract-blocked
// (BLOCKED_CONTRACT_GAP), a reload clears it.
let joined: ReadonlySet<string> = new Set();
let left: ReadonlySet<string> = new Set();
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
  if (joined.has(id) && !left.has(id)) return;
  joined = new Set([...joined, id]);
  if (left.has(id)) {
    const back = new Set(left);
    back.delete(id);
    left = back;
  }
  emit();
}

export function leaveChat(id: string) {
  const next = new Set(joined);
  next.delete(id);
  // A new set either way, so every list subscribed to the store re-reads.
  joined = next;
  left = new Set([...left, id]);
  emit();
}

/** Test helper: forget every joined and left chat. */
export function resetJoinedChats() {
  joined = new Set();
  left = new Set();
  emit();
}

export function useJoinedChats(): ReadonlySet<string> {
  return useSyncExternalStore(
    subscribe,
    () => joined,
    () => joined,
  );
}

/** Whether the viewer is in this chat (fixture member or joined here, and
 *  not left since). */
export function isMember(
  chat: Pick<MockChat, "id" | "member">,
  set: ReadonlySet<string>,
) {
  if (left.has(chat.id)) return false;
  return chat.member !== false || set.has(chat.id);
}
