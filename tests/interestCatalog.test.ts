// Phase 19 (founder 2026-11-08): the interest catalogue. Every interest has
// one of the eight pin colours and a pin glyph of its own; the design's 22
// come first, in the onboarding order.
import { describe, expect, it } from "@jest/globals";

import {
  DESIGN_INTEREST_IDS,
  INTEREST_CATEGORIES,
  INTERESTS,
  interestById,
  interestForLabel,
  interestsInCategory,
  type Interest,
} from "@/fixtures/catalog/interests";
import { INTEREST_OPTIONS } from "@/lib/preferences";

// The pin glyphs are Material Community Icons names (shipped inside
// @expo/vector-icons), apart from the one hand-drawn "yarn".
const MCI: Record<
  string,
  number
> = require("@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json");

const ALL = INTERESTS as readonly Interest[];

describe("interest catalogue", () => {
  it("has 84 interests with unique ASCII ids, labels and glyphs", () => {
    expect(ALL).toHaveLength(84);
    expect(new Set(ALL.map((i) => i.id)).size).toBe(ALL.length);
    expect(new Set(ALL.map((i) => i.label)).size).toBe(ALL.length);
    expect(new Set(ALL.map((i) => i.glyph)).size).toBe(ALL.length);
    for (const i of ALL) expect(i.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("puts every interest in one of the eight pin colours, none empty", () => {
    for (const i of ALL) expect(INTEREST_CATEGORIES).toContain(i.category);
    for (const c of INTEREST_CATEGORIES)
      expect(interestsInCategory(c).length).toBeGreaterThan(0);
  });

  it("uses real Material Community Icons glyphs (and the one yarn glyph)", () => {
    for (const i of ALL) {
      if (i.glyph === "yarn") continue;
      expect(MCI[i.glyph]).toBeDefined();
    }
    expect(ALL.filter((i) => i.glyph === "yarn").map((i) => i.id)).toEqual([
      "strikking",
    ]);
  });

  it("starts with the design's 22, in the onboarding order", () => {
    expect(DESIGN_INTEREST_IDS).toHaveLength(22);
    expect(DESIGN_INTEREST_IDS.map((id) => interestById(id)?.label)).toEqual([
      ...INTEREST_OPTIONS,
    ]);
  });

  it("reads older labels as the interest they mean", () => {
    expect(interestForLabel("Foto")?.id).toBe("fotografi");
    expect(interestForLabel("Fotografering")?.id).toBe("fotografi");
    expect(interestForLabel("Bøker")?.id).toBe("litteratur");
    expect(interestForLabel("Natur")?.id).toBe("friluftsliv");
    expect(interestForLabel("Morgenmøter")?.id).toBe("kaffe");
    expect(interestForLabel("  jazz ")?.id).toBe("jazz");
    expect(interestForLabel("Reiser")).toBeUndefined();
  });

  it("never lets a synonym name a different interest's label", () => {
    const labels = new Map(ALL.map((i) => [i.label.toLowerCase(), i.id]));
    for (const i of ALL)
      for (const s of i.synonyms ?? []) {
        const owner = labels.get(s.toLowerCase());
        expect(owner === undefined || owner === i.id).toBe(true);
      }
  });
});
