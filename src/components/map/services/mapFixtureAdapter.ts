// Adapts MOCK fixtures into DiscoveryItems per discovery mode. Pure + deterministic
// so it is unit-testable and safe. NO backend, NO ranking contract: "trending" is
// a demo sort by mock review count, "For You" / "Friends" are non-personalized
// demo shells (flagged `demo`). See docs/map/MAP_BLOCKERS.md.
//
// Founder (2026-11-06): every place and experience shows on the map. For deg,
// Utforsk, Trending and Lagret list places AND experiences; Live stays
// experiences only. Experience pins sit at their meeting point.
//
// Phase 19 (founder 2026-11-08): every list is nearest first, places and
// experiences mixed, measured from the person (src/lib/origin.ts); Trending
// keeps the most-reviewed first and a chosen rating sort (Sorter) wins.

import {
  areaFor,
  experiences,
  places as allPlaces,
  ratingOf,
  reviewsForExperience,
  type MockExperience,
  type MockPlace,
  type TimeWindow,
  placeRating,
} from "@/fixtures";

import {
  type DiscoveryItem,
  type DiscoveryMode,
  markerId,
  type ModeResult,
} from "../types/mapPresentation";

import {
  applyExperienceFilters,
  applyFilters,
  type MapFilters,
  type RatingSort,
} from "./mapFilters";
import { experienceMatchesQuery } from "./mapSearch";
import { goingLine } from "@/lib/going";
import { distanceMeters, formatDistance } from "@/lib/distance";
import { isPlaceOpen } from "@/lib/openingHours";
import { getOrigin, type Origin } from "@/lib/origin";

import {
  experienceType,
  experienceKindLabel,
  placeTypeLabel,
} from "./itemType";

// Each value is worked out once per item (speed pass 0347: the area lookup,
// the opening hours and the rating used to run twice), at one moment per run.
function placeToItem(
  p: MockPlace,
  origin: Origin,
  now: Date = new Date(),
): DiscoveryItem {
  const distanceM = distanceMeters(origin.coord, p.coord);
  const typeLabel = placeTypeLabel(p);
  const area = areaFor(p.coord).name;
  const open = isPlaceOpen(p, now);
  const rating = placeRating(p.id);
  return {
    markerId: markerId("place", p.id),
    kind: "place",
    id: p.id,
    coord: p.coord,
    category: p.category,
    title: p.name,
    // Phase 19: "Bedrift · Sandvika · 12 km", the distance measured from
    // the person (src/lib/origin.ts), not typed in.
    subtitle: `${typeLabel} · ${area} · ${formatDistance(distanceM)}`,
    distanceM,
    type: p.kind,
    typeLabel,
    area,
    meta: `${"kr".repeat(p.priceLevel)} · ${open ? "Åpent" : "Stengt"}`,
    openNow: open,
    rating: rating.score,
    reviewCount: rating.count,
    tags: p.vibes,
  };
}

function experienceToItem(e: MockExperience, origin: Origin): DiscoveryItem {
  const reviews = reviewsForExperience(e.id);
  const kindLabel = experienceKindLabel(e);
  const area = areaFor(e.meetingPoint.coord).name;
  return {
    markerId: markerId("experience", e.id),
    kind: "experience",
    id: e.id,
    coord: e.meetingPoint.coord,
    // Measured to the meeting point, like the pin (Phase 19).
    distanceM: distanceMeters(origin.coord, e.meetingPoint.coord),
    // Rating and count come from the experience's review list (as on its page).
    rating: ratingOf(reviews).score,
    reviewCount: reviews.length,
    category: "Opplevelse",
    title: e.title,
    // "Klatring · Lillestrøm · Lør 12:00": its activity (2026-11-09).
    subtitle: `${kindLabel} · ${area} · ${e.when}`,
    when: e.when,
    price: e.priceNok ? `${e.priceNok} kr` : "Gratis",
    type: experienceType(e),
    typeLabel: kindLabel,
    area,
    // Who is going (Phase 16): "5 skal · 3 plasser igjen"; the browse card
    // draws it live with the faces (GoingLine).
    meta: goingLine(e),
    tags: e.tags,
  };
}

