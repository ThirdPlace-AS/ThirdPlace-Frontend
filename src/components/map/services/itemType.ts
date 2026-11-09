// What a map item is (Phase 19, founder 2026-11-08): a Bedrift, an
// Organisasjon or a Byrom (places), an Opplevelse or an Arrangement (an event,
// or a festival over several days). Shown as a label on cards, the preview
// and search rows ("Bedrift · Sandvika · 12 km") and picked in Filtre's
// "Type" group. Pure.
import type { BadgeTone, IconName } from "@/components/ui";
import {
  experienceById,
  placeById,
  type MockExperience,
  type MockPlace,
} from "@/fixtures";
import { formatDistance } from "@/lib/distance";

import type { DiscoveryItem } from "../types/mapPresentation";

export const ITEM_TYPES = [
  "bedrift",
  "organisasjon",
  "byrom",
  "opplevelse",
  "arrangement",
] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  bedrift: "Bedrift",
  organisasjon: "Organisasjon",
  byrom: "Byrom",
  opplevelse: "Opplevelse",
  arrangement: "Arrangement",
};

/** Filtre's "Type" chips, drawn like the sheet's other groups. */
export const ITEM_TYPE_ICON: Record<ItemType, IconName> = {
  bedrift: "tp-business",
  organisasjon: "ribbon-outline",
  byrom: "map-outline",
  opplevelse: "tp-experience",
  arrangement: "calendar-outline",
};

export function experienceType(e: Pick<MockExperience, "format">): ItemType {
  return e.format === "event" ? "arrangement" : "opplevelse";
}

/** "Festival" for an event over several days, else the type's label. */
export function experienceTypeLabel(
  e: Pick<MockExperience, "format" | "days">,
): string {
  if (e.format !== "event") return ITEM_TYPE_LABEL.opplevelse;
  return (e.days ?? 1) > 1 ? "Festival" : ITEM_TYPE_LABEL.arrangement;
}

/** What to call a place on the map: its kind ("Bedrift", "Organisasjon"),
 *  but a city space by the kind of space it is ("Park", "Torg",
 *  "Klatrefelt"; user 2026-11-09: "should say what type of city space and
 *  not just city space"). Filtre's Type group still says "Byrom". */
export function placeTypeLabel(
  p: Pick<MockPlace, "kind" | "category">,
): string {
  return p.kind === "byrom" && p.category
    ? p.category
    : ITEM_TYPE_LABEL[p.kind];
}

/** The type of a map item (places by kind, experiences by format). */
export function itemTypeOf(
  item: Pick<DiscoveryItem, "kind" | "id">,
): ItemType | undefined {
  if (item.kind === "place") return placeById(item.id)?.kind;
  if (item.kind === "experience") {
    const e = experienceById(item.id);
    return e ? experienceType(e) : undefined;
  }
  return undefined;
}

type CardItem = Pick<
  DiscoveryItem,
  "kind" | "type" | "typeLabel" | "when" | "openNow" | "distanceM"
>;

/** A Bedrift or Byrom card wears its opening as a badge on the photo, and its
 *  line gives the distance instead (user 2026-11-09: Bedrift first, then
 *  "city spaces should also have the same open close as the business").
 *  An Organisasjon card stays as it was. */
function opensOnPhoto(item: CardItem): boolean {
  return (
    item.kind === "place" && (item.type === "bedrift" || item.type === "byrom")
  );
}

/** The browse card's "what is it" line (founder 2026-11-08), no area:
 *  - a Bedrift or a Byrom: the type and how far away it is ("Bedrift ·
 *    1,2 km", from the person, the number the list is sorted by; 2026-11-09);
 *  - an Organisasjon: the type and its opening ("Organisasjon · Åpent");
 *  - an experience: the type and its time ("Festival · Lør 10:00"). */
export function browseCardLine(item: CardItem): string {
  const extra =
    item.kind === "experience"
      ? item.when
      : opensOnPhoto(item)
        ? item.distanceM === undefined
          ? undefined
          : formatDistance(item.distanceM)
        : item.openNow === undefined
          ? undefined
          : item.openNow
            ? "Åpent"
            : "Stengt";
  return [item.typeLabel, extra].filter(Boolean).join(" · ");
}

export type OpenBadge = {
  label: "Åpent" | "Stengt";
  tone: Extract<BadgeTone, "success" | "danger">;
};

/** A Bedrift's or Byrom's opening, a solid badge on the photo's top left:
 *  green "Åpent" or red "Stengt" (2026-11-09). Null on other cards. */
export function browseCardOpenBadge(item: CardItem): OpenBadge | null {
  if (!opensOnPhoto(item) || item.openNow === undefined) return null;
  return item.openNow
    ? { label: "Åpent", tone: "success" }
    : { label: "Stengt", tone: "danger" };
}
