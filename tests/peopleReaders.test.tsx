// Phase 19 B2: screens that read the whole `people` list once the catalogue
// added its hosts (src/fixtures/catalog/people.ts). A chat's stand-in members
// start with its experience's host and people who like what it is about;
// group swipe offers your network (people you follow or who follow you), not
// every host in the catalogue.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { membersOf } from "@/features/chat/ChatInfoScreens";
import GroupSwipeScreen from "@/features/groupswipe/GroupSwipeScreen";
import {
  chatById,
  chatForExperience,
  experienceById,
  groupById,
  people,
  personById,
  profile,
} from "@/fixtures";
import { CATALOG_PEOPLE } from "@/fixtures/catalog/people";
import { resetFollowing, toggleFollow } from "@/lib/following";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
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

afterEach(() => {
  act(() => resetFollowing());
});

describe("chat members", () => {
  it("start with the experience's host as admin", () => {
    const exp = experienceById("e-badstue")!;
    const chat = chatForExperience(exp.id)!;
    const members = membersOf(chat);
    expect(members[0]!.person.id).toBe(exp.hostId);
    expect(members[0]!.role).toBe("Vert · Admin");
  });

  it("put people who like the chat's interest before the rest", () => {
    const group = groupById("g-badstue")!;
    const members = membersOf(chatById(group.chatId!)!);
    expect(members.length).toBe(Math.min(people.length, group.memberCount));
    // Henrik likes Badstue; the coffee host Maria does not and comes later.
    const at = (id: string) => members.findIndex((m) => m.person.id === id);
    expect(at("u10")).toBeLessThan(at("u1"));
    const likes = members.map((m) => m.person.interests.includes("Badstue"));
    const firstOther = likes.indexOf(false);
    expect(likes.slice(firstOther).every((l) => !l)).toBe(true);
  });
});

describe("group swipe invites", () => {
  it("offer your network, and a host once you follow them", () => {
    render(<GroupSwipeScreen />, { wrapper });
    const network = people.filter(
      (p) =>
        profile.followerIds.includes(p.id) ||
        profile.followingIds.includes(p.id),
    );
    for (const p of network)
      expect(screen.getByRole("checkbox", { name: p.name })).toBeTruthy();
    for (const h of CATALOG_PEOPLE)
      expect(screen.queryByRole("checkbox", { name: h.name })).toBeNull();
    act(() => toggleFollow("u10"));
    expect(
      screen.getByRole("checkbox", { name: personById("u10")!.name }),
    ).toBeTruthy();
    fireEvent.press(screen.getByRole("checkbox", { name: "Henrik Aasen" }));
    expect(
      screen.getByRole("checkbox", { name: "Henrik Aasen" }).props
        .accessibilityState,
    ).toMatchObject({ checked: true });
  });
});
