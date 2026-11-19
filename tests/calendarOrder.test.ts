import { describe, expect, it } from "@jest/globals";

import { byStart, minutesAhead } from "@/features/workspace/calendarOrder";

// Friday 6 Nov 2026
const FRI = new Date(2026, 10, 6, 9, 0);

describe("calendar order", () => {
  it("I dag before I morgen before later weekdays", () => {
    const list = [
      { when: "Ons 09:00" },
      { when: "Søn 18:00" },
      { when: "Tor 19:00" },
      { when: "Tir 18:00" },
      { when: "I morgen 19:00" },
      { when: "I dag 11:00" },
    ];
    expect(byStart(list, FRI).map((e) => e.when)).toEqual([
      "I dag 11:00",
      "I morgen 19:00",
      "Søn 18:00",
      "Tir 18:00",
      "Ons 09:00",
      "Tor 19:00",
    ]);
  });

  it("a weekday equal to today or tomorrow means next week", () => {
    expect(minutesAhead("Fre 10:00", FRI)).toBe(7 * 24 * 60 + 600);
    expect(minutesAhead("Lør 10:00", FRI)).toBe(8 * 24 * 60 + 600);
  });

  it("unknown labels sort last", () => {
    expect(minutesAhead("Snart", FRI)).toBe(Infinity);
  });
});
