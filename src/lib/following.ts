import { createStore, useStore } from "zustand";

import { people, profile, type MockPerson } from "@/fixtures";

// Who the viewer follows (Oppdag folk, the person page, Følgere / Følger and
// Venner share it). It starts from the fixture list `profile.followingIds`
// and keeps the follows made this session. In memory like the other demo
// stores: the social graph is contract-blocked (BLOCKED_CONTRACT_GAP), a
// reload restores the fixture list.
// Followers the viewer removed (Varsler's «…» Fjern følger, user 2026-11-27)
// drop out of `profile.followerIds` for the session.
type FollowState = {
  following: ReadonlySet<string>;
  removed: ReadonlySet<string>;
};
const seed = (): FollowState => ({
  following: new Set(profile.followingIds),
  removed: new Set(),
});

const store = createStore<FollowState>(() => seed());
const selectFollowing = (s: FollowState) => s.following;
const selectRemoved = (s: FollowState) => s.removed;

export function toggleFollow(id: string) {
  const next = new Set(store.getState().following);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  store.setState({ following: next });
}

/** Fjern følger: the person no longer follows the viewer. */
export function removeFollower(id: string) {
  const next = new Set(store.getState().removed);
  next.add(id);
  store.setState({ removed: next });
}

/** Logout and tests: back to the fixture list. */
export function resetFollowing() {
  store.setState(seed());
}

export function useFollowing(): ReadonlySet<string> {
  return useStore(store, selectFollowing);
}

/** Re-renders when a follower is removed. */
export function useRemovedFollowers(): ReadonlySet<string> {
  return useStore(store, selectRemoved);
}

/** Whether the person follows the viewer now. */
export function isFollower(id: string): boolean {
  return profile.followerIds.includes(id) && !store.getState().removed.has(id);
}

const inPeopleOrder = (ids: (id: string) => boolean): MockPerson[] =>
  people.filter((p) => ids(p.id));

/** People who follow the viewer (fixture list, less those removed). */
export function followerPeople(): MockPerson[] {
  return inPeopleOrder(isFollower);
}

/** People the viewer follows now. */
export function followedPeople(set: ReadonlySet<string>): MockPerson[] {
  return inPeopleOrder((id) => set.has(id));
}

/** Venner: following each other. */
export function friendPeople(set: ReadonlySet<string>): MockPerson[] {
  return inPeopleOrder((id) => set.has(id) && isFollower(id));
}

/** Profil's Følgere / Følger / Venner, counted from the lists. */
export function useProfileCounts(): {
  followers: number;
  following: number;
  friends: number;
} {
  const set = useFollowing();
  useRemovedFollowers();
  return {
    followers: followerPeople().length,
    following: followedPeople(set).length,
    friends: friendPeople(set).length,
  };
}
