import { describe, expect, it } from "@jest/globals";
import { Ionicons } from "@expo/vector-icons";

import { businesses, experiences, groups, places } from "@/fixtures";
import {
  FALLBACK_GLYPH,
  markerIcon,
} from "@/components/map/services/markerIcon";

// Founder request 2026-11-06: every map marker shows an icon that matches it.
describe("markerIcon", () => {
  const valid = (g: string) => g in Ionicons.glyphMap;

  it("gives every place its own matching glyph (no generic fallback)", () => {
    for (const p of places) {
      const g = markerIcon({ kind: "place", id: p.id, category: p.category });
      expect(valid(g)).toBe(true);
      expect(g).not.toBe(FALLBACK_GLYPH.place);
    }
    expect(markerIcon({ kind: "place", id: "p10" })).toBe("boat");
    expect(markerIcon({ kind: "place", id: "p9" })).toBe("body");
  });

  it("maps experiences from their tags", () => {
    for (const e of experiences) {
      const g = markerIcon({ kind: "experience", id: e.id });
      expect(valid(g)).toBe(true);
      expect(g).not.toBe(FALLBACK_GLYPH.experience);
    }
    expect(markerIcon({ kind: "experience", id: "e1" })).toBe("cafe");
    expect(markerIcon({ kind: "experience", id: "e5" })).toBe("dice");
  });

  it("businesses use their place's glyph; groups a people glyph", () => {
    for (const b of businesses) {
      expect(markerIcon({ kind: "business", id: b.id })).toBe(
        markerIcon({ kind: "place", id: b.placeId }),
      );
    }
    for (const g of groups) {
      expect(markerIcon({ kind: "group", id: g.id })).toBe("people");
    }
  });

  it("falls back by category, then to a generic glyph", () => {
    expect(markerIcon({ kind: "place", id: "nope", category: "Vinbar" })).toBe(
      "wine",
    );
    expect(markerIcon({ kind: "place", id: "nope" })).toBe("location");
    expect(markerIcon({ kind: "experience", id: "nope" })).toBe("calendar");
  });
});
