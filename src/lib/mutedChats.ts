import { createStore, useStore } from "zustand";

// Chats the viewer muted from Chat-info's Demp (0467: the button showed a
// toast but kept saying "Demp", so a second tap looked like nothing). In
// memory like the other demo stores: no mute contract exists
// (BLOCKED_CONTRACT_GAP), a reload clears it.
type State = { muted: ReadonlySet<string> };
const store = createStore<State>(() => ({ muted: new Set() }));

/** Mutes or unmutes a chat; returns whether it is muted afterwards. */
export function toggleMutedChat(id: string): boolean {
  const next = new Set(store.getState().muted);
  const muted = !next.delete(id);
  if (muted) next.add(id);
  store.setState({ muted: next });
  return muted;
}

export function useIsChatMuted(id: string): boolean {
  return useStore(store, (s) => s.muted.has(id));
}

/** Test helper: forget every muted chat. */
export function resetMutedChats() {
  store.setState({ muted: new Set() });
}
