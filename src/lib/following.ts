import { useSyncExternalStore } from "react";

// People the viewer follows this session (Oppdag folk list and the person
// page share it). In memory like the other demo stores: the social graph is
// contract-blocked (BLOCKED_CONTRACT_GAP), a reload clears it.
let following: ReadonlySet<string> = new Set();
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

export function toggleFollow(id: string) {
  const next = new Set(following);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  following = next;
  emit();
}

/** Test helper: follow nobody. */
export function resetFollowing() {
  following = new Set();
  emit();
}

export function useFollowing(): ReadonlySet<string> {
  return useSyncExternalStore(
    subscribe,
    () => following,
    () => following,
  );
}
