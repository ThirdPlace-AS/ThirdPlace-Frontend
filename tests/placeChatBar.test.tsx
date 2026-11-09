// The place sheet's pinned chat card (user 2026-11-09: "The details map sheet
// should also have a sticky action section but it should focus on the
// chat"): the place's chat with its last message, "Bli med i samtalen" (then
// "Åpne samtalen"), and the sign-in prompt for guests.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PlaceChatBar } from "@/components/map/content/PlaceChatBar";
import { PlaceContent } from "@/components/map/content/PlaceContent";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { chatForPlace, messagesForChat } from "@/fixtures";
import { resetJoinedChats } from "@/lib/joinedChats";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: jest.fn(),
    replace: jest.fn(),
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

// A catalogue city space: its chat is not joined to begin with.
const PLACE = "p-klatring-r";

afterEach(() => {
  resetJoinedChats();
  mockPush.mockClear();
});

describe("PlaceChatBar", () => {
  it("shows the place's chat and its last message", () => {
    const chat = chatForPlace(PLACE)!;
    const last = messagesForChat(chat.id).at(-1)!;
    render(<PlaceChatBar placeId={PLACE} />, { wrapper });
    expect(screen.getByText("Samtalen")).toBeTruthy();
    expect(screen.getByText(`${last.author}: ${last.text}`)).toBeTruthy();
  });

  it("joins the chat and opens it; then offers to open it", () => {
    const chat = chatForPlace(PLACE)!;
    render(<PlaceChatBar placeId={PLACE} />, { wrapper });
    fireEvent.press(screen.getByText("Bli med i samtalen"));
    expect(mockPush).toHaveBeenCalledWith(`/chat/${chat.id}`);
    expect(screen.getByText("Åpne samtalen")).toBeTruthy();
  });

  it("asks a guest to sign in before joining", () => {
    const g = renderHook(() => useGuestMode());
    act(() => g.result.current.setGuest(true));
    try {
      render(<PlaceChatBar placeId={PLACE} />, { wrapper });
      fireEvent.press(screen.getByText("Bli med i samtalen"));
      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByText("Bli med i samtalen")).toBeTruthy();
    } finally {
      act(() => g.result.current.setGuest(false));
    }
  });

  it("shows nothing for an unknown place", () => {
    // No wrapper: the safe-area provider would render on its own.
    const { toJSON } = render(<PlaceChatBar placeId="nope" />);
    expect(toJSON()).toBeNull();
  });

  it("the sheet's page body leaves out its own Samtalen section", () => {
    render(<PlaceContent id={PLACE} push={jest.fn()} />, { wrapper });
    expect(screen.queryByText("Samtalen")).toBeNull();
    expect(screen.queryByText("Bli med i samtalen")).toBeNull();
  });
});
