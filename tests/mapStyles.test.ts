import { describe, expect, it } from "@jest/globals";

import {
  MAP_STYLES,
  periodForHour,
  styleKeyForHour,
} from "@/components/map/mapStyles";

describe("periodForHour", () => {
  it("maps band boundaries", () => {
    expect(periodForHour(4)).toBe("night");
    expect(periodForHour(5)).toBe("dawn");
    expect(periodForHour(7)).toBe("dawn");
    expect(periodForHour(8)).toBe("day");
    expect(periodForHour(16)).toBe("day");
    expect(periodForHour(17)).toBe("dusk");
    expect(periodForHour(19)).toBe("dusk");
    expect(periodForHour(20)).toBe("night");
    expect(periodForHour(23)).toBe("night");
    expect(periodForHour(0)).toBe("night");
  });
});

describe("styleKeyForHour", () => {
  it("returns the key whose entry matches the current period", () => {
    const keyFor = (period: string) =>
      MAP_STYLES.find((s) => s.period === period)?.key;
    expect(styleKeyForHour(6)).toBe(keyFor("dawn"));
    expect(styleKeyForHour(12)).toBe(keyFor("day"));
    expect(styleKeyForHour(18)).toBe(keyFor("dusk"));
    expect(styleKeyForHour(22)).toBe(keyFor("night"));
  });

  it("returns a valid style key for every hour 0-23", () => {
    const validKeys = new Set(MAP_STYLES.map((s) => s.key));
    for (let hour = 0; hour < 24; hour++) {
      expect(validKeys.has(styleKeyForHour(hour))).toBe(true);
    }
  });
});
