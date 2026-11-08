// Adapts MOCK fixtures into DiscoveryItems per discovery mode. Pure + deterministic
// so it is unit-testable and safe. NO backend, NO ranking contract: "trending" is
// a demo sort by mock review count, "For You" / "Friends" are non-personalized
// demo shells (flagged `demo`). See docs/map/MAP_BLOCKERS.md.
//
// Founder (2026-11-06): every place and experience shows on the map. For deg,
// Utforsk, Trending and Lagret list places AND experiences; Live stays
// experiences only. Experience pins sit at their meeting point.

import {
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
} from "./mapFilters";
import { experienceMatchesQuery } from "./mapSearch";
import { goingLine } from "@/lib/going";
import { distanceLabelFor, getOrigin, type Origin } from "@/lib/origin";

function placeToItem(p: MockPlace, origin: Origin): DiscoveryItem {
  return {
    markerId: markerId("place", p.id),
    kind: "place",
    id: p.id,
    coord: p.coord,
    category: p.category,
    title: p.name,
    // Measured from the person (src/lib/origin.ts), not typed in.
    subtitle: distanceLabelFor(p.coord, origin),
    meta: `${"kr".repeat(p.priceLevel)} · ${p.openNow ? "Åpent" : "Stengt"}`,
    rating: placeRating(p.id).score,
    reviewCount: placeRating(p.id).count,
    tags: p.vibes,
  };
}

function experienceToItem(e: MockExperience): DiscoveryItem {
  return {
    markerId: markerId("experience", e.id),
    kind: "experience",
    id: e.id,
    coord: e.meetingPoint.coord,
    // Rating and count come from the experience's review list (as on its page).
    rating: ratingOf(reviewsForExperience(e.id)).score,
    reviewCount: reviewsForExperience(e.id).length,
    category: "Opplevelse",
    title: e.title,
    subtitle: e.when,
    // Who is going (Phase 16): "5 skal · 3 plasser igjen"; the browse card
    // draws it live with the faces (GoingLine).
    meta: goingLine(e),
    tags: e.tags,
  };
}

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

// Resolves the active discovery mode into the items to show on the map + list.
export function resultForMode({
  mode,
  places,
  query,
  savedIds,
  time = null,
  hasSpots = false,
  filters,
  origin = getOrigin(),
}: AdapterInput): ModeResult {
  const placeItems = places.map((p) => placeToItem(p, origin));
  // Experiences after the same filters as the places (H5c: one pipeline
  // for the map and Sveip); without filters, the Når / Ledige plasser /
  // search filters only.
  const filteredExperiences = filters
    ? applyExperienceFilters(experiences, query, filters)
    : experiences
        .filter((e) => time === null || e.day === time)
        .filter((e) => !hasSpots || e.capacity - e.going > 0)
        .filter((e) => experienceMatchesText(e, query));
  const liveItems = filteredExperiences
    .filter((e) => e.status === "open" || e.status === "waitlist")
    .map(experienceToItem);
  // Every bookable experience (not cancelled), for the modes that show all.
  const allExperienceItems = filteredExperiences
    .filter((e) => e.status !== "cancelled")
    .map(experienceToItem);

  switch (mode) {
    case "explore":
      return {
        items: [...placeItems, ...allExperienceItems],
        demo: false,
        emptyMessage: "Ingenting her i dette området. Juster søk eller filtre.",
      };

    case "trending": {
      // Demo popularity = the length of each item's MOCK review list (places
      // and experiences alike). Not a real metric.
      const reviewCount = (i: DiscoveryItem) => i.reviewCount ?? 0;
      return {
        items: [...placeItems, ...allExperienceItems].sort(
          (a, b) => reviewCount(b) - reviewCount(a),
        ),
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

    case "saved": {
      // Everything the user saved, regardless of the active filters/search or
      // an experience's status — hiding a saved item behind a filter reads as
      // "not saved". Cancelled experiences still drop out.
      const saved = [
        ...allPlaces.map((p) => placeToItem(p, origin)),
        ...experiences
          .filter((e) => e.status !== "cancelled")
          .map(experienceToItem),
      ].filter((i) => savedIds.includes(i.markerId));
      return {
        items: saved,
        demo: false,
        emptyMessage: "Du har ikke lagret noe ennå.",
      };
    }
  }
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
}: {
  mode: DiscoveryMode;
  allPlaces: MockPlace[];
  query: string;
  filters: MapFilters;
  savedIds: readonly string[];
}): number {
  return resultForMode({
    mode,
    places: applyFilters(allPlaces, query, filters),
    query,
    savedIds,
    time: filters.time,
    hasSpots: filters.hasSpots,
    filters,
  }).items.length;
}
