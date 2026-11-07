import { useSyncExternalStore } from "react";

import { profile } from "@/fixtures";
import type { LibraryKey } from "@/fixtures/images";

// The signed-in user's own profile (PDF p12–p13): onboarding fills it,
// Rediger profil edits it, and Profil, Kontoinformasjon, the account switcher
// and the business hub show it. In memory like the other demo stores: a
// reload or logout brings back the fixture profile. BLOCKED_CONTRACT_GAP: no
// profile backend and no media upload, so a photo is the bundled portrait.

export type MyProfile = {
  name: string;
  age: number;
  bio: string;
  languages: string;
  interests: readonly string[];
  /** Bundled portrait, or null for the initials avatar. */
  avatar: LibraryKey | null;
};

/** The one portrait the app can set as "your" photo (no upload contract). */
export const OWN_PORTRAIT: LibraryKey = profile.avatar;

const SEED: MyProfile = {
  name: profile.name,
  age: profile.age,
  bio: profile.bio,
  languages: "Norsk, Engelsk",
  interests: profile.interests,
  avatar: profile.avatar,
};

let current: MyProfile = SEED;
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

export function updateMyProfile(patch: Partial<MyProfile>) {
  current = { ...current, ...patch };
  emit();
}

/** Logout and tests: back to the fixture profile. */
export function resetMyProfile() {
  current = SEED;
  emit();
}

export type MyProfileDraft = Omit<MyProfile, "age">;

/** Rediger profil: does the draft differ from what is saved? Interests
 *  compare by content, so ticking one off and on again is no change. */
export function profileDraftChanged(
  saved: MyProfile,
  draft: MyProfileDraft,
): boolean {
  const same = (a: readonly string[], b: readonly string[]) =>
    a.length === b.length && a.every((x) => b.includes(x));
  return (
    saved.name !== draft.name ||
    saved.bio !== draft.bio ||
    saved.languages !== draft.languages ||
    saved.avatar !== draft.avatar ||
    !same(saved.interests, draft.interests)
  );
}

export function getMyProfile(): MyProfile {
  return current;
}

export function useMyProfile(): MyProfile {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );
}
