// Map pin glyphs (founder request 2026-11-06: every marker shows an icon that
// matches it). Phase 19 (founder 2026-11-08): every interest has its own pin
// glyph (src/fixtures/catalog/interests.ts, Material Community Icons plus the
// hand-drawn yarn). Since 2026-11-11 (user: "the same types of city space and
// businesses should share the same marker icons, the icons must reflect the
// business or city space") a place shows what it is, by its kind
// (placeGlyph.ts: every park the tree, every café the cup; organisations by
// their type too), and an experience keeps its interest's glyph. The pin's
// colour is its pin group (pinGroup.ts), and the glyph is drawn white or ink
// to read on it. Pure, so the native map, SoftMap and the tests share it.
import type { PinGlyphName } from "@/components/ui/PinGlyph";
import { placeById, places } from "@/fixtures";
import { INTERESTS, type Interest } from "@/fixtures/catalog/interests";

import type { DiscoveryItem } from "../types/mapPresentation";
import { interestOfItem } from "./markerCategory";
import { placeKindGlyph } from "./placeGlyph";
import { INTEREST_PIN_GROUP, PIN_GROUP_TONE, pinGroupFor } from "./pinGroup";

export type MarkerGlyph = PinGlyphName;

/** Generic glyphs when an item has no interest (nothing in the fixtures). */
export const FALLBACK_GLYPH = {
  place: "map-marker",
  experience: "calendar",
  group: "account-group",
} as const satisfies Record<string, MarkerGlyph>;

export function markerIcon(
  item: Pick<DiscoveryItem, "kind" | "id"> & { category?: string },
): MarkerGlyph {
  if (item.kind === "group") return FALLBACK_GLYPH.group;
  if (item.kind === "place") {
    const byKind = placeKindGlyph(placeById(item.id)?.category);
    if (byKind) return byKind;
  }
  const interest = interestOfItem(item);
  if (interest) return interest.glyph as MarkerGlyph;
  return item.kind === "experience"
    ? FALLBACK_GLYPH.experience
    : FALLBACK_GLYPH.place;
}

/** Every glyph a pin can show, with the tone(s) it is drawn in: each
 *  interest's glyph in its pin group's tone (experiences, created ones
 *  too), each place's kind glyph in its kind's group's tone, and the
 *  fallbacks in both. The map registers these once, so filtering never
 *  re-copies pin images; a pair missing here would draw a pin without its
 *  glyph. */
export function allPinGlyphs(): {
  glyph: MarkerGlyph;
  tone: "light" | "dark";
}[] {
  const out: { glyph: MarkerGlyph; tone: "light" | "dark" }[] = [];
  const seen = new Set<string>();
  const add = (glyph: MarkerGlyph, tone: "light" | "dark") => {
    const key = `${glyph}:${tone}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ glyph, tone });
  };
  for (const i of INTERESTS as readonly Interest[])
    add(
      i.glyph as MarkerGlyph,
      PIN_GROUP_TONE[INTEREST_PIN_GROUP[i.id] ?? "social"],
    );
  for (const p of places) {
    const item = { kind: "place" as const, id: p.id };
    add(markerIcon(item), PIN_GROUP_TONE[pinGroupFor(item)]);
  }
  for (const g of Object.values(FALLBACK_GLYPH))
    for (const tone of ["light", "dark"] as const) add(g, tone);
  return out;
}
