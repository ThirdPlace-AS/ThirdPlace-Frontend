import { describe, expect, it } from "@jest/globals";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { places } from "@/fixtures";
import {
  PLACE_KIND_TYPES,
  placeKindGlyph,
} from "@/components/map/services/placeGlyph";

// User 2026-11-11: "the same types of city space and businesses should share
// the same marker icons, the icons must reflect the business or city space";
// answers: close types share one icon, organisations follow the same rule.
describe("placeKindGlyph", () => {
  const valid = (g: string) =>
    g === "yarn" || g in MaterialCommunityIcons.glyphMap;

  it("knows every place category in the fixtures", () => {
    const missing = [
      ...new Set(
        places
          .filter((p) => placeKindGlyph(p.category) === undefined)
          .map((p) => `${p.kind}: ${p.category}`),
      ),
    ];
    expect(missing).toEqual([]);
  });

  it("puts each category in one row only, with a real glyph", () => {
    expect(new Set(PLACE_KIND_TYPES).size).toBe(PLACE_KIND_TYPES.length);
    for (const t of PLACE_KIND_TYPES) {
      const g = placeKindGlyph(t);
      expect(g && valid(g)).toBe(true);
    }
  });

  it("shares one icon across close kinds", () => {
    const same = (types: string[], glyph: string) => {
      for (const t of types) expect(placeKindGlyph(t)).toBe(glyph);
    };
    same(["Kafé", "Bokkafé", "Hundekafé", "Spillkafé"], "coffee");
    same(
      ["Restaurant", "Pizzeria", "Sjømatrestaurant", "Vietnamesisk restaurant"],
      "silverware-fork-knife",
    );
    same(["Bar", "Pub", "Vinbar", "Jazzbar"], "glass-cocktail");
    same(["Park", "Skulpturpark", "Bekk og park"], "tree");
    same(["Badeplass", "Badestrand", "Sjøbad"], "beach");
    same(["Buldresenter", "Klatrefelt", "Klatrelag"], "carabiner");
    expect(placeKindGlyph("Torg")).toBe("fountain");
  });

  it("has nothing for an unknown or missing category", () => {
    expect(placeKindGlyph("Ukjent")).toBeUndefined();
    expect(placeKindGlyph(undefined)).toBeUndefined();
  });
});
