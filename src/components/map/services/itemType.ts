// What a map item is (Phase 19, founder 2026-11-08): a Bedrift, an
// Organisasjon or a Byrom (places), an Opplevelse or an Arrangement (an event,
// or a festival over several days). Shown as a label on cards, the preview
// and search rows ("Bedrift · Sandvika · 12 km") and picked in Filtre's
// "Type" group. Pure.
import type { IconName } from "@/components/ui";
import {
  experienceById,
  placeById,
  type MockExperience,
  type MockPlace,
} from "@/fixtures";

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
  organisasjon: "people-circle-outline",
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

export function placeTypeLabel(p: Pick<MockPlace, "kind">): string {
  return ITEM_TYPE_LABEL[p.kind];
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
