// Phone check 2026-11-26: after «Hei alle» in a chat, the Chat list kept the
// fixture's last line. A message you send this session is the row's preview,
// «Du: …», time «Nå» (the thread's own wording).
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ChatScreen from "../app/(tabs)/chat";
import { chatById } from "@/fixtures";
import {
  byLastSent,
  resetThreads,
  sendMessage,
  useThreads,
  withLastSent,
} from "@/lib/chatThreads";

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

const c1 = chatById("c1")!;

afterEach(() => {
  act(() => resetThreads());
});

describe("chat list after a send", () => {
  it("keeps a chat as it is until you write in it", () => {
    expect(withLastSent(c1, {})).toBe(c1);
  });

  it("shows your last message and «Nå» on the row", () => {
    render(<ChatScreen />, { wrapper });
    expect(screen.queryByText("Du: Hei alle")).toBeNull();

    act(() => sendMessage("c1", "Hei"));
    act(() => sendMessage("c1", "Hei alle"));

    expect(screen.getByText("Du: Hei alle")).toBeTruthy();
    expect(screen.queryByText("Du: Hei")).toBeNull();
    expect(screen.queryByText(c1.last)).toBeNull();
    expect(
      screen
        .getAllByRole("button")
        .some((b) =>
          String(b.props.accessibilityLabel ?? "").startsWith(
            `${c1.name}, Du: Hei alle, Nå`,
          ),
        ),
    ).toBe(true);
  });

  it("puts the chat you wrote in last on top", () => {
    // Phone sweep 2026-11-26: the row stayed where it was after a send.
    const rowNames = () =>
      screen
        .getAllByRole("button")
        .map((b) => String(b.props.accessibilityLabel ?? ""))
        .filter((l) => l.includes(", Du: "));
    render(<ChatScreen />, { wrapper });
    const c2 = chatById("c2")!;
    act(() => sendMessage("c2", "Første"));
    act(() => sendMessage("c1", "Andre"));
    let rows = rowNames();
    expect(rows[0]!.startsWith(`${c1.name}, Du: Andre`)).toBe(true);
    expect(rows[1]!.startsWith(`${c2.name}, Du: Første`)).toBe(true);
    act(() => sendMessage("c2", "Tredje"));
    rows = rowNames();
    expect(rows[0]!.startsWith(`${c2.name}, Du: Tredje`)).toBe(true);
  });

  it("keeps the order of chats you have not written in", () => {
    const list = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(byLastSent(list, {}).map((c) => c.id)).toEqual(["a", "b", "c"]);
    act(() => sendMessage("c", "Hei"));
    let threads = {} as ReturnType<typeof useThreads>;
    function Read() {
      threads = useThreads();
      return null;
    }
    render(<Read />);
    expect(byLastSent(list, threads).map((c) => c.id)).toEqual(["c", "a", "b"]);
  });
});
