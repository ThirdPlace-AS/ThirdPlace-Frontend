// Når's quick chips filter by the experiences' real times (0517): they used
// to match the fixtures' fixed `day` label, so «I kveld» kept no experience
// and «Denne uka» kept times past Sunday.
import { describe, expect, it } from "@jest/globals";

import {
  applyExperienceFilters,
  DEFAULT_FILTERS,
  timeOfDayFor,
} from "@/components/map/services/mapFilters";
import { experiences, sessionsFor } from "@/fixtures";
import { isoDay } from "@/lib/dates";

describe("Når's quick chips filter by real times", () => {
  it("«I kveld» keeps tonight's experiences, whatever their fixed day label", () => {
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
