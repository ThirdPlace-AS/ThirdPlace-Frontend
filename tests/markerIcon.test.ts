import { describe, expect, it } from "@jest/globals";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { experiences, groups, places } from "@/fixtures";
import {
  INTERESTS,
  interestById,
  type Interest,
} from "@/fixtures/catalog/interests";
import { MARKER_GLYPH_TONE } from "@/components/map/services/markerCategory";
import {
  FALLBACK_GLYPH,
  allPinGlyphs,
  markerIcon,
} from "@/components/map/services/markerIcon";

// Founder request 2026-11-06: every map marker shows an icon that matches it.
// Phase 19 (founder 2026-11-08): every interest has its own pin glyph, from
// Material Community Icons (filled) plus the hand-drawn yarn.
describe("markerIcon", () => {
  const valid = (g: string) =>
    g === "yarn" || g in MaterialCommunityIcons.glyphMap;

  it("gives every place the glyph of its interest (no generic fallback)", () => {
    for (const p of places) {
      const g = markerIcon({ kind: "place", id: p.id, category: p.category });
      expect(valid(g)).toBe(true);
      expect(g).toBe(interestById(p.interestId)?.glyph);
      expect(g).not.toBe(FALLBACK_GLYPH.place);
    }
    // The same meaning as before Phase 19, in the new family.
    expect(markerIcon({ kind: "place", id: "p10" })).toBe("sail-boat");
    expect(markerIcon({ kind: "place", id: "p9" })).toBe("yoga");
  });

  it("gives every experience the glyph of its interest", () => {
    for (const e of experiences) {
      const g = markerIcon({ kind: "experience", id: e.id });
      expect(valid(g)).toBe(true);
      expect(g).toBe(interestById(e.interestId)?.glyph);
    }
    expect(markerIcon({ kind: "experience", id: "e1" })).toBe("coffee");
    expect(markerIcon({ kind: "experience", id: "e5" })).toBe("dice-5");
  });

  it("groups get a people glyph", () => {
    for (const g of groups) {
      expect(markerIcon({ kind: "group", id: g.id })).toBe("account-group");
    }
  });

  it("falls back to a generic glyph for an unknown item", () => {
    expect(markerIcon({ kind: "place", id: "nope" })).toBe("map-marker");
    expect(markerIcon({ kind: "experience", id: "nope" })).toBe("calendar");
    for (const g of Object.values(FALLBACK_GLYPH)) expect(valid(g)).toBe(true);
  });

  it("registers every interest's glyph in its category's tone, once", () => {
    const all = allPinGlyphs();
    const keys = all.map((g) => `${g.glyph}:${g.tone}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const i of INTERESTS as readonly Interest[])
      expect(keys).toContain(`${i.glyph}:${MARKER_GLYPH_TONE[i.category]}`);
    for (const g of all) expect(valid(g.glyph)).toBe(true);
  });
});
