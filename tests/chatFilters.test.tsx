// 0459 (user 2026-11-17): filter pills under the Chat search, a pill only for
// chat types you have, one flat list pinned-first, combined with the search.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ChatScreen from "../app/(tabs)/chat";
import { chats, type MockChat, type MockChatType } from "@/fixtures";
import {
  chatFilterPills,
  filterChats,
  matchesChatFilter,
} from "@/features/chat/chatFilters";
import { resetChatReads } from "@/lib/chatReads";
import { isMember } from "@/lib/joinedChats";
import { resetPinnedChats, togglePinnedChat } from "@/lib/pinnedChats";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    navigate: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  },
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

const chat = (id: string, type: MockChatType, unread = 0): MockChat => ({
  id,
  name: id,
  last: "",
  time: "",
  unread,
  type,
  access: "open",
  status: "active",
  initials: "X",
});
const unread = (c: MockChat) => c.unread;

afterEach(() => {
  act(() => {
    resetPinnedChats();
    resetChatReads();
  });
});

describe("chatFilters", () => {
  it("maps each pill to its chat types", () => {
    expect(matchesChatFilter(chat("a", "dm"), "people", unread)).toBe(true);
    expect(matchesChatFilter(chat("a", "group_swipe"), "groups", unread)).toBe(
      true,
    );
    expect(matchesChatFilter(chat("a", "user_created"), "groups", unread)).toBe(
      true,
    );
    expect(
      matchesChatFilter(chat("a", "experience"), "experiences", unread),
    ).toBe(true);
    expect(matchesChatFilter(chat("a", "business"), "places", unread)).toBe(
      true,
    );
    expect(matchesChatFilter(chat("a", "place"), "places", unread)).toBe(true);
    expect(matchesChatFilter(chat("a", "marketplace"), "market", unread)).toBe(
      true,
    );
    expect(matchesChatFilter(chat("a", "dm"), "places", unread)).toBe(false);
    expect(matchesChatFilter(chat("a", "dm", 2), "unread", unread)).toBe(true);
    expect(matchesChatFilter(chat("a", "dm", 0), "unread", unread)).toBe(false);
  });

  it("shows Alle plus only the pills your chats match, in order", () => {
    const pills = chatFilterPills(
      [chat("a", "dm"), chat("b", "place", 1)],
      unread,
    );
    expect(pills.map((p) => p.label)).toEqual([
      "Alle",
      "Ulest",
      "Personer",
      "Steder",
    ]);
  });

  it("puts pinned chats first, in pin order", () => {
    const list = [chat("a", "dm"), chat("b", "dm"), chat("c", "dm")];
    expect(
      filterChats(list, "people", unread, ["c", "b"]).map((c) => c.id),
    ).toEqual(["c", "b", "a"]);
  });
});

describe("Chat tab pills", () => {
  const mine = chats.filter(
    (c) => c.status === "active" && isMember(c, new Set()),
  );
  const dms = mine.filter((c) => c.type === "dm");

  it("filters to one flat list, and combines with the search", () => {
    render(<ChatScreen />, { wrapper });
    expect(screen.getByLabelText("Filter: Alle")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Filter: Personer"));
    for (const c of mine) {
      const rows = screen.queryAllByText(c.name);
      if (c.type === "dm") expect(rows.length).toBeGreaterThan(0);
      else expect(rows).toHaveLength(0);
    }
    expect(screen.queryByText("Aktive samtaler")).toBeNull();

    fireEvent.changeText(
      screen.getByLabelText("Søk i samtaler"),
      "zzz-ingen-treff",
    );
    expect(screen.getByText("Ingen treff")).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText("Søk i samtaler"), dms[0]!.name);
    expect(screen.getAllByText(dms[0]!.name).length).toBeGreaterThan(0);
  });

  it("hides pills with nothing behind them", () => {
    render(<ChatScreen />, { wrapper });
    const types = new Set(mine.map((c) => c.type));
    expect(!!screen.queryByLabelText("Filter: Marked")).toBe(
      types.has("marketplace"),
    );
    expect(!!screen.queryByLabelText("Filter: Personer")).toBe(types.has("dm"));
  });

  it("keeps a pinned chat first in a filtered list", () => {
    const places = mine.filter(
      (c) => c.type === "place" || c.type === "business",
    );
    expect(places.length).toBeGreaterThan(1);
    const last = places[places.length - 1]!;
    act(() => togglePinnedChat(last.id));
    render(<ChatScreen />, { wrapper });
    fireEvent.press(screen.getByLabelText("Filter: Steder"));
    const first = screen
      .getAllByRole("button")
      .find((b) =>
        places.some((d) =>
          String(b.props.accessibilityLabel ?? "").startsWith(`${d.name},`),
        ),
      )!;
    expect(
      String(first.props.accessibilityLabel).startsWith(`${last.name},`),
    ).toBe(true);
  });
});
