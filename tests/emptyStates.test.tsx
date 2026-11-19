// Phase 15: the Chat tab with no chats shows the PDF p26 empty state (not the
// search-miss text), and Varsler with no notifications says so.
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ChatScreen from "../app/(tabs)/chat";
import NotificationsScreen from "@/features/notifications/NotificationsScreen";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), navigate: jest.fn(), back: jest.fn() },
}));
jest.mock("@/fixtures", () => ({
  ...jest.requireActual<object>("@/fixtures"),
  chats: [],
}));
jest.mock("@/hooks/useNotificationReads", () => ({
  useNotificationReads: () => ({
    items: [],
    readIds: new Set(),
    unread: 0,
    markRead: () => {},
    markAllRead: () => {},
  }),
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

describe("empty states", () => {
  it("Chat with no chats: Her starter praten (PDF p26)", () => {
    render(<ChatScreen />, { wrapper });
    expect(screen.getByText("Her starter praten")).toBeTruthy();
    expect(screen.getByText("Finn en opplevelse")).toBeTruthy();
    expect(screen.queryByText(/matcher «/)).toBeNull();
  });

  it("Varsler with nothing in it", () => {
    render(<NotificationsScreen />, { wrapper });
    expect(screen.getByText("Ingen varsler ennå")).toBeTruthy();
  });
});
