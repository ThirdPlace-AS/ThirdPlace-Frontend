// Adapts MOCK fixtures into DiscoveryItems per discovery mode. Pure + deterministic
// so it is unit-testable and safe. NO backend, NO ranking contract: "trending" is
// a demo sort by mock review count, "For You" / "Friends" are non-personalized
// demo shells (flagged `demo`). See docs/map/MAP_BLOCKERS.md.

import {
  experiences,
  MAP_CENTER,
  placeById,
  places as allPlaces,
  type MockExperience,
  type MockPlace,
  type TimeWindow,
} from "@/fixtures";

import {
  type DiscoveryItem,
  type DiscoveryMode,
  markerId,
  type ModeResult,
} from "../types/mapPresentation";

import { applyFilters, type MapFilters } from "./mapFilters";
import { experienceMatchesQuery } from "./mapSearch";

function placeToItem(p: MockPlace): DiscoveryItem {
  return {
    markerId: markerId("place", p.id),
    kind: "place",
    id: p.id,
    coord: p.coord,
    category: p.category,
    title: p.name,
    subtitle: p.distance,
    meta: `${"kr".repeat(p.priceLevel)} · ${p.openNow ? "Åpent" : "Stengt"}`,
    rating: p.rating,
    reviewCount: p.reviews,
    tags: p.vibes,
  };
}

function experienceToItem(e: MockExperience): DiscoveryItem {
  const coord = placeById(e.placeId)?.coord ?? MAP_CENTER;
  return {
    markerId: markerId("experience", e.id),
    kind: "experience",
    id: e.id,
    coord,
    category: "Opplevelse",
    title: e.title,
    subtitle: e.when,
    meta: `${e.going}/${e.capacity} påmeldt`,
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
};

// Resolves the active discovery mode into the items to show on the map + list.
export function resultForMode({
  mode,
  places,
  query,
  savedIds,
  time = null,
  hasSpots = false,
}: AdapterInput): ModeResult {
  const placeItems = places.map(placeToItem);
  const liveItems = experiences
    .filter((e) => e.status === "open" || e.status === "waitlist")
    .filter((e) => time === null || e.day === time)
    .filter((e) => !hasSpots || e.capacity - e.going > 0)
    .filter((e) => experienceMatchesText(e, query))
    .map(experienceToItem);

  switch (mode) {
    case "explore":
      return {
        items: placeItems,
        demo: false,
        emptyMessage: "Ingen steder i dette området. Juster søk eller filtre.",
      };

    case "trending":
      // Demo popularity = mock review count. Not a real metric.
      return {
        items: [...places]
          .sort((a, b) => b.reviews - a.reviews)
          .map(placeToItem),
        demo: false,
        emptyMessage: "Ingenting trender her akkurat nå.",
      };

    case "live":
      return {
        items: liveItems,
        demo: false,
        emptyMessage: "Ingen opplevelser akkurat nå eller snart.",
      };

    case "forYou":
      return {
        items: placeItems,
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
        ...allPlaces.map(placeToItem),
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
  }).items.length;
}
