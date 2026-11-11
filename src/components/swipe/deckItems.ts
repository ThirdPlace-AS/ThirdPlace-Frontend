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
import { experienceTypeLabel } from "@/components/map/services/itemType";
import {
  applyExperienceFilters,
  applyFilters,
  type MapFilters,
} from "@/components/map/services/mapFilters";
import {
  PLACE_KIND_LABEL,
  areaFor,
  chatForExperience,
  chatForPlace,
  experiences,
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
  chips: string[];
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
            ? `${experienceTypeLabel(e)} · ${e.when}`
            : e.when,
      },
      {
        icon: "people-outline",
        text: spotsLine(e),
        goingId: e.id,
      },
    ],
    chips: e.tags,
    chatId: chatForExperience(e.id)?.id,
    subtitle: e.when,
  };
}

// Places have no per-photo scrim samples; the media base tint keeps the
// white text legible over any photo (the card also lays a constant floor).
const PLACE_SCRIM = media.base;

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
      {
        icon: "location-outline",
        // "Byrom · Kolsås · 12 km" (Phase 19).
        text: `${PLACE_KIND_LABEL[p.kind]} · ${areaFor(p.coord).name} · ${distanceLabelFor(p.coord)}`,
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
    chatId: chatForPlace(p.id)?.id,
    subtitle: `${PLACE_KIND_LABEL[p.kind]} · ${areaFor(p.coord).name} · ${distanceLabelFor(p.coord)}`,
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
