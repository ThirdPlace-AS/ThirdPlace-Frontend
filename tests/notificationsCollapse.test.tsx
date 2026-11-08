// Phase 18 (screen benchmark, "Chat, groups, alerts"): Varsler collapses
// same-kind notices in a time group and filters by Alle / Invitasjoner /
// Følgere.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import NotificationsScreen from "@/features/notifications/NotificationsScreen";
import {
  MOCK_NOTIFICATIONS,
  notificationGroup,
  type MockNotification,
} from "@/fixtures";
import {
  resetNotificationReads,
  useNotificationReads,
} from "@/hooks/useNotificationReads";
import { collapseNotifications, entryActor } from "@/lib/collapseNotifications";
import { resetFollowing } from "@/lib/following";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
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

const week = MOCK_NOTIFICATIONS.filter(
  (n) => notificationGroup(n.minutesAgo) === "Denne uka",
);
const follows = week.filter((n) => n.type === "follow");

beforeEach(() => {
  mockPush.mockClear();
});
afterEach(() => {
  act(() => {
    resetNotificationReads();
    resetFollowing();
  });
});

describe("collapsing", () => {
  it("collapses new followers, keeps other kinds apart", () => {
    const entries = collapseNotifications(week);
    const followEntry = entries.find((e) => e.items[0]?.type === "follow");
    expect(followEntry?.items.map((n) => n.id)).toEqual(
      follows.map((n) => n.id),
    );
    expect(entries).toHaveLength(week.length - follows.length + 1);
    expect(entryActor(followEntry!)).toBe(
      `${follows[0]?.actorName} og ${follows.length - 1} andre`,
    );
  });

  it("joins collapse per experience; one other reads «annen»", () => {
    const base = MOCK_NOTIFICATIONS.find((n) => n.type === "join")!;
    const twin: MockNotification = { ...base, id: "x", actorName: "Ola" };
    const other: MockNotification = {
      ...base,
      id: "y",
      target: { kind: "experience", id: "zzz" },
    };
    const entries = collapseNotifications([base, twin, other]);
    expect(entries.map((e) => e.items.length)).toEqual([2, 1]);
    expect(entryActor(entries[0]!)).toBe(`${base.actorName} og 1 annen`);
  });
});

describe("Varsler", () => {
  it("shows the collapsed card; a tap opens Følgere and reads all of them", () => {
    const reads = renderHook(() => useNotificationReads());
    render(<NotificationsScreen />, { wrapper });
    const actor = `${follows[0]?.actorName} og ${follows.length - 1} andre`;
    fireEvent.press(screen.getByText(actor));
    expect(mockPush).toHaveBeenCalledWith("/profile/followers");
    const read = reads.result.current.readIds;
    expect(follows.every((n) => read.has(n.id))).toBe(true);
  });

  it("filters by Invitasjoner and Følgere", () => {
    render(<NotificationsScreen />, { wrapper });
    const invite = MOCK_NOTIFICATIONS.find((n) => n.type === "invite")!;
    const join = MOCK_NOTIFICATIONS.find((n) => n.type === "join")!;
    fireEvent.press(screen.getByText("Invitasjoner"));
    expect(screen.getByText(invite.actorName)).toBeTruthy();
    expect(screen.queryByText(join.actorName)).toBeNull();
    fireEvent.press(screen.getByText("Følgere"));
    expect(screen.queryByText(invite.actorName)).toBeNull();
    expect(
      screen.getByText(
        `${follows[0]?.actorName} og ${follows.length - 1} andre`,
      ),
    ).toBeTruthy();
    fireEvent.press(screen.getByText("Alle"));
    expect(screen.getByText(join.actorName)).toBeTruthy();
  });
});
