// Phase 18 (screen benchmark, "Chat, groups, alerts"): the group page leads
// with "Neste møte" and shows the group's "Regler"; a sent "Hvordan var
// det?" stays on its plan row; "Send tilbakemelding" from Hjelp og støtte.
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

import {
  GroupContent,
  nextMeeting,
} from "@/components/map/content/GroupContent";
import PlansScreen from "@/features/saved/PlansScreen";
import FeedbackScreen from "@/features/settings/FeedbackScreen";
import { HelpScreen } from "@/features/settings/SettingsPages";
import {
  experienceById,
  experiences,
  groupById,
  groups,
  profile,
} from "@/fixtures";
import { createGroup, resetCreated } from "@/fixtures/created";
import { resetMyRatings } from "@/lib/myRatings";

const mockPush = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: () => mockBack(),
    navigate: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => mockParams,
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
  mockBack.mockClear();
  mockParams = {};
});
afterEach(() => {
  act(() => {
    resetMyRatings();
    resetCreated();
  });
  jest.useRealTimers();
});

describe("group page", () => {
  it("leads with the group's next experience and shows its rules", () => {
    const next = nextMeeting("g1")!;
    const own = experiences.filter(
      (e) => e.groupId === "g1" && e.status !== "cancelled",
    );
    expect(own.map((e) => e.id)).toContain(next.id);
    render(<GroupContent id="g1" />, { wrapper });
    expect(screen.getByText("Neste møte")).toBeTruthy();
    expect(screen.getByText("Regler")).toBeTruthy();
    expect(screen.getByText(groupById("g1")!.rules!)).toBeTruthy();
    fireEvent.press(screen.getByText(next.title));
    expect(mockPush).toHaveBeenCalledWith(`/experience/${next.id}`);
  });

  // Review 2026-11-18 CT1 = C8: Neste møte named a venue the group's own
  // text did not. A group with a home only lists a meeting held there.
  it("Neste møte only names the group's home", () => {
    const now = new Date(2026, 10, 18, 8, 0);
    let shown = 0;
    for (const g of groups) {
      const next = nextMeeting(g.id, now);
      if (!next) continue;
      shown += 1;
      if (g.homePlaceId) {
        expect(experienceById(next.id)!.placeId).toBe(g.homePlaceId);
      }
    }
    expect(shown).toBeGreaterThan(0);
  });

  it("a new group keeps its creator's rules, and none when left empty", () => {
    const withRules = createGroup({
      name: "Løpegjengen",
      about: "",
      interests: [],
      area: "Grünerløkka",
      photos: ["group-coffee", "venue-cafe"],
      access: "open",
      rules: "  Vi løper uansett vær.  ",
    });
    expect(groupById(withRules.groupId)?.rules).toBe("Vi løper uansett vær.");
    const without = createGroup({
      name: "Brettspill",
      about: "",
      interests: [],
      area: "Frogner",
      photos: ["group-coffee", "venue-cafe"],
      access: "open",
    });
    expect(groupById(without.groupId)?.rules).toBeUndefined();
    // No experiences yet: no "Neste møte".
    render(<GroupContent id={without.groupId} />, { wrapper });
    expect(screen.queryByText("Neste møte")).toBeNull();
  });
});

describe("Hvordan var det?", () => {
  it("the answer stays on the past plan instead of the button", () => {
    jest.useFakeTimers();
    const past = profile.plans.find((p) => p.state === "past")!;
    const exp = experienceById(past.experienceId)!;
    render(<PlansScreen />, { wrapper });
    fireEvent.press(screen.getByText("Tidligere"));
    fireEvent.press(screen.getByText("Vurder opplevelsen"));
    fireEvent.press(screen.getByLabelText("4 av 5 stjerner"));
    fireEvent.press(screen.getByText("Verten"));
    fireEvent.press(screen.getByText("Send vurdering"));
    act(() => jest.advanceTimersByTime(400));
    expect(screen.getByText("Din vurdering: ★ 4 · Verten")).toBeTruthy();
    expect(screen.queryByText("Vurder opplevelsen")).toBeNull();
    expect(screen.getByText(exp.title)).toBeTruthy();
  });
});

describe("Send tilbakemelding", () => {
  it("opens from Hjelp og støtte and sends once something is written", () => {
    render(<HelpScreen />, { wrapper });
    fireEvent.press(screen.getByText("Send tilbakemelding"));
    expect(mockPush).toHaveBeenCalledWith("/settings/feedback");
    screen.unmount();
    mockParams = { from: "Kart" };
    render(<FeedbackScreen />, { wrapper });
    expect(screen.getByText("Fra: Kart")).toBeTruthy();
    const send = screen.getByRole("button", { name: "Send" });
    expect(send.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(screen.getByText("Forslag"));
    fireEvent.changeText(
      screen.getByPlaceholderText("Skriv det du vil vi skal vite"),
      "Mørk modus på kartet er fin.",
    );
    fireEvent.press(screen.getByRole("button", { name: "Send" }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
