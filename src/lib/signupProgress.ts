import { useSyncExternalStore } from "react";

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
let progress: SignupProgress = START;
const listeners = new Set<() => void>();

function set(next: SignupProgress) {
  progress = next;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getSignupProgress(): SignupProgress {
  return progress;
}

export function useSignupProgress(): SignupProgress {
  return useSyncExternalStore(
    subscribe,
    () => progress,
    () => progress,
  );
}

/** Onboarding answered; returns where to go next. */
export function markOnboarded(): Href {
  set({ ...progress, onboarded: true });
  return progress.accountCreated ? "/map" : "/register";
}

/** Account created (code verified or social sign-in); returns where next. */
export function markAccountCreated(): Href {
  set({ ...progress, accountCreated: true });
  return progress.onboarded ? "/map" : "/onboarding";
}

/** Both done: the next step starts the signed-in session. */
export const isSignedUp = (p: SignupProgress) =>
  p.onboarded && p.accountCreated;

/** Test helper / log out: start over. */
export function resetSignupProgress() {
  set(START);
}
