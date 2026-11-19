// Phase 18 (screen benchmark, "Joining and plans"): "Du er med" after
// joining, the month view in Mine planer, "I kveld" / picked dates with
// "± 1 dag" in Når, and help that starts from a plan or an experience.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { JoinedSheet } from "@/components/experience/JoinedSheet";
import {
  appliedFilterChips,
  applyExperienceFilters,
  dateWindow,
  DEFAULT_FILTERS,
  type MapFilters,
} from "@/components/map/services/mapFilters";
import { experiences, sessionsFor } from "@/fixtures";
import { isoDay, monthTitle, monthWeeks, shortDayMonth } from "@/lib/dates";
import SupportFormScreen from "@/features/settings/SupportFormScreen";

const mockPush = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: () => mockBack(),
    canGoBack: () => true,
    replace: jest.fn(),
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

afterEach(() => {
  mockPush.mockClear();
  mockBack.mockClear();
  mockParams = {};
  jest.useRealTimers();
});

describe("month view helpers", () => {
  it("lays a month out Monday first, padded to whole weeks", () => {
    // November 2026 starts on a Sunday.
    const weeks = monthWeeks(new Date(2026, 10, 12));
    expect(weeks[0]?.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(weeks[0]?.[6]?.getDate()).toBe(1);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    const days = weeks.flat().filter(Boolean);
    expect(days).toHaveLength(30);
    expect(monthTitle(new Date(2026, 10, 1))).toBe("November 2026");
    expect(isoDay(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(shortDayMonth("2026-11-12")).toBe("12. nov");
  });
});

describe("picked dates filter experiences", () => {
  const exp = experiences.find((e) => e.status !== "cancelled")!;
  const first = sessionsFor(exp, new Date(), 8)[0]!;
  const dayOf = (offset: number) => {
    const d = new Date(first.start);
    d.setDate(d.getDate() + offset);
    return isoDay(d);
  };
  const ids = (f: MapFilters) =>
    applyExperienceFilters(experiences, "", f).map((e) => e.id);

  it("keeps an experience on the picked day, drops it a day off", () => {
    expect(ids({ ...DEFAULT_FILTERS, dateStart: dayOf(0) })).toContain(exp.id);
    // Weekly sessions: the day before has none of this experience.
    expect(ids({ ...DEFAULT_FILTERS, dateStart: dayOf(-1) })).not.toContain(
      exp.id,
    );
  });

  it("± 1 dag widens a picked day by a day on each side", () => {
    expect(
      ids({ ...DEFAULT_FILTERS, dateStart: dayOf(-1), dateFlex: 1 }),
    ).toContain(exp.id);
    const w = dateWindow({
      ...DEFAULT_FILTERS,
      dateStart: "2026-11-12",
      dateFlex: 1,
    })!;
    expect(isoDay(w[0])).toBe("2026-11-11");
    expect(isoDay(w[1])).toBe("2026-11-13");
  });

  it("a quick tile decides instead of its dates; the chip names the day", () => {
    const f = {
      ...DEFAULT_FILTERS,
      dateStart: "2026-11-12",
      dateFlex: 1 as const,
    };
    expect(appliedFilterChips(f)[0]?.label).toBe("12. nov ± 1 dag");
    expect(
      appliedFilterChips({ ...f, time: "I dag" }).map((c) => c.label),
    ).toEqual(["I dag"]);
  });
});

describe("Du er med", () => {
  it("shows the time and place, and the next steps", () => {
    jest.useFakeTimers();
    const exp = experiences[0]!;
    const onClose = jest.fn();
    render(
      <JoinedSheet
        experience={exp}
        session={sessionsFor(exp)[0]}
        when="Ons 09:00"
        onClose={onClose}
      />,
      { wrapper },
    );
    expect(screen.getByText("Du er med")).toBeTruthy();
    expect(screen.getByText(exp.title)).toBeTruthy();
    expect(screen.getByText("Legg til i kalender")).toBeTruthy();
    expect(screen.getByText("Veibeskrivelse")).toBeTruthy();
    fireEvent.press(screen.getByText("Til samtalen"));
    expect(onClose).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(300);
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/chat\//));
  });
});

describe("Få hjelp", () => {
  it("fills in the experience and sends once something is written", () => {
    const exp = experiences[0]!;
    mockParams = { about: exp.id };
    render(<SupportFormScreen />, { wrapper });
    expect(screen.getByText("Gjelder")).toBeTruthy();
    expect(screen.getByDisplayValue(exp.title)).toBeTruthy();
    const send = screen.getByRole("button", { name: "Send" });
    expect(send.props.accessibilityState?.disabled).toBe(true);
    fireEvent.changeText(
      screen.getByPlaceholderText("Skriv hva som har skjedd"),
      "Vi fant ikke møtestedet.",
    );
    fireEvent.press(screen.getByRole("button", { name: "Send" }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
