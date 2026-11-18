// 0467: Demp on Chat-info toggles and says what a tap does next; leaving a
// group asks first, as leaving a chat does.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { GroupContent } from "@/components/map/content/GroupContent";
import { ChatInfoScreen } from "@/features/chat/ChatInfoScreens";
import { groupById } from "@/fixtures";
import { resetMutedChats } from "@/lib/mutedChats";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    navigate: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
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

beforeEach(() => {
  act(() => resetMutedChats());
});

describe("Chat-info Demp", () => {
  it("toggles between Demp and Opphev demping", () => {
    render(<ChatInfoScreen />, { wrapper });
    fireEvent.press(screen.getByRole("button", { name: "Demp" }));
    expect(screen.queryByRole("button", { name: "Demp" })).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Opphev demping" }));
    expect(screen.getByRole("button", { name: "Demp" })).toBeTruthy();
  });
});

describe("Forlat gruppen", () => {
  it("asks before leaving, and Bli værende keeps you in", () => {
    render(<GroupContent id="g1" />, { wrapper });
    fireEvent.press(screen.getByText("Bli medlem"));
    fireEvent.press(screen.getByText("Forlat gruppen"));
    // The confirm names the group (review 2026-11-18 CMP-09).
    expect(screen.getByText(`Forlate ${groupById("g1")!.name}?`)).toBeTruthy();
    fireEvent.press(screen.getByText("Bli værende"));
    expect(screen.getByText("Forlat gruppen")).toBeTruthy();

    fireEvent.press(screen.getByText("Forlat gruppen"));
    fireEvent.press(screen.getByText("Forlat"));
    expect(screen.getByText("Bli medlem")).toBeTruthy();
  });
});
