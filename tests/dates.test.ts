import { describe, expect, it } from "@jest/globals";

import { dayLabel, shortSessionLabel, timeRange } from "@/lib/dates";

// Friday 6 November 2026, 10:00 local time.
const now = new Date(2026, 10, 6, 10, 0);

describe("session date labels", () => {
  it("names today, tomorrow and later days in Norwegian", () => {
    expect(dayLabel(new Date(2026, 10, 6, 18, 0), now)).toBe(
      "I dag, 6. november",
    );
    expect(dayLabel(new Date(2026, 10, 7, 9, 0), now)).toBe(
      "I morgen, 7. november",
    );
    expect(dayLabel(new Date(2026, 10, 11, 9, 0), now)).toBe(
      "Onsdag 11. november",
    );
  });

  it("formats the join card label and time ranges", () => {
    expect(shortSessionLabel(new Date(2026, 10, 6, 11, 0), now)).toBe(
      "I dag 11:00",
    );
    expect(shortSessionLabel(new Date(2026, 10, 7, 19, 0), now)).toBe(
      "I morgen 19:00",
    );
    expect(shortSessionLabel(new Date(2026, 10, 11, 9, 0), now)).toBe(
      "ons. 11. nov. 09:00",
    );
    expect(
      timeRange(new Date(2026, 10, 11, 9, 0), new Date(2026, 10, 11, 10, 0)),
    ).toBe("09:00–10:00");
  });
});
