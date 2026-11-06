// Map pin glyphs (founder request 2026-11-06: every marker shows an icon that
// matches it). Pure, so the native map, SoftMap and the tests share it.
// Presentational mapping over the MOCK fixtures (BLOCKED_CONTRACT_GAP: no
// canonical place taxonomy): a per-place glyph where the category alone would
// mislead (a sailing trip filed under "Vinbar"), experience glyphs from their
// tags, businesses take their place's glyph, groups a people glyph.
import type { Ionicons } from "@expo/vector-icons";

import { businessById, experienceById, placeById } from "@/fixtures";

import type { DiscoveryItem } from "../types/mapPresentation";

export type MarkerGlyph = keyof typeof Ionicons.glyphMap;

const PLACE_GLYPH: Record<string, MarkerGlyph> = {
  p1: "cafe",
  p2: "book",
  p3: "wine",
  p4: "bicycle",
  p5: "walk",
  p6: "color-palette",
  p7: "restaurant",
  p8: "leaf",
  p9: "body",
  p10: "boat",
  p11: "image",
  p12: "business",
  p13: "nutrition",
  p14: "cut",
};

const CATEGORY_GLYPH: Record<string, MarkerGlyph> = {
  Kafé: "cafe",
  Bokcafé: "book",
  Vinbar: "wine",
  Verksted: "hammer",
};

// First matching experience tag wins (order = specificity).
const TAG_GLYPH: [string, MarkerGlyph][] = [
  ["Kaffe", "cafe"],
  ["Bøker", "book"],
  ["Vin", "wine"],
  ["Løping", "footsteps"],
  ["Trening", "fitness"],
  ["Spill", "dice"],
  ["Foto", "camera"],
  ["Musikk", "musical-notes"],
  ["Mat", "restaurant"],
  ["Kunst", "color-palette"],
  ["Kultur", "color-palette"],
];

/** Generic glyphs when nothing more specific is known. */
export const FALLBACK_GLYPH = {
  place: "location",
  experience: "calendar",
  business: "storefront",
  group: "people",
} as const satisfies Record<string, MarkerGlyph>;

function placeGlyph(id: string, category?: string): MarkerGlyph | undefined {
  return (
    PLACE_GLYPH[id] ??
    (category ? CATEGORY_GLYPH[category] : undefined) ??
    CATEGORY_GLYPH[placeById(id)?.category ?? ""]
  );
}

export function markerIcon(
  item: Pick<DiscoveryItem, "kind" | "id"> & { category?: string },
): MarkerGlyph {
  switch (item.kind) {
    case "place":
      return placeGlyph(item.id, item.category) ?? FALLBACK_GLYPH.place;
    case "experience": {
      const tags = experienceById(item.id)?.tags ?? [];
      const hit = TAG_GLYPH.find(([t]) => tags.includes(t));
      return hit?.[1] ?? FALLBACK_GLYPH.experience;
    }
    case "business": {
      const b = businessById(item.id);
      return (b ? placeGlyph(b.placeId) : undefined) ?? FALLBACK_GLYPH.business;
    }
    case "group":
      return FALLBACK_GLYPH.group;
    default:
      return FALLBACK_GLYPH.place;
  }
}
