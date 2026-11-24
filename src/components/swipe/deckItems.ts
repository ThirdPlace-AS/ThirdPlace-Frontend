// One card model for Sveip (Phase 12 H5d, user 2026-11-06: places on Sveip
// must look and work exactly like experiences and For deg). An experience or
// a place becomes a DeckItem with the same fields the card draws — photos,
// title, three info lines, chips — so the deck, the gestures, the actions and
// the card are shared. Pure (no React) → unit-testable.
//
// Experiences show a places-left line, never a status word (founder
// 2026-11-06: no open/closed indicators on experiences); places keep their
// opening hours ("Åpent nå" / "Stengt nå") because that is what they are.
import type { ImageSourcePropType } from "react-native";

import type { IconName } from "@/components/ui";
import { goingLine } from "@/lib/going";
import {
  experienceTypeLabel,
  placeTypeLabel,
} from "@/components/map/services/itemType";
import { resultForMode } from "@/components/map/services/mapFixtureAdapter";
import type { DiscoveryMode } from "@/components/map/types/mapPresentation";
import {
  applyExperienceFilters,
  applyFilters,
  type MapFilters,
} from "@/components/map/services/mapFilters";
import {
  areaFor,
  chatForExperience,
  chatForPlace,
  experienceById,
  experiences,
  organizationForPlace,
  placeById,
  places,
  ratingOf,
  reviewsForPlace,
  type MockExperience,
  type MockPlace,
} from "@/fixtures";
import { libImage, photosForPlace } from "@/fixtures/images";
import { formatRating } from "@/lib/format";
import { isPlaceOpen } from "@/lib/openingHours";
import { distanceMeters } from "@/lib/distance";
import { distanceLabelFor, getOrigin, type Origin } from "@/lib/origin";
import { media } from "@/theme";
import { whenLabel } from "@/lib/whenLabel";

export type DeckKind = "experience" | "place";

/** An info line. `goingId`: the experience whose "who is going" the card
 *  draws live in its place (faces + "N skal", Phase 16); `text` is the
 *  same line from the fixtures. */
export type DeckLine = { icon: IconName; text: string; goingId?: string };

export type DeckItem = {
  kind: DeckKind;
  id: string;
  title: string;
  photos: ImageSourcePropType[];
  /** Per-photo bottom scrim tint (parallel to photos). */
  scrims: string[];
  lines: DeckLine[];
  /** Interests / vibes, shown as pills on a later photo (pagesForPhoto). */
  chips: string[];
  /** The fixture's short "about" text, shown on the card's second photo. */
  about: string;
  /** The chat a like offers to join. */
  chatId?: string;
  /** Second line of the "Bli med i samtalen" sheet. */
  subtitle: string;
};

/** Who is going and places left: "5 skal · 3 plasser igjen" (Phase 16:
 *  "N skal" counts everyone; the faces are the people who opted in). */
export function spotsLine(e: Pick<MockExperience, "capacity" | "going">) {
  return goingLine(e);
}

export function experienceToDeckItem(e: MockExperience): DeckItem {
  const place = placeById(e.placeId);
  return {
    kind: "experience",
    id: e.id,
    title: e.title,
    photos: e.photos,
    scrims: e.scrims,
    lines: [
      {
        icon: "location-outline",
        text: place
          ? `${place.name} · ${distanceLabelFor(place.coord)}`
          : e.meetingPoint.name,
      },
      {
        icon: "calendar-outline",
        // An event says so ("Festival · Lør 10:00", Phase 19).
        text:
          e.format === "event"
            ? `${experienceTypeLabel(e)} · ${whenLabel(e)}`
            : whenLabel(e),
      },
      {
        icon: "people-outline",
        text: spotsLine(e),
        goingId: e.id,
      },
    ],
    chips: e.tags,
    about: e.about,
    chatId: chatForExperience(e.id)?.id,
    subtitle: whenLabel(e),
  };
}

// Places have no per-photo scrim samples; the media base tint keeps the
// white text legible over any photo (the card also lays a constant floor).
const PLACE_SCRIM = media.base;

