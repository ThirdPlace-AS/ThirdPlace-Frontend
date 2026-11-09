import type { ImageSourcePropType } from "react-native";

import {
  LIBRARY_FULL,
  LIBRARY_SMALL,
  PLACEHOLDER,
  SWIPE_FULL,
  SWIPE_SMALL,
} from "./imageAssets.generated";

// ── Bundled image library (MOCK demo art — NOT a canonical media contract) ──
// BLOCKED_CONTRACT_GAP: ThirdPlace has no media-rights / asset model. These are
// curated photos from Unsplash (used under the Unsplash License), bundled locally
// (like the swipe deck's assets) so the UI renders real imagery offline and in the
// CI web bundle — no remote fetch, no per-entity media rows. Keys are semantic.
// People portraits stand in for user/host avatars; `venue-*` for place covers;
// `group-*` for group/activity covers; `market-*` for marketplace listings.
// None of these depict the real people or venues named in the fixtures.

// The photos themselves live in the generated manifest (WebP, two sizes plus a
// blurred preview each; scripts/build-image-manifest.js). Keys are semantic:
// person-* portraits, venue-* place covers, group-* activities, market-*.
export const LIBRARY = LIBRARY_FULL;

export type LibraryKey = keyof typeof LIBRARY;

/** Full photo (≤1080 px): galleries, cards, the photo viewer. */
export function libImage(key: LibraryKey): ImageSourcePropType {
  return LIBRARY_FULL[key];
}

/** Small photo (≤480 px, portraits 256 px): rails, thumbnails, rows, avatars. */
export function libThumb(key: LibraryKey): ImageSourcePropType {
  return LIBRARY_SMALL[key];
}

export type SwipeKey = keyof typeof SWIPE_FULL;

/** Sveip experience photos (full-screen cards keep 1350 px). */
export function swipeImage(key: SwipeKey): ImageSourcePropType {
  return SWIPE_FULL[key];
}

// Any bundled photo → its small file and its blurred preview, so components
// that only hold a source (experience photos, gallery pages) can ask for the
// lighter file or paint the preview while the photo decodes. Keyed by the
// require() value (an asset id on device, a module object in tests).
const SMALL_BY_SOURCE = new Map<unknown, ImageSourcePropType>();
// One `{ uri }` object per preview, built once (speed pass 0349): a new
// object on every render made expo-image treat the placeholder as changed.
const PREVIEW_BY_SOURCE = new Map<unknown, { uri: string }>();
function index<K extends string>(
  dir: string,
  full: Record<K, ImageSourcePropType>,
  small: Record<K, ImageSourcePropType>,
) {
  for (const key of Object.keys(full) as K[]) {
    const uri = PLACEHOLDER[`${dir}/${key}`];
    SMALL_BY_SOURCE.set(full[key], small[key]);
    if (uri) {
      const preview = { uri };
      PREVIEW_BY_SOURCE.set(full[key], preview);
      PREVIEW_BY_SOURCE.set(small[key], preview);
    }
  }
}
index("library", LIBRARY_FULL, LIBRARY_SMALL);
index("swipe", SWIPE_FULL, SWIPE_SMALL);

/** The small file for a bundled photo; other sources come back unchanged. */
export function smallImage<T>(source: T): T {
  return (SMALL_BY_SOURCE.get(source) as T | undefined) ?? source;
}

/** Blurred 16 px preview of a bundled photo as an expo-image `placeholder`
 * (painted on the first frames while the photo decodes), if it has one. The
 * same object comes back on every call. */
export function imagePreview(source: unknown): { uri: string } | undefined {
  return PREVIEW_BY_SOURCE.get(source);
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
  // Catalogue places (Phase 19) carry their own photos.
  photos?: readonly LibraryKey[];
}): readonly LibraryKey[] {
  return (
    place.photos ??
    PLACE_PHOTOS[place.id] ?? [coverForPlaceCategory(place.category)]
  );
}

export function coverForPlace(place: {
  id: string;
  category: string;
  photos?: readonly LibraryKey[];
}): LibraryKey {
  return photosForPlace(place)[0] ?? coverForPlaceCategory(place.category);
}
