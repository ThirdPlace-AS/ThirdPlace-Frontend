// Pin colours by what a pin is (user 2026-11-11: "the colors need to change
// too", then "familiar map colours", like Apple and Google Maps). Eight pin
// groups, each one fill from `mapPalette` (src/theme/tokens.js): a place takes
// its kind's group (services/placeGlyph.ts: every park green, every café
// orange), an experience its activity's (a paddling trip blue like the
// water, a jazz night purple). Supersedes Phase 12 H3b's colours by interest
// category; Filtre's Kategori still goes by the interest's category
// (markerCategory.ts). Pure, so the native map, SoftMap, the mini pin and
// the tests share it.
import { placeById } from "@/fixtures";
import { mapPalette } from "@/theme";

import type { DiscoveryItem } from "../types/mapPresentation";
import { interestOfItem } from "./markerCategory";
import { placeKindGroup } from "./placeGlyph";

export const PIN_GROUPS = [
  "eat",
  "night",
  "social",
  "nature",
  "water",
  "sport",
  "culture",
  "wellness",
] as const;
export type PinGroup = (typeof PIN_GROUPS)[number];

/** Names for the dev pin sheet (thirdplace://_sandbox/pins); no key shows
 *  in the product (user 2026-11-11: the icon says what a pin is). */
export const PIN_GROUP_LABEL: Record<PinGroup, string> = {
  eat: "Mat og kafé",
  night: "Ut på kvelden",
  social: "Sosialt og handel",
  nature: "Natur",
  water: "Vann",
  sport: "Sport",
  culture: "Kultur og skaping",
  wellness: "Velvære",
};

/** Glyph colour on the fill: whichever reads at ≥ 3:1 (tested). */
export const PIN_GROUP_TONE: Record<PinGroup, "light" | "dark"> = {
  eat: "light",
  night: "light",
  social: "dark",
  nature: "light",
  water: "light",
  sport: "dark",
  culture: "light",
  wellness: "light",
};

export function pinGroupFill(g: PinGroup): string {
  return mapPalette[g] ?? mapPalette.social ?? "";
}

/** Every interest's group: what an experience of that activity is. The
 *  interest's own category (kafe, mat, …) stays Filtre's Kategori. */
export const INTEREST_PIN_GROUP: Record<string, PinGroup> = {
  // Eat
  kaffe: "eat",
  bakst: "eat",
  te: "eat",
  mat: "eat",
  matlaging: "eat",
  vegansk: "eat",
  kortreist: "eat",
  // Night out
  vin: "night",
  ol: "night",
  jazz: "night",
  konserter: "night",
  "klubb-og-dj": "night",
  vinyl: "night",
  standup: "night",
  // Social
  brettspill: "social",
  sjakk: "social",
  diskusjon: "social",
  shopping: "social",
  quiz: "social",
  gaming: "social",
  rollespill: "social",
  sprakkafe: "social",
  frivillighet: "social",
  biljard: "social",
  bowling: "social",
  // Nature
  friluftsliv: "nature",
  "sopp-tur": "nature",
  dyreliv: "nature",
  astronomi: "nature",
  baerekraft: "nature",
  hund: "nature",
  "hage-og-dyrking": "nature",
  // Water
  fiske: "water",
  vannsport: "water",
  svomming: "water",
  kajakk: "water",
  seiling: "water",
  bading: "water",
  // Sport
  loping: "sport",
  fotball: "sport",
  padel: "sport",
  klatring: "sport",
  sykkel: "sport",
  dans: "sport",
  kampsport: "sport",
  tennis: "sport",
  basket: "sport",
  volleyball: "sport",
  bordtennis: "sport",
  ski: "sport",
  langrenn: "sport",
  skoyter: "sport",
  styrketrening: "sport",
  skate: "sport",
  // Culture and making
  litteratur: "culture",
  klassisk: "culture",
  film: "culture",
  teater: "culture",
  museer: "culture",
  historie: "culture",
  arkitektur: "culture",
  byvandring: "culture",
  "kor-og-sang": "culture",
  poesi: "culture",
  skriving: "culture",
  podcast: "culture",
  filosofi: "culture",
  fotografi: "culture",
  keramikk: "culture",
  strikking: "culture",
  kunst: "culture",
  design: "culture",
  verksted: "culture",
  tech: "culture",
  tegning: "culture",
  maling: "culture",
  mote: "culture",
  interior: "culture",
  planter: "culture",
  // Wellness
  yoga: "wellness",
  velvaere: "wellness",
  badstue: "wellness",
  meditasjon: "wellness",
  pilates: "wellness",
};

/** A map item's pin group: a place by its kind (its interest's group when
 *  the kind is unknown), an experience by its activity. */
export function pinGroupFor(
  item: Pick<DiscoveryItem, "kind" | "id"> & { category?: string },
): PinGroup {
  if (item.kind === "place") {
    const byKind = placeKindGroup(placeById(item.id)?.category);
    if (byKind) return byKind;
  }
  const interest = interestOfItem(item);
  return (interest && INTEREST_PIN_GROUP[interest.id]) ?? "social";
}
