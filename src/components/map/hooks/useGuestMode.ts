import { useCallback } from "react";
import { createStore, useStore } from "zustand";

// Demo guest-mode flag (in-memory, shared). There is NO real auth yet — account
// gating is CONTRACT-BLOCKED. Default is a signed-in demo user so the demo
// interactions work; flipping this (e.g. from Profile) lets you experience the
// honest guest restrictions (account-only actions prompt sign-in).

const store = createStore(() => ({ guest: false }));
const selectGuest = (s: { guest: boolean }) => s.guest;

export function useGuestMode() {
  const isGuest = useStore(store, selectGuest);
  const setGuest = useCallback((next: boolean) => {
    store.setState({ guest: next });
  }, []);
  const toggle = useCallback(() => {
    store.setState({ guest: !store.getState().guest });
  }, []);
  return { isGuest, setGuest, toggle };
}
