// Dev-only (Phase 19): what each interest has of its six kinds, for the
// _sandbox/catalog screen and its test. Places by `kind`, experiences by
// `format`, groups by their interest; legacy items count where they fit.
import type { Href } from "expo-router";

import { ITEM_TYPE_LABEL } from "@/components/map/services/itemType";
import { experiences, groups, places } from "@/fixtures";

export const CATALOG_SLOTS = [
  "bedrift",
  "organisasjon",
  "byrom",
  "opplevelse",
  "arrangement",
  "gruppe",
] as const;
export type CatalogSlot = (typeof CATALOG_SLOTS)[number];

export const SLOT_LABEL: Record<CatalogSlot, string> = {
  ...ITEM_TYPE_LABEL,
  gruppe: "Gruppe",
};

export type SlotItem = { id: string; title: string; href: Href };
export type InterestSlots = Record<CatalogSlot, SlotItem[]>;

const empty = (): InterestSlots => ({
  bedrift: [],
  organisasjon: [],
  byrom: [],
  opplevelse: [],
  arrangement: [],
  gruppe: [],
});

/** Every interest's items by kind, in fixture order. */
export function catalogSlots(): Map<string, InterestSlots> {
  const out = new Map<string, InterestSlots>();
  const slotsOf = (interest: string) => {
    let s = out.get(interest);
    if (!s) out.set(interest, (s = empty()));
    return s;
  };
  for (const p of places) {
    if (!p.interestId) continue;
    slotsOf(p.interestId)[p.kind].push({
      id: p.id,
      title: p.name,
      href: `/place/${p.id}` as Href,
    });
  }
  for (const e of experiences) {
    if (!e.interestId) continue;
    slotsOf(e.interestId)[
      e.format === "event" ? "arrangement" : "opplevelse"
    ].push({ id: e.id, title: e.title, href: `/experience/${e.id}` as Href });
  }
  for (const g of groups) {
    if (!g.interestId) continue;
    slotsOf(g.interestId).gruppe.push({
      id: g.id,
      title: g.name,
      href: `/group/${g.id}` as Href,
    });
  }
  return out;
}

/** How many of the six kinds an interest has (each counted once). */
export function filledSlots(s: InterestSlots | undefined): number {
  return s ? CATALOG_SLOTS.filter((k) => s[k].length > 0).length : 0;
}
