import { useCallback, useSyncExternalStore } from "react";

// Demo guest-mode flag (in-memory, shared). There is NO real auth yet — account
// gating is CONTRACT-BLOCKED. Default is a signed-in demo user so the demo
// interactions work; flipping this (e.g. from Profile) lets you experience the
// honest guest restrictions (account-only actions prompt sign-in).

let guest = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useGuestMode() {
  const isGuest = useSyncExternalStore(
    subscribe,
    () => guest,
    () => guest,
  );
  const setGuest = useCallback((next: boolean) => {
    guest = next;
    emit();
  }, []);
  const toggle = useCallback(() => {
    guest = !guest;
    emit();
  }, []);
  return { isGuest, setGuest, toggle };
}