const isLive = (e: MockExperience) =>
  e.status === "open" || e.status === "waitlist";
const isBookable = (e: MockExperience) => e.status !== "cancelled";

// Matches an experience against free text using the SAME matcher as the overlay
// search (title/host/tags), plus the literal "Opplevelse" category so typing the
// category still matches. Empty query matches all.
function experienceMatchesText(e: MockExperience, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === "") return true;
  return experienceMatchesQuery(e, q) || "opplevelse".includes(q);
}

export type AdapterInput = {
  mode: DiscoveryMode;
  // Places already narrowed by search + filters on the screen.
  places: MockPlace[];
  query: string;
  // markerIds the user has saved this session (in-memory demo).
  savedIds: readonly string[];
  // Time window filter (applies to experiences). null = any.
  time?: TimeWindow | null;
  // Only experiences with free spots (capacity - going > 0). Applies to
  // experiences. false = no constraint.
  hasSpots?: boolean;
  // The full filter set: experiences then go through the same facets as the
  // places (applyExperienceFilters); time/hasSpots above are then ignored.
  filters?: MapFilters;
  // Where distances are measured from (Phase 19); defaults to the current
  // origin (the phone, a picked area or Grünerløkka).
  origin?: Origin;
};

/** The list's order (Phase 19, founder 2026-11-08), set once after places
 *  and experiences are mixed: a chosen rating sort (Sorter) wins, then
 *  Trending's most-reviewed first, else nearest first. Ties go to the nearer
 *  item, then keep the fixture order. Returns a new array. */
export function orderItems(
  items: readonly DiscoveryItem[],
  mode: DiscoveryMode,
  ratingSort: RatingSort | null,
): DiscoveryItem[] {
  const dist = (i: DiscoveryItem) => i.distanceM ?? Infinity;
  const nearer = (a: DiscoveryItem, b: DiscoveryItem) => dist(a) - dist(b);
  const by =
    ratingSort === "best"
      ? (a: DiscoveryItem, b: DiscoveryItem) =>
          (b.rating ?? 0) - (a.rating ?? 0) || nearer(a, b)
      : ratingSort === "most" || mode === "trending"
        ? (a: DiscoveryItem, b: DiscoveryItem) =>
            (b.reviewCount ?? 0) - (a.reviewCount ?? 0) || nearer(a, b)
        : nearer;
  return items
    .map((item, i) => ({ item, i }))
    .sort((x, y) => by(x.item, y.item) || x.i - y.i)
    .map((x) => x.item);
}

// Resolves the active discovery mode into the items to show on the map + list,
// in list order (orderItems).
export function resultForMode(input: AdapterInput): ModeResult {
  const result = resolveMode(input);
  return {
    ...result,
    items: orderItems(
      result.items,
      input.mode,
      input.filters?.ratingSort ?? null,
    ),
  };
}

