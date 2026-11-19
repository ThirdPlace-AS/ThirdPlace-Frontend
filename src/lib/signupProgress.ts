import { createStore, useStore } from "zustand";

import type { Href } from "expo-router";

// Where a new user is in sign-up (Phase 12 H5e, founder 2026-11-06: "Kom i
// gang" goes straight to onboarding; verification comes last). Two flags in
// memory: onboarding answered, account created (registered + verified, or a
// social sign-in). The order is free — from the welcome screen onboarding
// comes first, from "Registrer deg" the account does — and whichever step
// completes the pair starts the session. BLOCKED_CONTRACT_GAP: no auth
// backend; a reload starts over.
export type SignupProgress = { onboarded: boolean; accountCreated: boolean };

const START: SignupProgress = { onboarded: false, accountCreated: false };
// The e-mail typed earlier in onboarding (business branch), so "Lag kontoen
// din" does not ask for it twice (review 2026-11-18 #17). Memory only.
const store = createStore(() => ({ progress: START, email: "" }));
const selectProgress = (s: { progress: SignupProgress }) => s.progress;

function set(next: SignupProgress) {
  store.setState({ progress: next });
}

export function setSignupEmail(email: string) {
  store.setState({ email });
}

export function getSignupEmail(): string {
  return store.getState().email;
}

export function getSignupProgress(): SignupProgress {
  return store.getState().progress;
}

export function useSignupProgress(): SignupProgress {
  return useStore(store, selectProgress);
}

/** Onboarding answered; returns where to go next. */
export function markOnboarded(): Href {
  const progress = getSignupProgress();
  set({ ...progress, onboarded: true });
  return progress.accountCreated ? "/map" : "/register";
}

/** Account created (code verified or social sign-in); returns where next. */
export function markAccountCreated(): Href {
  const progress = getSignupProgress();
  set({ ...progress, accountCreated: true });
  return progress.onboarded ? "/map" : "/onboarding";
}

/** Both done: the next step starts the signed-in session. */
export const isSignedUp = (p: SignupProgress) =>
  p.onboarded && p.accountCreated;

/** Test helper / log out: start over. */
export function resetSignupProgress() {
  store.setState({ progress: START, email: "" });
}
