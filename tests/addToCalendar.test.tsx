// Phase 16 (founder: build it): "Legg til i kalender" opens the phone's
// calendar app with the experience filled in; no calendar permission.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AddToCalendarLink } from "@/components/AddToCalendarLink";
import PlansScreen from "@/features/saved/PlansScreen";
import { experienceById, profile, sessionsFor } from "@/fixtures";
import {
  addToCalendar,
  calendarEventFor,
  resetCalendarModule,
} from "@/lib/addToCalendar";

const mockCreate = jest.fn(async (_e: unknown) => ({ action: "done" }));
jest.mock("expo-calendar/legacy", () => ({
  createEventInCalendarAsync: (e: unknown) => mockCreate(e),
}));
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
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
  mockCreate.mockClear();
  resetCalendarModule();
});

const e1 = experienceById("e1")!;
const NOW = new Date(2026, 10, 7, 12, 0);
const first = sessionsFor(e1, NOW)[0]!;

describe("calendar event", () => {
  it("carries the title, the time, where to meet and the link", () => {
    const ev = calendarEventFor(e1, first);
    expect(ev.title).toBe(e1.title);
    expect(ev.startDate).toBe(first.start);
    expect(ev.endDate).toBe(first.end);
    expect(ev.location).toBe(
      `${e1.meetingPoint.name}, ${e1.meetingPoint.address}`,
    );
    expect(ev.notes).toContain(`thirdplace.app/experience/${e1.id}`);
  });

  it("opens the calendar app, or says it could not", async () => {
    expect(await addToCalendar(calendarEventFor(e1, first))).toBe("opened");
    expect(mockCreate).toHaveBeenCalledTimes(1);
    mockCreate.mockRejectedValueOnce(new Error("no calendar app"));
    expect(await addToCalendar(calendarEventFor(e1, first))).toBe(
      "unavailable",
    );
  });
});

describe("Legg til i kalender", () => {
  it("adds the given time from the link", () => {
    render(<AddToCalendarLink exp={e1} session={first} />, { wrapper });
    fireEvent.press(screen.getByLabelText(`Legg til ${e1.title} i kalender`));
    expect(mockCreate).toHaveBeenCalledWith(calendarEventFor(e1, first));
  });

  it("is on every upcoming plan in Mine planer", () => {
    render(<PlansScreen />, { wrapper });
    for (const p of profile.plans.filter((x) => x.state === "upcoming")) {
      const exp = experienceById(p.experienceId)!;
      expect(
        screen.getByLabelText(`Legg til ${exp.title} i kalender`),
      ).toBeTruthy();
    }
  });
});
