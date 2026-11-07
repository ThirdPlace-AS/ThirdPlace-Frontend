// Phase 16 (section benchmark): Varsler sits under "I dag" / "Denne uka" /
// "Tidligere", and a new follower can be followed back on the card itself.
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

import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import NotificationsScreen from "@/features/notifications/NotificationsScreen";
import { MOCK_NOTIFICATIONS, notificationGroup } from "@/fixtures";
import { resetNotificationReads } from "@/hooks/useNotificationReads";
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

beforeEach(() => {
  mockPush.mockClear();
});
afterEach(() => {
  act(() => {
    resetNotificationReads();
    resetFollowing();
  });
});

describe("Varsler groups", () => {
  it("shows the time groups in order, each with its own cards", () => {
    render(<NotificationsScreen />, { wrapper });
    const headers = screen.getAllByRole("header").map((h) => {
      const c = h.props.children;
      return Array.isArray(c) ? c.join("") : String(c);
    });
    const groups = ["I dag", "Denne uka", "Tidligere"].filter((g) =>
      MOCK_NOTIFICATIONS.some((n) => notificationGroup(n.minutesAgo) === g),
    );
    expect(headers.filter((h) => groups.includes(h))).toEqual(groups);
  });
});

describe("Følg tilbake", () => {
  const follower = MOCK_NOTIFICATIONS.find((n) => n.type === "follow")!;

  it("follows back on the card without opening the profile", () => {
    render(<NotificationsScreen />, { wrapper });
    fireEvent.press(
      screen.getByLabelText(`Følg tilbake ${follower.actorName}`),
    );
    expect(
      screen.getByLabelText(`Slutt å følge ${follower.actorName}`),
    ).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("only follow notices get the button", () => {
    render(<NotificationsScreen />, { wrapper });
    const follows = MOCK_NOTIFICATIONS.filter((n) => n.type === "follow");
    expect(screen.getAllByText("Følg tilbake")).toHaveLength(follows.length);
  });

  it("a guest is asked to sign in instead", () => {
    const guest = renderHook(() => useGuestMode());
    act(() => guest.result.current.setGuest(true));
    render(<NotificationsScreen />, { wrapper });
    fireEvent.press(
      screen.getByLabelText(`Følg tilbake ${follower.actorName}`),
    );
    expect(screen.getAllByText("Logg inn").length).toBeGreaterThan(0);
    expect(
      screen.getByLabelText(`Følg tilbake ${follower.actorName}`),
    ).toBeTruthy();
    act(() => guest.result.current.setGuest(false));
  });
});
