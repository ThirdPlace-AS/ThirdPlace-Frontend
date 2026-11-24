import { createStore, useStore } from "zustand";

// Which linked account you act as (review 2026-11-18 G-Q8, founder: an
// in-memory switch). The switcher (PDF p27), Koblede kontoer (p20) and the
// business hub's "Bytt til" flip it; the switcher, Koblede kontoer, the hub
// and Profil name it. null = the personal Utforsker account. In memory like
// the other demo stores and reset on logout. BLOCKED_CONTRACT_GAP: no
// linked-account or session model, so switching changes no permissions,
// only which account the screens name.

const store = createStore(() => ({ businessId: null as string | null }));
const selectBusinessId = (s: { businessId: string | null }) => s.businessId;

/** The business you act as, or null for the personal account. */
export function useActiveBusinessId(): string | null {
  return useStore(store, selectBusinessId);
}

export function getActiveBusinessId(): string | null {
  return store.getState().businessId;
}

export function switchToBusiness(id: string) {
  store.setState({ businessId: id });
}

export function switchToPersonal() {
  store.setState({ businessId: null });
}

/** Logout and tests: back to the personal account. */
export function resetActiveAccount() {
  switchToPersonal();
}
