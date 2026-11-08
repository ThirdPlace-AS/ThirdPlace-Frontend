// Phase 16 (section benchmark): "Start fra en tidligere opplevelse" in Legg
// til, the one-time Sveip hint, and "I dag" on the workspace hub.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AddWizard } from "@/features/add/AddWizard";
import { draftCopyOf, EMPTY_DRAFT } from "@/features/add/types";
import { hubToday } from "@/features/workspace/hubToday";
import {
  experienceById,
  experiences,
  listingById,
  myListingStates,
  profile,
  sessionsFor,
} from "@/fixtures";
import {
  createExperience,
  hostedExperiences,
  resetCreated,
} from "@/fixtures/created";
import {
  DEFAULT_HINTS,
  getHints,
  markHintSeen,
  restoreHints,
} from "@/lib/hints";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({}),
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
  resetCreated();
  restoreHints(undefined);
});

describe("Start fra en tidligere opplevelse", () => {
  const e1 = experienceById("e1")!;

  it("copies what the experience says, but not when it happens", () => {
    const d = draftCopyOf(e1, { area: "Oslo Kaffebar", photos: [0, 1] });
    expect(d).toMatchObject({
      kind: "experience",
      title: e1.title,
      summary: e1.about,
      category: e1.category,
      area: "Oslo Kaffebar",
      photos: [0, 1],
      duration: e1.duration,
      repeat: e1.repeat,
      capacity: String(e1.capacity),
      access: e1.access,
      cancellation: e1.cancellation,
      vibes: e1.vibes,
      energy: e1.energy,
      languages: e1.languages,
      included: e1.included,
      steps: e1.itinerary.map((s) => s.title),
    });
    expect(d.date).toBeNull();
    expect(d.startTime).toBeNull();
    expect(d.price).toBe(e1.priceNok ? String(e1.priceNok) : "");
    expect(EMPTY_DRAFT.title).toBe("");
  });

  it("offers what you host: published this session first, then Profil's Arrangert", () => {
    const hosted = profile.activity
      .filter((a) => a.role === "Arrangert")
      .map((a) => a.experienceId);
    expect(hostedExperiences().map((e) => e.id)).toEqual(hosted);
    const id = createExperience({
      title: "Strikkekveld",
      about: "Vi strikker sammen.",
      category: "Kreativt",
      area: "Grünerløkka",
      meetingPoint: "",
      photos: experiences[0]!.photos,
      date: "2026-11-20",
      startTime: "18:00",
      duration: "2 timer",
      repeat: "Ukentlig",
      capacity: 6,
      priceNok: 0,
      access: "Alle",
      cancellation: "Gratis frem til 24 t før",
      vibes: ["Koselig"],
      energy: null,
      languages: ["Norsk"],
      included: [],
      steps: [],
    });
    expect(hostedExperiences()[0]?.id).toBe(id);
  });

  it("the first Opplevelse step fills in from the picked one", () => {
    render(<AddWizard />, { wrapper });
    fireEvent.press(screen.getByText("Opplevelse"));
    fireEvent.press(screen.getByText("Start fra en tidligere opplevelse"));
    fireEvent.press(
      screen.getByLabelText(`${e1.title}, ${e1.category}, ${e1.when}`),
    );
    expect(screen.getByDisplayValue(e1.title)).toBeTruthy();
    expect(screen.getByDisplayValue(e1.about)).toBeTruthy();
    // Filled in: the offer steps aside.
    expect(screen.queryByText("Start fra en tidligere opplevelse")).toBeNull();
  });
});

describe("Sveip hint", () => {
  it("is shown until seen, and only 'true' from the phone counts as seen", () => {
    expect(getHints()).toEqual(DEFAULT_HINTS);
    act(() => markHintSeen("swipeGestures"));
    expect(getHints().swipeGestures).toBe(true);
    act(() => restoreHints({ swipeGestures: "yes" as unknown as boolean }));
    expect(getHints().swipeGestures).toBe(false);
  });
});

describe("I dag on the hub", () => {
  // Saturday 7 November 2026, 08:00.
  const NOW = new Date(2026, 10, 7, 8, 0);

  it("lists today's times, counts the next seven days and the waitlists", () => {
    const { today, week, waiting } = hubToday(experiences, NOW);
    const sameDay = (d: Date) =>
      d.getFullYear() === 2026 && d.getMonth() === 10 && d.getDate() === 7;
    const expectedToday = experiences.filter(
      (e) =>
        e.status !== "cancelled" &&
        sessionsFor(e, NOW, 8).some((s) => sameDay(s.start)),
    );
    expect(today.map((t) => t.exp.id).sort()).toEqual(
      expectedToday.map((e) => e.id).sort(),
    );
    for (let i = 1; i < today.length; i += 1)
      expect(today[i]!.start.getTime()).toBeGreaterThanOrEqual(
        today[i - 1]!.start.getTime(),
      );
    expect(week).toBeGreaterThan(0);
    expect(week).toBeLessThanOrEqual(experiences.length);
    const lists = Object.entries(myListingStates)
      .filter(([, s]) => s === "Aktive")
      .map(([id]) => listingById(id)?.waitlist?.length ?? 0);
    expect(waiting).toBe(lists.reduce((a, b) => a + b, 0));
  });

  it("a cancelled experience never shows", () => {
    const cancelled = experiences.filter((e) => e.status === "cancelled");
    const { today } = hubToday(cancelled, NOW);
    expect(today).toHaveLength(0);
    expect(hubToday(cancelled, NOW).week).toBe(0);
  });
});
