// Phone check 2026-11-26: after «Hei alle» in a chat, the Chat list kept the
// fixture's last line. A message you send this session is the row's preview,
// «Du: …», time «Nå» (the thread's own wording).
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ChatScreen from "../app/(tabs)/chat";
import { chatById } from "@/fixtures";
import { resetThreads, sendMessage, withLastSent } from "@/lib/chatThreads";

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
});
