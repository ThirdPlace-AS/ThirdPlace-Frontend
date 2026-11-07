// Pure map-filter model + logic (MOCK — client-side only over fixtures, no
// contract). Kept free of React/Reanimated imports so it is unit-testable in
// jest and reusable by the sheet UI and the useMapFilters hook.

import {
  DURATION_STEPS,
  placeById,
  places,
  ratingOf,
  reviewsForExperience,
  type MockExperience,
  type MockPlace,
  type TimeWindow,
  type Vibe,
} from "@/fixtures";

import { experienceMatchesQuery, placeMatchesQuery } from "./mapSearch";

// Price range bounds derived from the MOCK fixtures (not a pricing contract).
export const PRICE_FLOOR = 0;
export const PRICE_CEIL = Math.max(...places.map((p) => p.priceNok));
export const PRICE_STEP = 10;
// Duration is picked as a "max" step; the last step (999) means "no upper cap".
export const DURATION_NO_CAP =
  DURATION_STEPS[DURATION_STEPS.length - 1]?.min ?? 999;

// Rating sort for the "Vurdering" section (demo ordering, not a ranking contract).
export type RatingSort = "best" | "most"; // høyest vurdert | flest anmeldelser

// Demo-only guest counts ("Who?"). No fixture backing → never filters results.
export type GuestCounts = {
  adults: number;
  children: number;
  infants: number;
  students: number;
  pensioners: number;
};
export const DEFAULT_GUESTS: GuestCounts = {
  adults: 0,
  children: 0,
  infants: 0,
  students: 0,
  pensioners: 0,
};

export type MapFilters = {
  types: string[]; // "Opplevelsestype" (OR match)
  whereArea: string | null; // "Where?" selected Oslo area — recenters, does NOT filter
  dateStart: string | null; // "When?" demo range start (ISO) — does NOT filter
  dateEnd: string | null; // "When?" demo range end (ISO) — does NOT filter
  guests: GuestCounts; // "Who?" demo guest counts — does NOT filter
  maxDistanceM: number | null; // null = any distance
  priceMin: number; // NOK, inclusive
  priceMax: number; // NOK, inclusive
  durationMaxMin: number; // minutes; DURATION_NO_CAP = any
  vibes: Vibe[]; // empty = any (OR match)
  minRating: number | null; // null = any
  ratingSort: RatingSort | null; // null = default order
  tags: string[]; // "Fasiliteter" (AND match)
  audiences: string[]; // "Passer for" (OR match)
  timeOfDay: string[]; // "Tid på dagen" keys (OR match)
  languages: string[]; // "Språk som tilbys" (OR match)
  accessibility: string[]; // "Tilgjengelighetsfunksjoner" (AND match)
  time: TimeWindow | null; // null = any (applies to experiences)
  openNowOnly: boolean;
  hasSpots: boolean; // ledige plasser — applies to experiences
};

export const DEFAULT_FILTERS: MapFilters = {
  types: [],
  whereArea: null,
  dateStart: null,
  dateEnd: null,
  guests: DEFAULT_GUESTS,
  maxDistanceM: null,
  priceMin: PRICE_FLOOR,
  priceMax: PRICE_CEIL,
  durationMaxMin: DURATION_NO_CAP,
  vibes: [],
  minRating: null,
  ratingSort: null,
  tags: [],
  audiences: [],
  timeOfDay: [],
  languages: [],
  accessibility: [],
  time: null,
  openNowOnly: false,
  hasSpots: false,
};

// Orders a filtered place list for the "Sorter" toggle. Demo ordering over MOCK
// rating/reviews — not a ranking contract. Returns a new array; null = unchanged.
export function sortPlaces(
  list: MockPlace[],
  sort: RatingSort | null,
): MockPlace[] {
  if (sort === null) return list;
  const by =
    sort === "best"
      ? (a: MockPlace, b: MockPlace) => b.rating - a.rating
      : (a: MockPlace, b: MockPlace) => b.reviews - a.reviews;
  return [...list].sort(by);
}

// Applies search text + place-level filters to the place list. Time and
// hasSpots are experience concepts and are applied by the discovery adapter.
export function applyFilters(
  all: MockPlace[],
  query: string,
  f: MapFilters,
): MockPlace[] {
  const q = query.trim().toLowerCase();
  return all.filter((p) => {
    if (f.types.length > 0 && !f.types.some((t) => p.types.includes(t)))
      return false;
    if (f.maxDistanceM !== null && p.distanceM > f.maxDistanceM) return false;
    if (p.priceNok < f.priceMin || p.priceNok > f.priceMax) return false;
    if (f.durationMaxMin < DURATION_NO_CAP && p.durationMin > f.durationMaxMin)
      return false;
    if (f.vibes.length > 0 && !f.vibes.some((v) => p.vibes.includes(v)))
      return false;
    if (f.minRating !== null && p.rating < f.minRating) return false;
    if (f.tags.length > 0 && !f.tags.every((t) => p.tags.includes(t)))
      return false;
    if (
      f.audiences.length > 0 &&
      !f.audiences.some((a) => p.audiences.includes(a))
    )
      return false;
    if (
      f.timeOfDay.length > 0 &&
      !f.timeOfDay.some((t) => p.timeOfDay.includes(t))
    )
      return false;
    if (
      f.languages.length > 0 &&
      !f.languages.some((l) => p.languages.includes(l))
    )
      return false;
    if (
      f.accessibility.length > 0 &&
      !f.accessibility.every((a) => p.accessibility.includes(a))
    )
      return false;
    if (f.openNowOnly && !p.openNow) return false;
    // Same matcher as the overlay search (name/category/tags) so submitting a
    // query from the overlay narrows the map exactly as the overlay showed it.
    if (q !== "" && !placeMatchesQuery(p, q)) return false;
    return true;
  });
}

