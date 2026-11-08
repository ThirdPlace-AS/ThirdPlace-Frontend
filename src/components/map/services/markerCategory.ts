// Marker categories (Phase 12 H3b). Founder (2026-11-06): every marker gets its
// own colour by the category it fits; since Phase 19 (founder 2026-11-08) that
// is the category of the item's interest (src/fixtures/catalog/interests.ts),
// and markerIcon.ts takes the interest's glyph. Pure; shared by the native
// map, the SoftMap fallback and the browse cards. Colours: `mapPalette` in
// src/theme/tokens.js.
import type { IconName } from "@/components/ui";
import { businessById, experienceById, placeById } from "@/fixtures";
import {
  interestById,
  interestForLabel,
  type Interest,
} from "@/fixtures/catalog/interests";
import { mapPalette } from "@/theme";

import type { DiscoveryItem } from "../types/mapPresentation";

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
export const MARKER_FILTER_ICON: Record<MarkerCategory, IconName> = {
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

// Experiences made in Legg til have no interest yet: a tag or their category
// picks one, so their pin still has a colour and glyph that fit.
const EXPERIENCE_CATEGORY_INTEREST: Record<string, string> = {
  "Kurs & smaking": "matlaging",
  Musikk: "konserter",
  "Tur & friluft": "friluftsliv",
  "Kunst & kultur": "kunst",
  "Sport & trening": "styrketrening",
  Sosialt: "diskusjon",
};

function experienceInterest(id: string): Interest | undefined {
  const exp = experienceById(id);
  if (!exp) return undefined;
  return (
    interestById(exp.interestId) ??
    exp.tags.map(interestForLabel).find((i) => i !== undefined) ??
    interestById(EXPERIENCE_CATEGORY_INTEREST[exp.category])
  );
}

/** The interest an item stands for on the map. Places, experiences and
 *  events carry one; a business shows its place's; groups have no pin. */
export function interestOfItem(
  item: Pick<DiscoveryItem, "kind" | "id">,
): Interest | undefined {
  switch (item.kind) {
    case "place":
      return interestById(placeById(item.id)?.interestId);
    case "experience":
      return experienceInterest(item.id);
    case "business": {
      const b = businessById(item.id);
      return b ? interestById(placeById(b.placeId)?.interestId) : undefined;
    }
    default:
      return undefined;
  }
}

export function markerCategoryFor(
  item: Pick<DiscoveryItem, "kind" | "id"> & { category?: string },
): MarkerCategory {
  return (
    interestOfItem(item)?.category ??
    (item.kind === "place" || item.kind === "business" ? "kafe" : "sosialt")
  );
}
