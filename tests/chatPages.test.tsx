// Phase 12 H4c: chat info, members, invite, archived chats and "Ny chat" are
// pages (were sheets). Links carry no arrows; the info page states no rule.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ArchivedChatsScreen from "@/features/chat/ArchivedChatsScreen";
import {
  ChatInfoScreen,
  ChatMembersScreen,
  membersOf,
} from "@/features/chat/ChatInfoScreens";
import NewChatScreen from "@/features/chat/NewChatScreen";
import { chatById, chats } from "@/fixtures";
import { isMember, resetJoinedChats } from "@/lib/joinedChats";

const mockPush = jest.fn();
const mockNavigate = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    navigate: (h: unknown) => mockNavigate(h),
    back: () => mockBack(),
    replace: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => ({ id: mockChatId }),
}));
let mockChatId = "c1";

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
  mockNavigate.mockClear();
  mockBack.mockClear();
  mockChatId = "c1";
  resetJoinedChats();
});

describe("chat pages", () => {
  const c1 = chatById("c1")!;

  it("info links to members and invite without arrows", () => {
    render(<ChatInfoScreen />, { wrapper });
    const all = `Se alle (${c1.members ?? membersOf(c1).length})`;
    fireEvent.press(screen.getByText(all));
    expect(mockPush).toHaveBeenCalledWith("/chat/c1/members");
    fireEvent.press(screen.getByRole("button", { name: "Inviter" }));
    expect(mockPush).toHaveBeenCalledWith("/chat/c1/invite");
    expect(screen.queryByText(/→/)).toBeNull();
    expect(screen.queryByText(/arkiveres/)).toBeNull();
  });

  it("leaving asks first, then leaves the chat and returns to the list", () => {
    render(<ChatInfoScreen />, { wrapper });
    fireEvent.press(screen.getByRole("button", { name: "Forlat" }));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Forlate chatten?")).toBeTruthy();
    const buttons = screen.getAllByRole("button", { name: "Forlat" });
    fireEvent.press(buttons[buttons.length - 1]!);
    expect(mockNavigate).toHaveBeenCalledWith("/chat");
    expect(isMember(c1, new Set())).toBe(false);
  });

  it("a direct message has no Inviter", () => {
    const dm = chats.find((c) => c.type === "dm");
    if (!dm) throw new Error("no direct message in the fixtures");
    mockChatId = dm.id;
    render(<ChatInfoScreen />, { wrapper });
    expect(screen.queryByRole("button", { name: "Inviter" })).toBeNull();
    expect(screen.getByRole("button", { name: "Forlat" })).toBeTruthy();
  });

  it("members filter by name", () => {
    render(<ChatMembersScreen />, { wrapper });
    const first = membersOf(c1)[0]!.person.name;
    expect(screen.getByText(first)).toBeTruthy();
    fireEvent.changeText(screen.getByPlaceholderText("Søk medlemmer …"), "zzz");
    expect(screen.queryByText(first)).toBeNull();
    expect(screen.getByText(/Ingen treff/)).toBeTruthy();
  });

  it("archived chats list every archived chat", () => {
    render(<ArchivedChatsScreen />, { wrapper });
    for (const c of chats.filter((x) => x.status === "archived")) {
      expect(screen.getByText(c.name)).toBeTruthy();
    }
  });

  it("Ny chat needs a name, then goes back", () => {
    render(<NewChatScreen />, { wrapper });
    fireEvent.press(screen.getByText("Opprett chat"));
    expect(mockBack).not.toHaveBeenCalled();
    fireEvent.changeText(
      screen.getByPlaceholderText("F.eks. «Løpegjengen på Løkka»"),
      "Løpegjengen",
    );
    fireEvent.press(screen.getByText("Opprett chat"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
