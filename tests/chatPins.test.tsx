// Phase 18 (screen benchmark, "Chat, groups, alerts"): pin chats to the top
// of the Chat tab from a long press, "Merk som lest", and a "Nye meldinger"
// line above the first unread message in a thread.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ChatScreen from "../app/(tabs)/chat";
import ChatThreadScreen from "../app/chat/[id]/index";
import { chatById, messagesForChat } from "@/fixtures";
import {
  firstUnreadId,
  markChatRead,
  resetChatReads,
  unreadOf,
  useChatReads,
} from "@/lib/chatReads";
import {
  resetPinnedChats,
  togglePinnedChat,
  usePinnedChats,
} from "@/lib/pinnedChats";
import { resetThreads } from "@/lib/chatThreads";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    navigate: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => ({ id: "c1" }),
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

const c1 = chatById("c1")!;
const rowOf = (name: string) =>
  screen
    .getAllByRole("button")
    .find((b) =>
      String(b.props.accessibilityLabel ?? "").startsWith(`${name},`),
    )!;

afterEach(() => {
  act(() => {
    resetPinnedChats();
    resetChatReads();
    resetThreads();
  });
});

describe("pinned chats", () => {
  it("the newest pin comes first; a second toggle unpins", () => {
    const { result } = renderHook(() => usePinnedChats());
    act(() => togglePinnedChat("c2"));
    act(() => togglePinnedChat("c3"));
    expect(result.current).toEqual(["c3", "c2"]);
    act(() => togglePinnedChat("c2"));
    expect(result.current).toEqual(["c3"]);
  });

  it("a long press pins a chat under Festet, once in the list", () => {
    render(<ChatScreen />, { wrapper });
    expect(screen.queryByText("Festet")).toBeNull();
    fireEvent(rowOf(c1.name), "longPress");
    fireEvent.press(screen.getByText("Fest øverst"));
    expect(screen.getByText("Festet")).toBeTruthy();
    expect(screen.getAllByText(c1.name)).toHaveLength(1);
    expect(rowOf(c1.name).props.accessibilityLabel).toMatch(/festet$/);
    // Screen readers reach the same menu through "Flere valg".
    fireEvent(rowOf(c1.name), "accessibilityAction", {
      nativeEvent: { actionName: "longpress" },
    });
    fireEvent.press(screen.getByText("Løsne"));
    expect(screen.queryByText("Festet")).toBeNull();
  });

  it("Merk som lest reads an unread chat from the list", () => {
    const reads = renderHook(() => useChatReads());
    render(<ChatScreen />, { wrapper });
    expect(unreadOf(c1, reads.result.current)).toBeGreaterThan(0);
    fireEvent(rowOf(c1.name), "longPress");
    fireEvent.press(screen.getByText("Merk som lest"));
    expect(unreadOf(c1, reads.result.current)).toBe(0);
    // A read chat offers no "Merk som lest".
    fireEvent(rowOf(c1.name), "longPress");
    expect(screen.queryByText("Merk som lest")).toBeNull();
  });
});

describe("Nye meldinger", () => {
  it("sits above the first of the unread messages from others", () => {
    const msgs = messagesForChat("c1");
    const others = msgs.filter((m) => !m.mine);
    expect(firstUnreadId(msgs, 2)).toBe(others[others.length - 2]?.id);
    expect(firstUnreadId(msgs, 0)).toBeNull();
    expect(firstUnreadId([{ id: "a", mine: true }], 3)).toBeNull();
  });

  it("shows in a thread opened with unread messages, not once it is read", () => {
    render(<ChatThreadScreen />, { wrapper });
    expect(screen.getByText("Nye meldinger")).toBeTruthy();
    screen.unmount();
    act(() => markChatRead("c1"));
    render(<ChatThreadScreen />, { wrapper });
    expect(screen.queryByText("Nye meldinger")).toBeNull();
  });
});