// Count of active filters, Opplevelsestype included (drives the filter badge;
// nothing else on the map shows the chosen types).
// Demo-only axes (whereArea / date range / guests) are NOT counted — they don't
// narrow results, so they must not inflate the badge.
export function activeExtraFilterCount(f: MapFilters): number {
  return (
    (f.types.length > 0 ? 1 : 0) +
    (f.maxDistanceM !== null ? 1 : 0) +
    (f.priceMin > PRICE_FLOOR || f.priceMax < PRICE_CEIL ? 1 : 0) +
    (f.durationMaxMin < DURATION_NO_CAP ? 1 : 0) +
    (f.vibes.length > 0 ? 1 : 0) +
    (f.minRating !== null ? 1 : 0) +
    (f.ratingSort !== null ? 1 : 0) +
    (f.tags.length > 0 ? 1 : 0) +
    (f.audiences.length > 0 ? 1 : 0) +
    (f.timeOfDay.length > 0 ? 1 : 0) +
    (f.languages.length > 0 ? 1 : 0) +
    (f.accessibility.length > 0 ? 1 : 0) +
    (f.time !== null ? 1 : 0) +
    (f.openNowOnly ? 1 : 0) +
    (f.hasSpots ? 1 : 0)
  );
}

// ── Experiences (Phase 12 H5c: one filter pipeline for the map and Sveip) ──
// Every facet reads a field the experience has (H2) or, for venue facts
// (distance, facilities, accessibility), the place it is held at. An
// experience without a venue has no distance (it passes the distance cap)
// and no facilities or accessibility to match (it fails those). "Åpent nå"
// is opening hours, a place concept: experiences pass it.

const startHour = (when: string): number | null => {
  const m = /(\d{1,2}):\d{2}$/.exec(when);
  return m ? Number(m[1]) : null;
};

/** "morgen" before 12, "ettermiddag" 12–17, "kveld" after 17. */
export function timeOfDayFor(when: string): string | null {
  const h = startHour(when);
  if (h === null) return null;
  return h < 12 ? "morgen" : h < 17 ? "ettermiddag" : "kveld";
}

const lower = (list: readonly string[]) => list.map((x) => x.toLowerCase());

export function applyExperienceFilters(
  all: MockExperience[],
  query: string,
  f: MapFilters,
): MockExperience[] {
  const q = query.trim().toLowerCase();
  const out = all.filter((e) => {
    if (e.status === "cancelled") return false;
    const place = placeById(e.placeId);
    if (f.types.length > 0 && !f.types.some((t) => e.types.includes(t)))
      return false;
    if (f.maxDistanceM !== null && place && place.distanceM > f.maxDistanceM)
      return false;
    const price = e.priceNok ?? 0;
    if (price < f.priceMin || price > f.priceMax) return false;
    if (f.durationMaxMin < DURATION_NO_CAP && e.durationMin > f.durationMaxMin)
      return false;
    if (
      f.vibes.length > 0 &&
      !f.vibes.some((v) => (e.vibes as readonly string[]).includes(v))
    )
      return false;
    if (f.minRating !== null) {
      const { score, count } = ratingOf(reviewsForExperience(e.id));
      if (count === 0 || score < f.minRating) return false;
    }
    if (
      f.tags.length > 0 &&
      !(place && f.tags.every((t) => place.tags.includes(t)))
    )
      return false;
    if (
      f.audiences.length > 0 &&
      !f.audiences.some((a) => e.audiences.includes(a))
    )
      return false;
    if (f.timeOfDay.length > 0) {
      const tod = timeOfDayFor(e.when);
      if (tod === null || !f.timeOfDay.includes(tod)) return false;
    }
    if (f.languages.length > 0) {
      const have = lower(e.languages);
      if (!lower(f.languages).some((l) => have.includes(l))) return false;
    }
    if (
      f.accessibility.length > 0 &&
      !(place && f.accessibility.every((a) => place.accessibility.includes(a)))
    )
      return false;
    if (f.time !== null && e.day !== f.time) return false;
    if (f.hasSpots && e.capacity - e.going <= 0) return false;
    if (q !== "" && !experienceMatchesQuery(e, q) && !"opplevelse".includes(q))
      return false;
    return true;
  });
  return sortExperiences(out, f.ratingSort);
}

/** "Sorter" for experiences: by review score or count (demo ordering). */
export function sortExperiences(
  list: MockExperience[],
  sort: RatingSort | null,
): MockExperience[] {
  if (sort === null) return list;
  const r = (e: MockExperience) => ratingOf(reviewsForExperience(e.id));
  return [...list].sort((a, b) =>
    sort === "best" ? r(b).score - r(a).score : r(b).count - r(a).count,
  );
}
