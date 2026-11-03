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
  // Groups / activities
  "group-run": require("../../assets/library/group-run.jpg"),
  "group-wine": require("../../assets/library/group-wine.jpg"),
  "group-climb": require("../../assets/library/group-climb.jpg"),
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
