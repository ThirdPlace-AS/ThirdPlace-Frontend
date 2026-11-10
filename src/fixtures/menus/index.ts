// Menus by place (see ./types.ts for the model and its spec basis). Every
// café, bar and restaurant in the fixtures has one (tests/menus.test.tsx); a
// venue that has none (one made in Legg til) shows the no-menu state.
import type { MockPlace } from "../index";

import { LEGACY_MENUS } from "./legacy";
import type { MockMenu } from "./types";

export * from "./types";

export const menus: MockMenu[] = [...LEGACY_MENUS];

let byPlace: Map<string, MockMenu> | null = null;
let indexedLength = -1;

/** The menu of a place, if it has one (lazy index, rebuilt if the list grows). */
export function menuForPlace(placeId: string): MockMenu | undefined {
  if (!byPlace || indexedLength !== menus.length) {
    byPlace = new Map(menus.map((m) => [m.placeId, m]));
    indexedLength = menus.length;
  }
  return byPlace.get(placeId);
}

// A place that serves food or drink, by what it says it is ("Kafé",
// "Vinbar", "Bakeri", "Pub", "Restaurant" …). A city space is never one.
const VENUE =
  /(kaf[eé]|café|bar$|^bar\b|\bpub\b|restaurant|bistro|bakeri|bryggeri|tesalong|spisested|brasserie|pizzeria)/i;

/** Whether a place's page has a Meny section: it has a menu, or it is a
 *  café, bar or restaurant (then the section says the menu isn't out yet). */
export function isMenuVenue(
  place: Pick<MockPlace, "id" | "kind" | "category">,
): boolean {
  if (menuForPlace(place.id)) return true;
  return place.kind !== "byrom" && VENUE.test(place.category);
}
