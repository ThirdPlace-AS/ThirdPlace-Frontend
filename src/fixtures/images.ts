import type { ImageSourcePropType } from "react-native";

// ── Bundled image library (MOCK demo art — NOT a canonical media contract) ──
// BLOCKED_CONTRACT_GAP: ThirdPlace has no media-rights / asset model. These are
// curated photos from Unsplash (used under the Unsplash License), bundled locally
// (like the swipe deck's assets) so the UI renders real imagery offline and in the
// CI web bundle — no remote fetch, no per-entity media rows. Keys are semantic.
// People portraits stand in for user/host avatars; `venue-*` for place covers;
// `group-*` for group/activity covers; `market-*` for marketplace listings.
// None of these depict the real people or venues named in the fixtures.

export const LIBRARY = {
  // People (avatar portraits)
  "person-ola": require("../../assets/library/person-ola.jpg"),
  "person-maria": require("../../assets/library/person-maria.jpg"),
  "person-jonas": require("../../assets/library/person-jonas.jpg"),
  "person-ase": require("../../assets/library/person-ase.jpg"),
  "person-sofie": require("../../assets/library/person-sofie.jpg"),
  "person-erik": require("../../assets/library/person-erik.jpg"),
  "person-nina": require("../../assets/library/person-nina.jpg"),
  // Venues / places
  "venue-cafe": require("../../assets/library/venue-cafe.jpg"),
  "venue-bar": require("../../assets/library/venue-bar.jpg"),
  "venue-restaurant": require("../../assets/library/venue-restaurant.jpg"),
  "venue-books": require("../../assets/library/venue-books.jpg"),
  "venue-gallery": require("../../assets/library/venue-gallery.jpg"),
  "venue-outdoor": require("../../assets/library/venue-outdoor.jpg"),
  "venue-workshop": require("../../assets/library/venue-workshop.jpg"),
  "venue-music": require("../../assets/library/venue-music.jpg"),
  // Phase 11 (2026-11-06): second photos per place (credits in
  // assets/library/CREDITS.md)
  "venue-cafe-2": require("../../assets/library/venue-cafe-2.jpg"),
  "venue-books-2": require("../../assets/library/venue-books-2.jpg"),
  "venue-bar-2": require("../../assets/library/venue-bar-2.jpg"),
  "bike-repair-1": require("../../assets/library/bike-repair-1.jpg"),
  "bike-repair-2": require("../../assets/library/bike-repair-2.jpg"),
  "river-1": require("../../assets/library/river-1.jpg"),
  "river-2": require("../../assets/library/river-2.jpg"),
  "pottery-1": require("../../assets/library/pottery-1.jpg"),
  "pottery-2": require("../../assets/library/pottery-2.jpg"),
  "food-1": require("../../assets/library/food-1.jpg"),
  "garden-1": require("../../assets/library/garden-1.jpg"),
  "garden-2": require("../../assets/library/garden-2.jpg"),
  "yoga-1": require("../../assets/library/yoga-1.jpg"),
  "yoga-2": require("../../assets/library/yoga-2.jpg"),
  "sail-1": require("../../assets/library/sail-1.jpg"),
  "sail-2": require("../../assets/library/sail-2.jpg"),
  "gallery-2": require("../../assets/library/gallery-2.jpg"),
  "arch-1": require("../../assets/library/arch-1.jpg"),
  "arch-2": require("../../assets/library/arch-2.jpg"),
  "spice-1": require("../../assets/library/spice-1.jpg"),
  "spice-2": require("../../assets/library/spice-2.jpg"),
  "salon-1": require("../../assets/library/salon-1.jpg"),
  "salon-2": require("../../assets/library/salon-2.jpg"),
  // Groups / activities
  "group-run": require("../../assets/library/group-run.jpg"),
  "group-wine": require("../../assets/library/group-wine.jpg"),
  "group-climb": require("../../assets/library/group-climb.jpg"),
  "group-coffee": require("../../assets/library/group-coffee.jpg"),
  "group-books": require("../../assets/library/group-books.jpg"),
  "group-wine-2": require("../../assets/library/group-wine-2.jpg"),
  // Marketplace listings
  "market-ceramics": require("../../assets/library/market-ceramics.jpg"),
  "market-plant": require("../../assets/library/market-plant.jpg"),
  "market-bike": require("../../assets/library/market-bike.jpg"),
  "market-vinyl": require("../../assets/library/market-vinyl.jpg"),
} as const;

export type LibraryKey = keyof typeof LIBRARY;

export function libImage(key: LibraryKey): ImageSourcePropType {
  return LIBRARY[key];
}

// Map a place category to a sensible library cover (MOCK — presentational only).
export function coverForPlaceCategory(category: string): LibraryKey {
  switch (category) {
    case "Kafé":
      return "venue-cafe";
    case "Bokcafé":
      return "venue-books";
    case "Vinbar":
      return "venue-bar";
    case "Verksted":
      return "venue-workshop";
    default:
      return "venue-cafe";
  }
}

// Per-place gallery (MOCK — presentational only), at least two photos each
// (founder request 2026-11-06). The first is the cover. Falls back to the
// category cover for any place not listed here.
const PLACE_PHOTOS: Record<string, readonly LibraryKey[]> = {
  p1: ["venue-cafe", "venue-cafe-2"],
  p2: ["venue-books", "venue-books-2"],
  p3: ["venue-bar", "venue-bar-2"],
  p4: ["bike-repair-1", "bike-repair-2", "market-bike"],
  p5: ["river-1", "river-2", "venue-outdoor"],
  p6: ["pottery-2", "market-ceramics", "pottery-1"],
  p7: ["food-1", "venue-restaurant"],
  p8: ["garden-1", "garden-2", "market-plant"],
  p9: ["yoga-1", "yoga-2"],
  p10: ["sail-1", "sail-2"],
  p11: ["venue-gallery", "gallery-2"],
  p12: ["arch-1", "arch-2"],
  p13: ["spice-1", "spice-2"],
  p14: ["salon-1", "salon-2"],
};

export function photosForPlace(place: {
  id: string;
  category: string;
}): readonly LibraryKey[] {
  return PLACE_PHOTOS[place.id] ?? [coverForPlaceCategory(place.category)];
}

export function coverForPlace(place: {
  id: string;
  category: string;
}): LibraryKey {
  return photosForPlace(place)[0] ?? coverForPlaceCategory(place.category);
}
