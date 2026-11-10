// Map pin glyphs (founder request 2026-11-06: every marker shows an icon that
// matches it). Phase 19 (founder 2026-11-08): every interest has its own pin
// glyph (src/fixtures/catalog/interests.ts, Material Community Icons plus the
// hand-drawn yarn), so a pin shows the glyph of the item's interest. Pure, so
// the native map, SoftMap and the tests share it.
import type { PinGlyphName } from "@/components/ui/PinGlyph";
import { INTERESTS, type Interest } from "@/fixtures/catalog/interests";

import type { DiscoveryItem } from "../types/mapPresentation";
import {
  MARKER_GLYPH_TONE,
  interestOfItem,
  type MarkerCategory,
} from "./markerCategory";

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
  const interest = interestOfItem(item);
  if (interest) return interest.glyph as MarkerGlyph;
  return item.kind === "experience"
    ? FALLBACK_GLYPH.experience
    : FALLBACK_GLYPH.place;
}

/** Every glyph a pin can show, with the tone(s) it is drawn in: each
 *  interest's glyph in its category's tone, and the fallbacks in both. The
 *  map registers these once, so filtering never re-copies pin images. */
export function allPinGlyphs(): {
  glyph: MarkerGlyph;
  tone: "light" | "dark";
}[] {
  const out = (INTERESTS as readonly Interest[]).map((i) => ({
    glyph: i.glyph as MarkerGlyph,
    tone: MARKER_GLYPH_TONE[i.category as MarkerCategory],
  }));
  for (const g of Object.values(FALLBACK_GLYPH))
    for (const tone of ["light", "dark"] as const) out.push({ glyph: g, tone });
  return out;
}