function resolveMode({
  mode,
  places,
  query,
  savedIds,
  time = null,
  hasSpots = false,
  filters,
  origin = getOrigin(),
}: AdapterInput): ModeResult {
  const now = new Date();
  // Saved shows everything saved, whatever the filters (below).
  if (mode === "saved") return savedResult(savedIds, origin, now);
  const placeItems = places.map((p) => placeToItem(p, origin, now));
  // Experiences after the same filters as the places (H5c: one pipeline
  // for the map and Sveip); without filters, the Når / Ledige plasser /
  // search filters only.
  const filteredExperiences = filterExperiences(
    query,
    time,
    hasSpots,
    filters,
    origin,
  );
  // Every bookable experience (not cancelled) for the modes that show all,
  // the live ones for Live and Venner; each item built once.
  const bookable = filteredExperiences.filter(isBookable);
  const allExperienceItems = bookable.map((e) => experienceToItem(e, origin));
  const liveItems = allExperienceItems.filter((_, i) => isLive(bookable[i]!));

  switch (mode) {
    case "explore":
      return {
        items: [...placeItems, ...allExperienceItems],
        demo: false,
        emptyMessage: "Ingenting her i dette området. Juster søk eller filtre.",
      };

    case "trending": {
      // Demo popularity = the length of each item's MOCK review list (places
      // and experiences alike), applied in orderItems. Not a real metric.
      return {
        items: [...placeItems, ...allExperienceItems],
        demo: false,
        emptyMessage: "Ingenting trender her akkurat nå.",
      };
    }

    case "live":
      return {
        items: liveItems,
        demo: false,
        emptyMessage: "Ingen opplevelser akkurat nå eller snart.",
      };

    case "forYou":
      return {
        items: [...placeItems, ...allExperienceItems],
        demo: true,
        emptyMessage: "Ingen anbefalinger å vise.",
      };

    case "friends":
      return {
        items: liveItems,
        demo: true,
        emptyMessage: "Ingen venneaktivitet å vise.",
      };
  }
}

// Experiences through the full filter set (Filtre), or without one through
// the Når / Ledige plasser / search filters only.
function filterExperiences(
  query: string,
  time: TimeWindow | null,
  hasSpots: boolean,
  filters: MapFilters | undefined,
  origin: Origin,
): MockExperience[] {
  return filters
    ? applyExperienceFilters(experiences, query, filters, origin)
    : experiences
        .filter((e) => time === null || e.day === time)
        .filter((e) => !hasSpots || e.capacity - e.going > 0)
        .filter((e) => experienceMatchesText(e, query));
}

// Saved items. A place or experience is picked by its id before an item is
// built (the list used to build all ~420 items to keep the saved few).
function savedPlaces(saved: ReadonlySet<string>): MockPlace[] {
  return allPlaces.filter((p) => saved.has(markerId("place", p.id)));
}
function savedExperiences(saved: ReadonlySet<string>): MockExperience[] {
  return experiences.filter(
    (e) => isBookable(e) && saved.has(markerId("experience", e.id)),
  );
}

function savedResult(
  savedIds: readonly string[],
  origin: Origin,
  now: Date,
): ModeResult {
  // Everything the user saved, regardless of the active filters/search or
  // an experience's status — hiding a saved item behind a filter reads as
  // "not saved". Cancelled experiences still drop out.
  const saved = new Set(savedIds);
  return {
    items: [
      ...savedPlaces(saved).map((p) => placeToItem(p, origin, now)),
      ...savedExperiences(saved).map((e) => experienceToItem(e, origin)),
    ],
    demo: false,
    emptyMessage: "Du har ikke lagret noe ennå.",
  };
}

/**
 * How many items the list will show for `mode` once `filters` are applied —
 * the same pipeline the map screen runs (filters → mode rules), so the Filtre
 * footer's "Vis N resultater" always equals the list (benchmark F11). Before,
 * the footer counted places only, so Når / Ledige plasser and the experience
 * modes never changed N.
 */
export function countResults({
  mode,
  allPlaces,
  query,
  filters,
  savedIds,
  origin = getOrigin(),
}: {
  mode: DiscoveryMode;
  allPlaces: MockPlace[];
  query: string;
  filters: MapFilters;
  savedIds: readonly string[];
  origin?: Origin;
}): number {
  // Counted without building or sorting the items (speed pass 0347: the
  // footer recounts on every change in Filtre), by the same rules as
  // resolveMode.
  if (mode === "saved") {
    const saved = new Set(savedIds);
    return savedPlaces(saved).length + savedExperiences(saved).length;
  }
  const exps = filterExperiences(
    query,
    filters.time,
    filters.hasSpots,
    filters,
    origin,
  );
  if (mode === "live" || mode === "friends") return exps.filter(isLive).length;
  return (
    applyFilters(allPlaces, query, filters, origin).length +
    exps.filter(isBookable).length
  );
}
