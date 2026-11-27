// 0460 (Instagram benchmark 2, user 2026-11-17): Varsler rows carry the
// actor's photo, one sentence, and on the right either "Følg tilbake" or a
// thumbnail of what the notice names; pills show only types that have
// notices; "Du er helt oppdatert" shows once nothing is unread.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import NotificationsScreen from "@/features/notifications/NotificationsScreen";
import { notificationThumb } from "@/features/notifications/notificationFilters";
import { MOCK_NOTIFICATIONS } from "@/fixtures";
import { resetNotificationReads } from "@/hooks/useNotificationReads";
import { resetFollowing } from "@/lib/following";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  },
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
  act(() => {
    resetNotificationReads();
    resetFollowing();
  });
});
afterEach(() => {
  act(() => {
    resetNotificationReads();
    resetFollowing();
  });
});

describe("notificationThumb", () => {
  it("has a photo for an experience target and none for a person", () => {
    const exp = MOCK_NOTIFICATIONS.find((n) => n.target.kind === "experience");
    const person = MOCK_NOTIFICATIONS.find((n) => n.target.kind === "person");
    expect(exp && notificationThumb(exp)).toBeTruthy();
    expect(person && notificationThumb(person)).toBeUndefined();
  });
});

describe("Varsler rows (0460)", () => {
  it("shows a thumbnail for each experience notice", () => {
    render(<NotificationsScreen />, { wrapper });
    const expNotices = MOCK_NOTIFICATIONS.filter(
      (n) => n.target.kind === "experience",
    );
    expect(expNotices.length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("notification-thumb").length).toBe(
      MOCK_NOTIFICATIONS.filter((n) => notificationThumb(n)).length,
    );
  });

  it("puts Følg tilbake in the row of a single new follower", () => {
    render(<NotificationsScreen />, { wrapper });
    const follower = MOCK_NOTIFICATIONS.find((n) => n.id === "n1");
    if (!follower) throw new Error("fixture n1 missing");
    expect(
      screen.getByLabelText(`Følg tilbake ${follower.actorName}`),
    ).toBeTruthy();
  });

  it("has no filter pills (user 2026-11-26)", () => {
    render(<NotificationsScreen />, { wrapper });
    expect(screen.queryByLabelText("Filter: Alle")).toBeNull();
  });

  it("says Du er helt oppdatert only when nothing is unread", () => {
    render(<NotificationsScreen />, { wrapper });
    expect(screen.queryByText("Du er helt oppdatert")).toBeNull();
    fireEvent.press(screen.getByLabelText("Filtrer"));
    fireEvent.press(screen.getByText("Merk alle lest"));
    expect(screen.getByText("Du er helt oppdatert")).toBeTruthy();
  });
});
