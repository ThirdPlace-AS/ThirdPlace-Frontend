// Varsler's swipe actions and Filtrer (user 2026-11-27, 0561, Instagram's
// notifications): a row swipes left to «…» (Ikke interessert, Blokker) and
// Slett (asks first); Filtrer keeps chosen kinds of notice or only people you
// follow, with Tøm and Bruk. User 2026-11-27: «…» Fjern følger, Filtrer's
// Verifisert, and Merk alle lest inside Filtrer's sheet.
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
  notificationVerified,
} from "@/features/notifications/notificationFilters";
import { MOCK_NOTIFICATIONS, visibleNotifications } from "@/fixtures";
import {
  resetNotificationReads,
  useNotificationReads,
} from "@/hooks/useNotificationReads";
import { followerPeople, resetFollowing } from "@/lib/following";

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
      { types: new Set(["follow"]), onlyFollowing: false, onlyVerified: false },
      new Set(),
    );
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.every((n) => n.type === "follow")).toBe(true);
  });

  it("Personer du følger keeps notices from people you follow", () => {
    const someone = all.map(notificationPerson).find(Boolean)!;
    const kept = applyNotificationFilter(
      all,
      { types: new Set(), onlyFollowing: true, onlyVerified: false },
      new Set([someone.id]),
    );
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.every((n) => notificationPerson(n)?.id === someone.id)).toBe(
      true,
    );
  });

  it("Verifisert keeps verified people and verified businesses", () => {
    const kept = applyNotificationFilter(
      all,
      { types: new Set(), onlyFollowing: false, onlyVerified: true },
      new Set(),
    );
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.length).toBeLessThan(all.length);
    expect(kept.every(notificationVerified)).toBe(true);
    // A place actor counts through its verified business.
    expect(kept.some((n) => !notificationPerson(n))).toBe(true);
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

  it("«…» Fjern følger removes a follower; others get no such action", () => {
    const before = followerPeople().length;
    render(<NotificationsScreen />, { wrapper });
    // The newest notice is Jonas Berg's follow (a follower).
    fireEvent.press(screen.getAllByLabelText("Flere valg")[0]!);
    fireEvent.press(screen.getByRole("button", { name: "Fjern følger" }));
    expect(followerPeople().length).toBe(before - 1);
    fireEvent.press(screen.getAllByLabelText("Flere valg")[0]!);
    expect(screen.queryByRole("button", { name: "Fjern følger" })).toBeNull();
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

  it("Merk alle lest sits in the sheet, not the header", () => {
    render(<NotificationsScreen />, { wrapper });
    expect(screen.queryByText("Merk alle lest")).toBeNull();
    expect(screen.getAllByLabelText(/, ulest$/).length).toBeGreaterThan(0);
    fireEvent.press(screen.getByLabelText("Filtrer"));
    fireEvent.press(screen.getByRole("button", { name: "Merk alle lest" }));
    expect(screen.queryAllByLabelText(/, ulest$/)).toHaveLength(0);
    fireEvent.press(screen.getByLabelText("Filtrer"));
    expect(
      screen.getByRole("button", { name: "Merk alle lest" }).props
        .accessibilityState?.disabled,
    ).toBe(true);
  });
});
