import { describe, expect, it } from "@jest/globals";

import {
  autoStyleKey,
  MAP_STYLES,
  periodForHour,
  periodForUrl,
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

describe("autoStyleKey", () => {
  const night = MAP_STYLES.find((s) => s.period === "night")?.key;
  it("follows the clock in light mode", () => {
    expect(autoStyleKey(12, false)).toBe(styleKeyForHour(12));
  });
  it("uses the night style whenever the app is dark", () => {
    expect(autoStyleKey(12, true)).toBe(night);
    expect(autoStyleKey(6, true)).toBe(night);
  });
});

describe("periodForUrl (basemap config repeats the style's light preset)", () => {
  it("maps each ThirdPlace style URL to its period, unknown URLs to day", () => {
    for (const s of MAP_STYLES) expect(periodForUrl(s.url)).toBe(s.period);
    expect(periodForUrl("mapbox://styles/mapbox/streets-v12")).toBe("day");
    expect(periodForUrl(undefined)).toBe("day");
  });
});
