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
import {
  chatForExperience,
  chatForPlace,
  placeById,
  ratingOf,
  reviewsForPlace,
  type MockExperience,
  type MockPlace,
} from "@/fixtures";
import { libImage, photosForPlace } from "@/fixtures/images";
import { formatRating } from "@/lib/format";
import { media } from "@/theme";

export type DeckKind = "experience" | "place";

export type DeckLine = { icon: IconName; text: string };

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

/** Places-left line: "3 plasser igjen · 5/8" or "Ingen ledige plasser · 8/8". */
export function spotsLine(e: Pick<MockExperience, "capacity" | "going">) {
  const left = Math.max(0, e.capacity - e.going);
  return left > 0
    ? `${left} plasser igjen · ${e.going}/${e.capacity}`
    : `Ingen ledige plasser · ${e.going}/${e.capacity}`;
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
        text: place ? `${place.name} · ${place.distance}` : e.meetingPoint.name,
      },
      { icon: "calendar-outline", text: e.when },
      { icon: "people-outline", text: spotsLine(e) },
    ],
    chips: e.tags,
    chatId: chatForExperience(e.id)?.id,
    subtitle: e.when,
  };
}

// Places have no per-photo scrim samples; the media base tint keeps the
// white text legible over any photo (the card also lays a constant floor).
const PLACE_SCRIM = media.base;

export function placeToDeckItem(p: MockPlace): DeckItem {
  const photos = photosForPlace(p).map(libImage);
  const { score, count } = ratingOf(reviewsForPlace(p.id));
  return {
    kind: "place",
    id: p.id,
    title: p.name,
    photos,
    scrims: photos.map(() => PLACE_SCRIM),
    lines: [
      { icon: "location-outline", text: `${p.category} · ${p.distance}` },
      {
        icon: "star-outline",
        text: count
          ? `${formatRating(score)} · ${count} ${count === 1 ? "vurdering" : "vurderinger"}`
          : "Ingen vurderinger ennå",
      },
      { icon: "time-outline", text: p.openNow ? "Åpent nå" : "Stengt nå" },
    ],
    chips: p.vibes,
    chatId: chatForPlace(p.id)?.id,
    subtitle: `${p.category} · ${p.distance}`,
  };
}
