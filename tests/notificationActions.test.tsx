// Varsler's swipe actions and Filtrer (user 2026-11-27, 0561, Instagram's
// notifications): a row swipes left to «…» (Ikke interessert, Blokker) and
// Slett (asks first); Filtrer keeps chosen kinds of notice or only people you
// follow, with Tøm and Bruk.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
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
  NO_NOTIFICATION_FILTER,
  applyNotificationFilter,
  notificationPerson,
} from "@/features/notifications/notificationFilters";
import { MOCK_NOTIFICATIONS, visibleNotifications } from "@/fixtures";
import {
  resetNotificationReads,
  useNotificationReads,
} from "@/hooks/useNotificationReads";
import { resetFollowing } from "@/lib/following";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    dismissTo: jest.fn(),
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

afterEach(() => {
  jest.useRealTimers();
  act(() => {
    resetNotificationReads();
    resetFollowing();
  });
});

const all = visibleNotifications(MOCK_NOTIFICATIONS);

describe("applyNotificationFilter", () => {
  it("no filter keeps every notice", () => {
    expect(
      applyNotificationFilter(all, NO_NOTIFICATION_FILTER, new Set()),
    ).toEqual(all);
  });

  it("keeps only the picked kinds", () => {
    const kept = applyNotificationFilter(
      all,
      { types: new Set(["follow"]), onlyFollowing: false },
      new Set(),
    );
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.every((n) => n.type === "follow")).toBe(true);
  });

  it("Personer du følger keeps notices from people you follow", () => {
    const someone = all.map(notificationPerson).find(Boolean)!;
    const kept = applyNotificationFilter(
      all,
      { types: new Set(), onlyFollowing: true },
      new Set([someone.id]),
    );
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.every((n) => notificationPerson(n)?.id === someone.id)).toBe(
      true,
    );
  });
});

describe("Varsler swipe actions", () => {
  it("Slett asks first, then removes the notice", () => {
    const reads = renderHook(() => useNotificationReads());
    const before = reads.result.current.items.length;
    render(<NotificationsScreen />, { wrapper });
    fireEvent.press(screen.getAllByLabelText("Slett")[0]!);
    expect(screen.getByText("Vil du slette dette varselet?")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Avbryt" }));
    reads.rerender({});
    expect(reads.result.current.items.length).toBe(before);
    fireEvent.press(screen.getAllByLabelText("Slett")[0]!);
    // The sheet's confirm, after every row's swipe action.
    fireEvent.press(screen.getAllByRole("button", { name: "Slett" }).at(-1)!);
    reads.rerender({});
    expect(reads.result.current.items.length).toBeLessThan(before);
  });

  it("«…» hides a notice with Ikke interessert", () => {
    const reads = renderHook(() => useNotificationReads());
    const before = reads.result.current.items.length;
    render(<NotificationsScreen />, { wrapper });
    fireEvent.press(screen.getAllByLabelText("Flere valg")[0]!);
    fireEvent.press(screen.getByRole("button", { name: "Ikke interessert" }));
    reads.rerender({});
    expect(reads.result.current.items.length).toBeLessThan(before);
  });
});

describe("Filtrer", () => {
  it("Bruk keeps the picked kind, Tøm clears the picks", () => {
    render(<NotificationsScreen />, { wrapper });
    fireEvent.press(screen.getByLabelText("Filtrer"));
    fireEvent.press(screen.getByRole("checkbox", { name: "Følgere" }));
    fireEvent.press(screen.getByRole("button", { name: "Bruk" }));
    expect(screen.getByLabelText("Filtrer, filter på")).toBeTruthy();
    // Only follow notices remain: no message or join text from the others.
    const others = all.filter((n) => n.type !== "follow");
    for (const n of others) {
      expect(screen.queryByText(n.text, { exact: false })).toBeNull();
    }
    fireEvent.press(screen.getByLabelText("Filtrer, filter på"));
    fireEvent.press(screen.getByRole("button", { name: "Tøm" }));
    fireEvent.press(screen.getByRole("button", { name: "Bruk" }));
    expect(screen.getByLabelText("Filtrer")).toBeTruthy();
  });
});
