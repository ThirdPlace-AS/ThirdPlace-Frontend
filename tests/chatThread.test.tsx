// Phase 16 (section benchmark): a chat thread takes reactions and replies, and
// opening it reads it so the Chat tab badge drops.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { Gesture } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ChatThreadScreen from "../app/chat/[id]/index";
import { messagesForChat } from "@/fixtures";
import {
  markChatRead,
  resetChatReads,
  useUnreadChatCount,
} from "@/lib/chatReads";
import {
  resetThreads,
  sendMessage,
  toggleReaction,
  useThread,
} from "@/lib/chatThreads";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn(), canGoBack: () => true },
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

beforeEach(() => {
  resetThreads();
  resetChatReads();
});

describe("thread store", () => {
  it("keeps sent messages with their quote, and one reaction per message", () => {
    const { result } = renderHook(() => useThread("c1"));
    act(() => sendMessage("c1", "Hei!", { author: "Sofie", text: "Hei alle" }));
    expect(result.current.sent).toHaveLength(1);
    expect(result.current.sent[0]?.replyTo?.author).toBe("Sofie");
    act(() => toggleReaction("c1", "m1", "❤️"));
    expect(result.current.reactions.m1).toBe("❤️");
    act(() => toggleReaction("c1", "m1", "❤️"));
    expect(result.current.reactions.m1).toBeUndefined();
  });

  it("the Chat tab count drops when a chat is opened", () => {
    const { result } = renderHook(() => useUnreadChatCount());
    const before = result.current;
    expect(before).toBeGreaterThan(0);
    act(() => markChatRead("c1"));
    expect(result.current).toBe(before - 1);
  });
});

describe("thread screen", () => {
  it("long press opens reactions; a reaction shows under the message", async () => {
    render(<ChatThreadScreen />, { wrapper });
    await act(async () => {});
    const first = messagesForChat("c1")[0];
    if (!first) throw new Error("no fixture messages");
    fireEvent(
      screen.getByLabelText(`${first.author}: ${first.text}, ${first.time}`),
      "longPress",
    );
    fireEvent.press(screen.getByLabelText("Reager med 👍"));
    expect(screen.getByLabelText("Fjern reaksjonen 👍")).toBeTruthy();
  });

  it("Svar quotes the message in the composer and in the sent message", async () => {
    render(<ChatThreadScreen />, { wrapper });
    await act(async () => {});
    const first = messagesForChat("c1")[0];
    if (!first) throw new Error("no fixture messages");
    fireEvent(
      screen.getByLabelText(`${first.author}: ${first.text}, ${first.time}`),
      "longPress",
    );
    fireEvent.press(screen.getByLabelText("Svar"));
    expect(screen.getByText(`Svarer ${first.author}`)).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText("Melding"), "Gleder meg!");
    fireEvent.press(screen.getByLabelText("Send"));
    expect(screen.queryByText(`Svarer ${first.author}`)).toBeNull();
    expect(screen.getByText("Gleder meg!")).toBeTruthy();
  });

  // Speed pass (0352): typing used to re-render the whole thread, every bubble
  // and its swipe-to-reply gesture, per keystroke. The composer keeps its own
  // draft and the bubbles are memoised.
  it("typing re-renders no message", async () => {
    const pan = jest.spyOn(Gesture, "Pan");
    try {
      render(<ChatThreadScreen />, { wrapper });
      await act(async () => {});
      const built = pan.mock.calls.length;
      expect(built).toBeGreaterThan(0);
      const input = screen.getByLabelText("Melding");
      for (const text of ["H", "He", "Hei", "Hei!"])
        fireEvent.changeText(input, text);
      expect(pan.mock.calls.length).toBe(built);
      fireEvent.press(screen.getByLabelText("Send"));
      expect(screen.getByText("Hei!")).toBeTruthy();
    } finally {
      pan.mockRestore();
    }
  });
});
