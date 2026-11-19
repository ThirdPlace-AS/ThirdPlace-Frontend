// Phase 16 (section benchmark): upcoming plans count down ("I kveld",
// "I morgen", "Om 4 dager") in Mine planer and on Profil's Neste plan.
import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { CountdownChip, planCountdown } from "@/components/CountdownChip";
import PlansScreen from "@/features/saved/PlansScreen";
import { experienceById, profile } from "@/fixtures";
import { countdownLabel } from "@/lib/dates";

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

// Saturday 7 November 2026, 12:00.
const NOW = new Date(2026, 10, 7, 12, 0);
const at = (day: number, h: number, m = 0) => new Date(2026, 10, day, h, m);

describe("countdownLabel", () => {
  it("names today, tonight, tomorrow and later days by calendar day", () => {
    expect(countdownLabel(at(7, 15), NOW)).toBe("I dag");
    expect(countdownLabel(at(7, 19), NOW)).toBe("I kveld");
    expect(countdownLabel(at(8, 9), NOW)).toBe("I morgen");
    expect(countdownLabel(at(11, 9), NOW)).toBe("Om 4 dager");
    // 23:00 tonight, 08:00 tomorrow: calendar days, not 24 h blocks.
    expect(countdownLabel(at(8, 8), new Date(2026, 10, 7, 23, 0))).toBe(
      "I morgen",
    );
  });

  it("says nothing once the plan has started", () => {
    expect(countdownLabel(at(7, 11), NOW)).toBeNull();
    expect(countdownLabel(NOW, NOW)).toBeNull();
  });
});

describe("plans count down", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it("the fixture plans: e1 on Wednesday, e5 tomorrow evening", () => {
    expect(planCountdown(experienceById("e1")!, NOW)).toBe("Om 4 dager");
    expect(planCountdown(experienceById("e5")!, NOW)).toBe("I morgen");
  });

  it("Mine planer shows a chip on each upcoming plan, in its label too", () => {
    render(<PlansScreen />, { wrapper });
    const upcoming = profile.plans.filter((p) => p.state === "upcoming");
    for (const p of upcoming) {
      const exp = experienceById(p.experienceId)!;
      const label = planCountdown(exp, NOW)!;
      // The chip is decorative for screen readers: the row label says it.
      expect(
        screen.getByText(label, { includeHiddenElements: true }),
      ).toBeTruthy();
      expect(
        screen.getByLabelText(
          `${exp.title}, ${exp.when}, ${label.toLowerCase()}`,
        ),
      ).toBeTruthy();
    }
  });

  it("the chip on its own (Neste plan uses the same one)", () => {
    render(<CountdownChip exp={experienceById("e5")!} now={NOW} />, {
      wrapper,
    });
    expect(
      screen.getByText("I morgen", { includeHiddenElements: true }),
    ).toBeTruthy();
  });
});
