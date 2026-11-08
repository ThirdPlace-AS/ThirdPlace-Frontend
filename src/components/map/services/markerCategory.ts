// Marker categories (Phase 12 H3b). Founder (2026-11-06): every marker gets its
// own colour by the category it fits. The fixtures' place categories are too
// coarse (a river walk is filed as "Kafé"), so each place and experience maps
// to one of eight marker categories by id, with category/tag fallbacks for
// items added later. Pure; shared by the native map, the SoftMap fallback and
// the browse cards. Colours: src/theme/tokens.js \`mapPalette\`.
import { experienceById, placeById } from "@/fixtures";
import { mapPalette } from "@/theme";

import type { DiscoveryItem } from "../types/mapPresentation";
import type { MarkerGlyph } from "./markerIcon";

export const MARKER_CATEGORIES = [
  "kafe",
  "mat",
  "sosialt",
  "natur",
  "trening",
  "kultur",
  "kreativt",
  "velvaere",
] as const;
export type MarkerCategory = (typeof MARKER_CATEGORIES)[number];

export const MARKER_LABEL: Record<MarkerCategory, string> = {
  kafe: "Kafé",
  mat: "Mat og drikke",
  sosialt: "Sosialt og spill",
  natur: "Natur og tur",
  trening: "Trening",
  kultur: "Bøker og kultur",
  kreativt: "Kreativt og verksted",
  velvaere: "Velvære",
};

/** Outline icon for each category in Filtre's "Kategori" group (founder
 *  2026-11-08: drawn like the sheet's other groups, Opplevelsestype and the
 *  rest, so the same icon families as the pins and the experience types). */
export const MARKER_FILTER_ICON: Record<MarkerCategory, MarkerGlyph> = {
  kafe: "cafe-outline",
  mat: "restaurant-outline",
  sosialt: "dice-outline",
  natur: "trail-sign-outline",
  trening: "barbell-outline",
  kultur: "book-outline",
  kreativt: "brush-outline",
  velvaere: "flower-outline",
};

/** Glyph colour on the pin fill: whichever reads at ≥ 3:1 (tested). */
export const MARKER_GLYPH_TONE: Record<MarkerCategory, "light" | "dark"> = {
  kafe: "light",
  mat: "dark",
  sosialt: "dark",
  natur: "light",
  trening: "dark",
  kultur: "light",
  kreativt: "dark",
  velvaere: "light",
};

export function markerFill(c: MarkerCategory): string {
  return mapPalette[c] ?? mapPalette.velvaere ?? "";
}

const PLACE_MARKER: Record<string, MarkerCategory> = {
  p1: "kafe",
  p2: "kultur",
  p3: "mat",
  p4: "kreativt",
  p5: "natur",
  p6: "kreativt",
  p7: "mat",
  p8: "natur",
  p9: "velvaere",
  p10: "natur",
  p11: "kultur",
  p12: "kultur",
  p13: "mat",
  p14: "velvaere",
};

const PLACE_CATEGORY_MARKER: Record<string, MarkerCategory> = {
  Kafé: "kafe",
  Bokcafé: "kultur",
  Vinbar: "mat",
  Verksted: "kreativt",
};

const EXPERIENCE_CATEGORY_MARKER: Record<string, MarkerCategory> = {
  "Kurs & smaking": "mat",
  Musikk: "kultur",
  "Tur & friluft": "natur",
  "Kunst & kultur": "kultur",
  "Sport & trening": "trening",
  Sosialt: "sosialt",
};

// A tag that pins an experience down better than its broad category.
const TAG_MARKER: [string, MarkerCategory][] = [
  ["Kaffe", "kafe"],
  ["Foto", "kreativt"],
  ["Løping", "trening"],
  ["Vin", "mat"],
  ["Bøker", "kultur"],
  ["Spill", "sosialt"],
];

export function markerCategoryFor(
  item: Pick<DiscoveryItem, "kind" | "id"> & { category?: string },
): MarkerCategory {
  if (item.kind === "place") {
    return (
      PLACE_MARKER[item.id] ??
      PLACE_CATEGORY_MARKER[placeById(item.id)?.category ?? ""] ??
      "kafe"
    );
  }
  if (item.kind === "experience") {
    const exp = experienceById(item.id);
    const byTag = TAG_MARKER.find(([t]) => exp?.tags.includes(t))?.[1];
    return (
      byTag ?? EXPERIENCE_CATEGORY_MARKER[exp?.category ?? ""] ?? "sosialt"
    );
  }
  return item.kind === "group" ? "sosialt" : "kafe";
}
