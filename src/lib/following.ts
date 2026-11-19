import { createStore, useStore } from "zustand";

import { people, profile, type MockPerson } from "@/fixtures";

// Who the viewer follows (Oppdag folk, the person page, Følgere / Følger and
// Venner share it). It starts from the fixture list `profile.followingIds`
// and keeps the follows made this session. In memory like the other demo
// stores: the social graph is contract-blocked (BLOCKED_CONTRACT_GAP), a
// reload restores the fixture list.
const seed = (): ReadonlySet<string> => new Set(profile.followingIds);

const store = createStore(() => ({ following: seed() }));
const selectFollowing = (s: { following: ReadonlySet<string> }) => s.following;

export function toggleFollow(id: string) {
  const next = new Set(store.getState().following);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  store.setState({ following: next });
}

/** Logout and tests: back to the fixture list. */
export function resetFollowing() {
  store.setState({ following: seed() });
}

export function useFollowing(): ReadonlySet<string> {
  return useStore(store, selectFollowing);
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
