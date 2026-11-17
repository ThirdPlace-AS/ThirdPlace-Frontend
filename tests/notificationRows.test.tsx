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
import {
  filterNotifications,
  notificationPills,
  notificationThumb,
} from "@/features/notifications/notificationFilters";
import { MOCK_NOTIFICATIONS, type MockNotification } from "@/fixtures";
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

const notice = (over: Partial<MockNotification>): MockNotification => ({
  id: "x",
  type: "follow",
  actorName: "Jonas Berg",
  actorInitials: "JB",
  text: "begynte å følge deg.",
  minutesAgo: 5,
  read: false,
  target: { kind: "person", id: "u2" },
  ...over,
});

describe("notificationPills", () => {
  it("shows Alle, then only the types that have notices, in order", () => {
    const pills = notificationPills([
      notice({
        id: "a",
        type: "review",
        target: { kind: "reviews", id: "p1" },
      }),
      notice({ id: "b", type: "follow" }),
    ]);
    expect(pills.map((p) => p.label)).toEqual([
      "Alle",
      "Følgere",
      "Anmeldelser",
    ]);
  });

  it("filters to one type, Alle keeps everything", () => {
    const all = MOCK_NOTIFICATIONS;
    expect(filterNotifications(all, "all")).toHaveLength(all.length);
    expect(
      filterNotifications(all, "invite").every((n) => n.type === "invite"),
    ).toBe(true);
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

  it("offers a pill only for types with notices", () => {
    render(<NotificationsScreen />, { wrapper });
    const types = new Set(MOCK_NOTIFICATIONS.map((n) => n.type));
    expect(screen.getByLabelText("Filter: Alle")).toBeTruthy();
    expect(!!screen.queryByLabelText("Filter: Meldinger")).toBe(
      types.has("message"),
    );
    fireEvent.press(screen.getByLabelText("Filter: Invitasjoner"));
    const invite = MOCK_NOTIFICATIONS.find((n) => n.type === "invite");
    const join = MOCK_NOTIFICATIONS.find((n) => n.type === "join");
    if (!invite || !join) throw new Error("fixtures missing");
    expect(screen.getByText(invite.actorName)).toBeTruthy();
    expect(screen.queryByText(join.actorName)).toBeNull();
  });

  it("says Du er helt oppdatert only when nothing is unread", () => {
    render(<NotificationsScreen />, { wrapper });
    expect(screen.queryByText("Du er helt oppdatert")).toBeNull();
    fireEvent.press(screen.getByText("Merk alle lest"));
    expect(screen.getByText("Du er helt oppdatert")).toBeTruthy();
  });
});
