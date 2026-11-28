// User 2026-11-26 (video of WhatsApp's chat list): a tap on a chat's picture
// shows it larger with the chat's actions, and the Chat tab has no
// collapsible Opplevelser / Steder groups: every chat is in one list.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ChatScreen from "../app/(tabs)/chat";
import { chatPicture } from "@/features/chat/ChatPeek";
import { chatById, chats } from "@/fixtures";
import { resetThreads } from "@/lib/chatThreads";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
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

afterEach(() => {
  act(() => resetThreads());
  mockPush.mockClear();
});

const rowOf = (name: string) =>
  screen
    .getAllByRole("button")
    .find((b) =>
      String(b.props.accessibilityLabel ?? "").startsWith(`${name},`),
    )!;

describe("one chat list", () => {
  it("has no Opplevelser / Steder groups; their chats are in the list", () => {
    render(<ChatScreen />, { wrapper });
    // Nothing folds open or shut (the groups were expand/collapse buttons;
    // the filter pills keep their names).
    expect(
      screen
        .getAllByRole("button")
        .filter((b) => b.props.accessibilityState?.expanded !== undefined),
    ).toHaveLength(0);
    // An experience chat with nothing unread shows without opening anything.
    const quiet = chats.find(
      (c) =>
        c.status === "active" &&
        c.member !== false &&
        c.type === "experience" &&
        c.unread === 0,
    );
    if (quiet) expect(rowOf(quiet.name)).toBeTruthy();
  });
});

describe("a chat's picture", () => {
  it("each kind of chat has its own picture", () => {
    const dm = chats.find((c) => c.personId);
    const exp = chats.find((c) => c.pinnedExperienceId);
    if (dm) expect(chatPicture(dm)).toBeDefined();
    if (exp) expect(chatPicture(exp)).toBeDefined();
  });

  it("a tap on the picture shows it with Åpne samtalen and Info", () => {
    const c2 = chatById("c2")!;
    render(<ChatScreen />, { wrapper });
    fireEvent(rowOf(c2.name), "accessibilityAction", {
      nativeEvent: { actionName: "picture" },
    });
    expect(screen.getByLabelText("Åpne samtalen")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Info"));
    expect(mockPush).toHaveBeenLastCalledWith(`/chat/${c2.id}/info`);
  });

  it("Åpne samtalen opens the chat; Lukk just closes", () => {
    const c2 = chatById("c2")!;
    render(<ChatScreen />, { wrapper });
    fireEvent(rowOf(c2.name), "accessibilityAction", {
      nativeEvent: { actionName: "picture" },
    });
    fireEvent.press(screen.getByLabelText("Lukk"));
    expect(mockPush).not.toHaveBeenCalled();
    fireEvent(rowOf(c2.name), "accessibilityAction", {
      nativeEvent: { actionName: "picture" },
    });
    fireEvent.press(screen.getByLabelText("Åpne samtalen"));
    expect(mockPush).toHaveBeenLastCalledWith(`/chat/${c2.id}`);
  });
});
