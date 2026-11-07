// Phase 13 J6: a notification opens what it names. Every fixture target
// resolves to an existing entity, and a tap marks the card read and opens it.
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
  experienceById,
  groupById,
  MOCK_NOTIFICATIONS,
  people,
  placeById,
  chatById,
} from "@/fixtures";
import { resetNotificationReads } from "@/hooks/useNotificationReads";
import { notificationHref } from "@/lib/entityRoutes";

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

beforeEach(() => {
  mockPush.mockClear();
});
afterEach(() => {
  act(() => resetNotificationReads());
});

describe("notification targets", () => {
  it("every target is an existing fixture", () => {
    for (const n of MOCK_NOTIFICATIONS) {
      const { kind, id } = n.target;
      const found =
        kind === "person"
          ? people.some((p) => p.id === id)
          : kind === "experience"
            ? !!experienceById(id)
            : kind === "group"
              ? !!groupById(id)
              : kind === "chat"
                ? !!chatById(id)
                : !!placeById(id); // place, reviews
      expect([n.id, found]).toEqual([n.id, true]);
    }
  });

  it("follows name the follower", () => {
    for (const n of MOCK_NOTIFICATIONS.filter((x) => x.type === "follow")) {
      const p = people.find((x) => x.id === n.target.id);
      expect(p?.name).toBe(n.actorName);
    }
  });

  it("routes each kind to its page", () => {
    expect(notificationHref({ kind: "person", id: "u2" })).toBe("/people/u2");
    expect(notificationHref({ kind: "experience", id: "e1" })).toBe(
      "/experience/e1",
    );
    expect(notificationHref({ kind: "group", id: "g2" })).toBe("/group/g2");
    expect(notificationHref({ kind: "reviews", id: "p1" })).toBe(
      "/place/p1/reviews",
    );
    expect(notificationHref({ kind: "chat", id: "c1" })).toBe("/chat/c1");
  });

  it("a tap marks the card read and opens it", () => {
    render(<NotificationsScreen />, { wrapper });
    const first = MOCK_NOTIFICATIONS[0]!;
    fireEvent.press(
      screen.getByLabelText(`${first.actorName} ${first.text}, ulest`),
    );
    expect(mockPush).toHaveBeenLastCalledWith(notificationHref(first.target));
    expect(
      screen.getByLabelText(`${first.actorName} ${first.text}`),
    ).toBeTruthy();
  });
});