/** What a place is, in its own words: a city space or business by its type
 *  ("Klatrefelt", "Kafé"), an organisation by its form ("Forening",
 *  "Klubb"); the card used to say only "Bedrift" or "Byrom" (user
 *  2026-11-20). */
function placeTypeText(p: MockPlace): string {
  if (p.kind === "organisasjon") {
    const o = organizationForPlace(p.id);
    if (o) return o.form;
  }
  return placeTypeLabel(p);
}

export function placeToDeckItem(
  p: MockPlace,
  now: Date = new Date(),
): DeckItem {
  const photos = photosForPlace(p).map(libImage);
  const { score, count } = ratingOf(reviewsForPlace(p.id));
  return {
    kind: "place",
    id: p.id,
    title: p.name,
    photos,
    scrims: photos.map(() => PLACE_SCRIM),
    lines: [
      // The type is its own row (user 2026-11-20), then "Kolsås · 12 km"
      // (Phase 19), then the rating.
      { icon: "pricetag-outline", text: placeTypeText(p) },
      {
        icon: "location-outline",
        text: `${areaFor(p.coord).name} · ${distanceLabelFor(p.coord)}`,
      },
      {
        icon: "star-outline",
        text: count
          ? `${formatRating(score)} · ${count} ${count === 1 ? "vurdering" : "vurderinger"}`
          : "Ingen vurderinger ennå",
      },
      {
        icon: "time-outline",
        text: isPlaceOpen(p, now) ? "Åpent nå" : "Stengt nå",
      },
    ],
    chips: p.vibes,
    about: p.about,
    chatId: chatForPlace(p.id)?.id,
    subtitle: `${placeTypeText(p)} · ${areaFor(p.coord).name} · ${distanceLabelFor(p.coord)}`,
  };
}

/** A Sveip deck (Phase 19, founder 2026-11-08): the tab's places or
 *  experiences after the map's filters, nearest first from the person.
 *  Built when the tab or the filters change, never on an origin move, so the
 *  deck doesn't jump under the thumb. */
export function deckFor(
  placesTab: boolean,
  filters: MapFilters,
  origin: Origin = getOrigin(),
): DeckItem[] {
  const nearest = <T>(list: T[], coordOf: (x: T) => [number, number]) =>
    list
      .map((x, i) => ({ x, i, d: distanceMeters(origin.coord, coordOf(x)) }))
      .sort((a, b) => a.d - b.d || a.i - b.i)
      .map((r) => r.x);
  return placesTab
    ? nearest(applyFilters(places, "", filters, origin), (p) => p.coord).map(
        (p) => placeToDeckItem(p),
      )
    : nearest(
        applyExperienceFilters(experiences, "", filters, origin),
        (x) => x.meetingPoint.coord,
      ).map(experienceToDeckItem);
}

/** What a Sveip tab shows: the same pipeline as the map's mode of that name
 *  (filters, then the mode's rules, nearest first; Populært most-reviewed
 *  first). Lagret holds what is saved when the deck is built, so a swipe-save
 *  never reshuffles the deck under the thumb. */
export function modeResult(
  mode: DiscoveryMode,
  filters: MapFilters,
  savedIds: readonly string[],
  origin: Origin = getOrigin(),
) {
  return resultForMode({
    mode,
    places: applyFilters(places, "", filters, origin),
    query: "",
    savedIds,
    filters,
    origin,
  });
}

/** The deck for a Sveip tab (one card per item the map's mode would list). */
export function deckForMode(
  mode: DiscoveryMode,
  filters: MapFilters,
  savedIds: readonly string[],
  origin: Origin = getOrigin(),
): { items: DeckItem[]; emptyMessage: string } {
  const result = modeResult(mode, filters, savedIds, origin);
  const items: DeckItem[] = [];
  for (const it of result.items) {
    if (it.kind === "place") {
      const p = placeById(it.id);
      if (p) items.push(placeToDeckItem(p));
    } else if (it.kind === "experience") {
      const e = experienceById(it.id);
      if (e) items.push(experienceToDeckItem(e));
    }
  }
  return { items, emptyMessage: result.emptyMessage };
}
