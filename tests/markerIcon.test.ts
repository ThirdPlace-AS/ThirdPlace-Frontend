import { describe, expect, it } from "@jest/globals";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { experiences, groups, places } from "@/fixtures";
import {
  INTERESTS,
  interestById,
  type Interest,
} from "@/fixtures/catalog/interests";
import {
  MARKER_GLYPH_TONE,
  markerCategoryFor,
} from "@/components/map/services/markerCategory";
import {
  FALLBACK_GLYPH,
  allPinGlyphs,
  markerIcon,
} from "@/components/map/services/markerIcon";
import { placeKindGlyph } from "@/components/map/services/placeGlyph";

// Founder request 2026-11-06: every map marker shows an icon that matches it.
// Phase 19 (founder 2026-11-08): every interest has its own pin glyph, from
// Material Community Icons (filled) plus the hand-drawn yarn. User
// 2026-11-11: a place shows what it is instead, the same icon for the same
// kind of place (placeGlyph.ts); experiences keep their interest's glyph.
describe("markerIcon", () => {
  const valid = (g: string) =>
    g === "yarn" || g in MaterialCommunityIcons.glyphMap;

  it("gives every place the glyph of its kind (no generic fallback)", () => {
    for (const p of places) {
      const g = markerIcon({ kind: "place", id: p.id, category: p.category });
      expect(valid(g)).toBe(true);
      expect(g).toBe(placeKindGlyph(p.category));
      expect(g).not.toBe(FALLBACK_GLYPH.place);
    }
    // The same meaning as before, now from the kind of place.
    expect(markerIcon({ kind: "place", id: "p10" })).toBe("sail-boat");
    expect(markerIcon({ kind: "place", id: "p9" })).toBe("yoga");
    expect(markerIcon({ kind: "place", id: "p1" })).toBe("coffee");
  });

  it("gives places of one kind one glyph, whatever their interest", () => {
    const byCategory = new Map<string, Set<string>>();
    for (const p of places) {
      const set = byCategory.get(p.category) ?? new Set<string>();
      set.add(markerIcon({ kind: "place", id: p.id }));
      byCategory.set(p.category, set);
    }
    for (const [, glyphs] of byCategory) expect(glyphs.size).toBe(1);
    // 35 parks for 35 interests: one tree (it was 35 different icons).
    const parks = places.filter((p) => p.category === "Park");
    expect(parks.length).toBeGreaterThan(10);
    expect(
      new Set(parks.map((p) => markerIcon({ kind: "place", id: p.id }))),
    ).toEqual(new Set(["tree"]));
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

  it("registers every glyph a pin draws, in the tone it is drawn in, once", () => {
    const all = allPinGlyphs();
    const keys = all.map((g) => `${g.glyph}:${g.tone}`);
    expect(new Set(keys).size).toBe(keys.length);
    // Experiences (created ones too): every interest's glyph.
    for (const i of INTERESTS as readonly Interest[])
      expect(keys).toContain(`${i.glyph}:${MARKER_GLYPH_TONE[i.category]}`);
    // Places: the kind's glyph in the tone of the pin's colour, which comes
    // from the interest, so a shared glyph needs every tone it sits on.
    for (const p of places) {
      const item = { kind: "place" as const, id: p.id };
      expect(keys).toContain(
        `${markerIcon(item)}:${MARKER_GLYPH_TONE[markerCategoryFor(item)]}`,
      );
    }
    for (const g of all) expect(valid(g.glyph)).toBe(true);
  });
});
