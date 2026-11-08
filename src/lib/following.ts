import { useSyncExternalStore } from "react";

import { people, profile, type MockPerson } from "@/fixtures";

// Who the viewer follows (Oppdag folk, the person page, Følgere / Følger and
// Venner share it). It starts from the fixture list `profile.followingIds`
// and keeps the follows made this session. In memory like the other demo
// stores: the social graph is contract-blocked (BLOCKED_CONTRACT_GAP), a
// reload restores the fixture list.
const seed = (): ReadonlySet<string> => new Set(profile.followingIds);

let following: ReadonlySet<string> = seed();
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

/** Logout and tests: back to the fixture list. */
export function resetFollowing() {
  following = seed();
  emit();
}

export function useFollowing(): ReadonlySet<string> {
  return useSyncExternalStore(
    subscribe,
    () => following,
    () => following,
  );
}

const inPeopleOrder = (ids: (id: string) => boolean): MockPerson[] =>
  people.filter((p) => ids(p.id));

/** People who follow the viewer (fixture list). */
export function followerPeople(): MockPerson[] {
  return inPeopleOrder((id) => profile.followerIds.includes(id));
}

/** People the viewer follows now. */
export function followedPeople(set: ReadonlySet<string>): MockPerson[] {
  return inPeopleOrder((id) => set.has(id));
}

/** Venner: following each other. */
export function friendPeople(set: ReadonlySet<string>): MockPerson[] {
  return inPeopleOrder((id) => set.has(id) && profile.followerIds.includes(id));
}

/** Profil's Følgere / Følger / Venner, counted from the lists. */
export function useProfileCounts(): {
  followers: number;
  following: number;
  friends: number;
} {
  const set = useFollowing();
  return {
    followers: followerPeople().length,
    following: followedPeople(set).length,
    friends: friendPeople(set).length,
  };
}
