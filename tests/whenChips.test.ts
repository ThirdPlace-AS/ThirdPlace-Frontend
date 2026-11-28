// Når's quick chips filter by the experiences' real times (0517): they used
// to match the fixtures' fixed `day` label, so «I kveld» kept no experience
// and «Denne uka» kept times past Sunday.
import { afterEach, describe, expect, it, jest } from "@jest/globals";

import {
  applyExperienceFilters,
  DEFAULT_FILTERS,
  timeOfDayFor,
} from "@/components/map/services/mapFilters";
import { experiences, sessionsFor } from "@/fixtures";
import { isoDay } from "@/lib/dates";

import { comingWednesdayNoon } from "./setup/clock";

// The test reads sessions still ahead of "now", so it used to fail in the
// evening (tonight's sessions had started) and on Saturdays (one evening
// experience). It runs at noon on the coming Wednesday, a day with many
// evening experiences (0530).

afterEach(() => {
  jest.useRealTimers();
});

describe("Når's quick chips filter by real times", () => {
  it("«I kveld» keeps tonight's experiences, whatever their fixed day label", () => {
    jest.useFakeTimers({ now: comingWednesdayNoon() });
    const today = new Date();
    const kept = applyExperienceFilters(experiences, "", {
      ...DEFAULT_FILTERS,
      time: "I dag",
      dateStart: isoDay(today),
      dateEnd: null,
      timeOfDay: ["kveld"],
    });
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59);
    const tonight = experiences.filter(
      (e) =>
        e.status !== "cancelled" &&
        timeOfDayFor(e.when) === "kveld" &&
        sessionsFor(e, today, 8).some(
          (s) => s.start >= start && s.start <= end,
        ),
    );
    expect(tonight.length).toBeGreaterThan(1);
    expect(kept.map((e) => e.id).sort()).toEqual(
      tonight.map((e) => e.id).sort(),
    );
  });
});
