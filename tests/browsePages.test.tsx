// Phase 12 H4c: Varsler, the map's search and "Skriv anmeldelse" are pages
// (were sheets / an overlay). Search hands its result back to the map.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import NotificationsScreen from "@/features/notifications/NotificationsScreen";
import WriteReviewScreen from "@/features/reviews/WriteReviewScreen";
import SearchScreen from "@/features/search/SearchScreen";
import { placeById, places } from "@/fixtures";
import { resetNotificationReads } from "@/hooks/useNotificationReads";

const mockPush = jest.fn();
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    navigate: (h: unknown) => mockNavigate(h),
    replace: (h: unknown) => mockReplace(h),
    back: () => mockBack(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => mockParams,
  // StatusBarStyle registers on focus; the test renders outside a navigator.
  useFocusEffect: () => {},
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
  mockPush.mockClear();
  mockNavigate.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
  mockParams = {};
});

describe("Varsler page", () => {
  it("marks everything read from the header", () => {
    render(<NotificationsScreen />, { wrapper });
    expect(screen.getAllByLabelText(/, ulest$/).length).toBeGreaterThan(0);
    fireEvent.press(screen.getByText("Merk alle lest"));
    expect(screen.queryAllByLabelText(/, ulest$/)).toHaveLength(0);
    act(() => resetNotificationReads());
  });
});

describe("search page", () => {
  it("a submit returns to the map with the query", () => {
    mockParams = { q: "" };
    render(<SearchScreen />, { wrapper });
    const field = screen.getByPlaceholderText(
      "Søk steder, opplevelser, grupper",
    );
    fireEvent.changeText(field, "kaffe");
    fireEvent(field, "submitEditing", { nativeEvent: { text: "kaffe" } });
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    const arg = mockNavigate.mock.calls[0]![0] as {
      pathname: string;
      params: { q: string };
    };
    expect(arg.pathname).toBe("/map");
    expect(arg.params.q).toBe("kaffe");
  });

  it("picking a place returns to the map with it in focus", () => {
    const p = places[0]!;
    mockParams = { q: p.name };
    render(<SearchScreen />, { wrapper });
    // No suggestion chips above the results (user 2026-11-11: "remove the
    // five options"): the name shows once, in its result row.
    const rows = screen.getAllByText(p.name);
    expect(rows).toHaveLength(1);
    fireEvent.press(rows[0]!);
    const arg = mockNavigate.mock.calls[0]![0] as {
      params: { focus: string };
    };
    expect(arg.params.focus).toBe(`place:${p.id}`);
  });

  it("back leaves the page", () => {
    render(<SearchScreen />, { wrapper });
    fireEvent.press(screen.getByLabelText("Tilbake"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});

describe("write a review page", () => {
  it("needs a star before it sends, then goes back", () => {
    const p = placeById("p1")!;
    mockParams = { kind: "place", id: "p1" };
    render(<WriteReviewScreen />, { wrapper });
    expect(screen.getByText(`Anmeld ${p.name}`)).toBeTruthy();
    fireEvent.press(screen.getByText("Send anmeldelse"));
    expect(mockBack).not.toHaveBeenCalled();
    fireEvent.press(screen.getByLabelText("4 stjerner"));
    fireEvent.press(screen.getByText("Send anmeldelse"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
