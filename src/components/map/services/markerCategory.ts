// Marker categories (Phase 12 H3b; since Phase 19, founder 2026-11-08, the
// category of the item's interest, src/fixtures/catalog/interests.ts). They
// are Filtre's "Kategori" (and the InterestPicker's and catalogue screens'
// headings): a place or experience is found under the interest it serves.
// Pin colours no longer come from here: since 2026-11-11 (user: "the colors
// need to change too") a pin's colour is its pin group, what it is
// (pinGroup.ts). Pure.
import type { IconName } from "@/components/ui";
import { experienceById, placeById } from "@/fixtures";
import {
  interestById,
  interestForLabel,
  type Interest,
} from "@/fixtures/catalog/interests";

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
 *  events carry one; groups have no pin. */
export function interestOfItem(
  item: Pick<DiscoveryItem, "kind" | "id">,
): Interest | undefined {
  switch (item.kind) {
    case "place":
      return interestById(placeById(item.id)?.interestId);
    case "experience":
      return experienceInterest(item.id);
    default:
      return undefined;
  }
}

export function markerCategoryFor(
  item: Pick<DiscoveryItem, "kind" | "id"> & { category?: string },
): MarkerCategory {
  return (
    interestOfItem(item)?.category ??
    (item.kind === "place" ? "kafe" : "sosialt")
  );
}
