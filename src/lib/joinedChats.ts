import { createStore, useStore } from "zustand";

import type { MockChat } from "@/fixtures";

// Chats the viewer joined this session (experience or place chats marked
// `member: false` in the fixtures) and chats they left (Forlat, Phase 15:
// a left chat leaves the list even when the fixtures make them a member). In
// memory, like the other demo stores: persistence is contract-blocked
// (BLOCKED_CONTRACT_GAP), a reload clears it.
type State = { joined: ReadonlySet<string>; left: ReadonlySet<string> };
const store = createStore<State>(() => ({
  joined: new Set(),
  left: new Set(),
}));
const selectJoined = (s: State) => s.joined;

export function joinChat(id: string) {
  const { joined, left } = store.getState();
  if (joined.has(id) && !left.has(id)) return;
  let nextLeft = left;
  if (left.has(id)) {
    const back = new Set(left);
    back.delete(id);
    nextLeft = back;
  }
  store.setState({ joined: new Set([...joined, id]), left: nextLeft });
}

export function leaveChat(id: string) {
  const { joined, left } = store.getState();
  const next = new Set(joined);
  next.delete(id);
  // A new set either way, so every list subscribed to the store re-reads.
  store.setState({ joined: next, left: new Set([...left, id]) });
}

/** Test helper: forget every joined and left chat. */
export function resetJoinedChats() {
  store.setState({ joined: new Set(), left: new Set() });
}

export function useJoinedChats(): ReadonlySet<string> {
  return useStore(store, selectJoined);
}

/** Whether the viewer is in this chat (fixture member or joined here, and
 *  not left since). */
export function isMember(
  chat: Pick<MockChat, "id" | "member">,
  set: ReadonlySet<string>,
) {
  if (store.getState().left.has(chat.id)) return false;
  return chat.member !== false || set.has(chat.id);
}
