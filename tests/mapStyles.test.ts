import { describe, expect, it } from "@jest/globals";

import {
  autoStyleKey,
  basemapFor,
  MAP_STYLES,
  MAP_TYPES,
  periodForHour,
  STANDARD_SATELLITE_URL,
  styleKeyForHour,
} from "@/components/map/mapStyles";
import { terrainPaint } from "@/components/map/terrainStyle";

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

describe("Karttype (founder 2026-11-07)", () => {
  it("offers Standard, Satellitt and Terreng in that order", () => {
    expect(MAP_TYPES.map((t) => t.label)).toEqual([
      "Standard",
      "Satellitt",
      "Terreng",
    ]);
  });

  it("Standard is the Studio style with its own light preset", () => {
    for (const s of MAP_STYLES) {
      const b = basemapFor("standard", s.key);
      expect(b.url).toBe(s.url);
      expect(b.period).toBe(s.period);
      expect(b.terrain).toBe(false);
      expect(b.dark).toBe(s.period === "dusk" || s.period === "night");
    }
  });

  it("Satellitt keeps one style URL, takes the preset and is always dark", () => {
    for (const s of MAP_STYLES) {
      const b = basemapFor("satellite", s.key);
      expect(b.url).toBe(STANDARD_SATELLITE_URL);
      expect(b.period).toBe(s.period);
      expect(b.dark).toBe(true);
      expect(b.terrain).toBe(false);
    }
  });

  it("Terreng is the Studio style with relief on top", () => {
    for (const s of MAP_STYLES) {
      const b = basemapFor("terrain", s.key);
      expect(b.url).toBe(s.url);
      expect(b.period).toBe(s.period);
      expect(b.terrain).toBe(true);
      expect(b.dark).toBe(s.period === "dusk" || s.period === "night");
    }
  });

  it("contour labels turn light on a dark halo over a dark map", () => {
    const day = terrainPaint(false);
    const night = terrainPaint(true);
    expect(night.labelText).not.toBe(day.labelText);
    expect(night.labelHalo).not.toBe(day.labelHalo);
    for (const v of Object.values(day)) expect(v).toMatch(/^#[0-9A-F]{6}$/i);
  });
});
