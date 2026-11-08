// Phase 12 H5b: Legg til creates groups (with a group chat) and publishes
// experiences in memory; both are found by the normal lookups, the map lists
// a published experience, and resetCreated() forgets everything.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { resultForMode } from "@/components/map/services/mapFixtureAdapter";
import { AddWizard } from "@/features/add/AddWizard";
import {
  advanceHint,
  canAdvance,
  EMPTY_DRAFT,
  stepsFor,
} from "@/features/add/types";
import {
  chatById,
  chatForExperience,
  experienceById,
  experiences,
  groupById,
  places,
  sessionsFor,
} from "@/fixtures";
import {
  createExperience,
  createGroup,
  durationMinutes,
  resetCreated,
  windowFor,
} from "@/fixtures/created";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

afterEach(() => resetCreated());

const BASE_EXP = {
  title: "Strikkekveld",
  about: "Vi strikker sammen.",
  category: "Kreativt",
  area: places[0]!.name,
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
  included: ["Garn"],
  steps: ["Vi møtes", "", "Vi strikker"],
};

describe("created groups", () => {
  it("adds the group and its chat, then forgets them on reset", () => {
    const { groupId, chatId } = createGroup({
      name: "Løpegjengen",
      about: "",
      interests: ["Løping"],
      area: "Grünerløkka",
      photos: ["group-run", "venue-outdoor"],
      access: "closed",
    });
    const g = groupById(groupId)!;
    expect(g.name).toBe("Løpegjengen");
    expect(g.photos).toHaveLength(2);
    expect(g.about).toContain("Grünerløkka");
    const c = chatById(chatId)!;
    expect(c.name).toBe("Løpegjengen");
    expect(c.access).toBe("closed");
    resetCreated();
    expect(groupById(groupId)).toBeUndefined();
    expect(chatById(chatId)).toBeUndefined();
  });
});

describe("published experiences", () => {
  it("are found, start on the picked date and have a chat", () => {
    const id = createExperience(BASE_EXP);
    const e = experienceById(id)!;
    expect(e.title).toBe("Strikkekveld");
    expect(e.placeId).toBe(places[0]!.id);
    expect(e.meetingPoint.coord).toEqual(places[0]!.coord);
    expect(e.itinerary.map((s) => s.title)).toEqual([
      "Vi møtes",
      "Vi strikker",
    ]);
    expect(e.durationMin).toBe(120);
    const first = sessionsFor(e, new Date(2026, 10, 7))[0]!;
    expect(first.start.getDate()).toBe(20);
    expect(first.start.getHours()).toBe(18);
    expect(chatForExperience(id)?.pinnedExperienceId).toBe(id);
  });

  it("appear on the map", () => {
    const id = createExperience(BASE_EXP);
    const r = resultForMode({
      mode: "forYou",
      places,
      query: "",
      savedIds: [],
    });
    expect(r.items.some((i) => i.id === id)).toBe(true);
  });

  it("helpers read like the fixtures", () => {
    expect(durationMinutes("1 time")).toBe(60);
    expect(durationMinutes("Hele dagen")).toBe(480);
    const now = new Date(2026, 10, 7); // a Saturday
    expect(windowFor(new Date(2026, 10, 7), now)).toBe("I dag");
    expect(windowFor(new Date(2026, 10, 8), now)).toBe("I morgen");
    expect(windowFor(new Date(2026, 10, 14), now)).toBe("Helg");
    expect(windowFor(new Date(2026, 10, 11), now)).toBe("Denne uka");
  });
});

describe("Add flow rules", () => {
  it("a group has five steps and needs an interest and two photos", () => {
    expect(stepsFor("group")).toEqual([
      "about",
      "where",
      "photos",
      "access",
      "review",
    ]);
    const d = { ...EMPTY_DRAFT, kind: "group" as const, title: "Løp" };
    expect(canAdvance("about", d)).toBe(false);
    expect(advanceHint("about", d)).toBe("Velg minst én interesse.");
    expect(canAdvance("about", { ...d, interests: ["Løping"] })).toBe(true);
    expect(canAdvance("photos", { ...d, photos: [0] })).toBe(false);
    expect(canAdvance("photos", { ...d, photos: [0, 1] })).toBe(true);
    expect(canAdvance("access", d)).toBe(true);
  });

  it("an experience gets an optional plan step", () => {
    expect(stepsFor("experience")).toContain("plan");
    expect(canAdvance("plan", { ...EMPTY_DRAFT, kind: "experience" })).toBe(
      true,
    );
  });

  it("the menu offers Gruppe and starts its flow", () => {
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 640 },
          insets: { top: 24, left: 0, right: 0, bottom: 0 },
        }}
      >
        <AddWizard />
      </SafeAreaProvider>,
    );
    expect(screen.queryByText(/ — /)).toBeNull();
    fireEvent.press(screen.getByText("Gruppe"));
    expect(screen.getByText("Om gruppen")).toBeTruthy();
  });
});
