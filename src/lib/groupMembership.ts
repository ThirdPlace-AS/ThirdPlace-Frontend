import { createStore, useStore } from "zustand";

import { groupById, groups } from "@/fixtures";

// Which groups the signed-in person is in (in memory, BLOCKED_CONTRACT_GAP: no
// membership contract). A group made in Legg til is the creator's own
// (`mine`); joining or leaving another one only flips this store. It used to
// be GroupContent's local state; Profil's «Kom i gang» (review PR-06, 0524)
// needs to know whether any group was joined, so it lives here now.

type State = { joined: ReadonlySet<string>; left: ReadonlySet<string> };
const store = createStore<State>(() => ({
  joined: new Set(),
  left: new Set(),
}));

function member(s: State, id: string): boolean {
  if (s.left.has(id)) return false;
  return s.joined.has(id) || groupById(id)?.mine === true;
}

export function joinGroup(id: string) {
  const { joined, left } = store.getState();
  const nextLeft = new Set(left);
  nextLeft.delete(id);
  store.setState({ joined: new Set([...joined, id]), left: nextLeft });
}

export function leaveGroup(id: string) {
  const { joined, left } = store.getState();
  const next = new Set(joined);
  next.delete(id);
  store.setState({ joined: next, left: new Set([...left, id]) });
}

export function useIsGroupMember(id: string): boolean {
  return useStore(store, (s) => member(s, id));
}

/** In at least one group (joined, or made in Legg til and not left). */
export function inAnyGroup(s: State = store.getState()): boolean {
  return groups.some((g) => member(s, g.id));
}

export function useInAnyGroup(): boolean {
  return useStore(store, inAnyGroup);
}

/** Test helper: back to no joins. */
export function resetGroupMembership() {
  store.setState({ joined: new Set(), left: new Set() });
}
