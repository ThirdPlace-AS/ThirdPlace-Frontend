// Phase 13 J4: Følgere / Følger and Venner (PDF p13). Profil's counts come
// from the follow lists, the pages list the same people, follows are shared.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ProfileScreen from "../app/(tabs)/profile";
import FollowersScreen from "@/features/profile/FollowersScreen";
import FriendsScreen from "@/features/profile/FriendsScreen";
import { profile } from "@/fixtures";
import { resetCreated } from "@/fixtures/created";
import {
  followerPeople,
  friendPeople,
  resetFollowing,
  toggleFollow,
  useFollowing,
  useProfileCounts,
} from "@/lib/following";

const mockPush = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => mockParams,
}));

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

beforeEach(() => {
  mockPush.mockClear();
  mockParams = {};
});
afterEach(() => {
  act(() => {
    resetFollowing();
    resetCreated();
  });
});

describe("follow lists", () => {
  it("counts equal the list lengths", () => {
    const c = renderHook(() => useProfileCounts());
    const f = renderHook(() => useFollowing());
    expect(c.result.current.followers).toBe(profile.followerIds.length);
    expect(c.result.current.following).toBe(profile.followingIds.length);
    expect(c.result.current.friends).toBe(
      friendPeople(f.result.current).length,
    );
    act(() => toggleFollow("u1")); // Maria follows you: now a friend
    expect(c.result.current.following).toBe(profile.followingIds.length + 1);
    expect(c.result.current.friends).toBe(
      friendPeople(f.result.current).length,
    );
    expect(friendPeople(f.result.current).map((p) => p.id)).toContain("u1");
  });

  it("Profil shows the counts and opens each list", () => {
    render(<ProfileScreen />, { wrapper });
    const followers = followerPeople().length;
    fireEvent.press(screen.getByLabelText(`${followers} følgere`));
    expect(mockPush).toHaveBeenLastCalledWith("/profile/followers");
    fireEvent.press(
      screen.getByLabelText(`Du følger ${profile.followingIds.length}`),
    );
    expect(mockPush).toHaveBeenLastCalledWith(
      "/profile/followers?tab=following",
    );
    const friends = friendPeople(new Set(profile.followingIds)).length;
    fireEvent.press(screen.getByLabelText(`${friends} venner`));
    expect(mockPush).toHaveBeenLastCalledWith("/profile/friends");
  });
});

describe("Følgere / Følger page", () => {
  it("tabs carry the list lengths; followers not followed get Følg tilbake", () => {
    render(<FollowersScreen />, { wrapper });
    expect(
      screen.getByText(`Følgere (${profile.followerIds.length})`),
    ).toBeTruthy();
    expect(
      screen.getByText(`Følger (${profile.followingIds.length})`),
    ).toBeTruthy();
    // Maria Movik (u1) follows you; you do not follow her back.
    fireEvent.press(screen.getByLabelText("Følg tilbake Maria Movik"));
    expect(
      screen.getByText(`Følger (${profile.followingIds.length + 1})`),
    ).toBeTruthy();
  });

  it("opens on Følger with ?tab=following and keeps an unfollowed row", () => {
    mockParams = { tab: "following" };
    render(<FollowersScreen />, { wrapper });
    // Sofie Lind (u4): followed, not a follower.
    fireEvent.press(screen.getByLabelText("Slutt å følge Sofie Lind"));
    expect(screen.getByLabelText("Følg Sofie Lind")).toBeTruthy();
  });

  it("a row opens the person's page", () => {
    render(<FollowersScreen />, { wrapper });
    fireEvent.press(screen.getByLabelText(/^Jonas Berg,/));
    expect(mockPush).toHaveBeenLastCalledWith("/people/u2");
  });
});

describe("Venner page", () => {
  it("counts mutual follows, searches, and DM opens a chat", () => {
    render(<FriendsScreen />, { wrapper });
    const friends = friendPeople(new Set(profile.followingIds));
    expect(
      screen.getByText(
        friends.length === 1
          ? "1 gjensidig følging"
          : `${friends.length} gjensidige følginger`,
      ),
    ).toBeTruthy();
    const first = friends[0]!;
    fireEvent.press(screen.getByLabelText(`Send melding til ${first.name}`));
    expect(String(mockPush.mock.calls.at(-1)?.[0])).toMatch(/^\/chat\//);
    fireEvent.changeText(screen.getByLabelText("Søk venner"), "zzz");
    expect(screen.getByText("Ingen treff")).toBeTruthy();
  });

  it("leaves out presence", () => {
    render(<FriendsScreen />, { wrapper });
    expect(screen.queryByText(/Sist aktiv/)).toBeNull();
  });
});
