// Menus by place (see ./types.ts for the model and its spec basis). Every
// café, bar and restaurant in the fixtures has one (tests/menus.test.tsx); a
// venue that has none (one made in Legg til) shows the no-menu state.
import type { MockPlace } from "../index";

import { BAR_MENUS } from "./bars";
import { CAFE_MENUS } from "./cafes";
import { LEGACY_MENUS } from "./legacy";
import { RESTAURANT_MENUS } from "./restaurants";
import type { MockMenu } from "./types";

export * from "./types";

export const menus: MockMenu[] = [
  ...LEGACY_MENUS,
  ...CAFE_MENUS,
  ...BAR_MENUS,
  ...RESTAURANT_MENUS,
];

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

/** A café, bar, pub, bakery, brewery, tea room or restaurant, by what the
 *  place says it is. */
export function servesFoodOrDrink(
  place: Pick<MockPlace, "kind" | "category">,
): boolean {
  return place.kind !== "byrom" && VENUE.test(place.category);
}

/** Whether a place's page has a Meny section: it has a menu, or it serves
 *  food or drink (then the section says the menu isn't out yet). */
export function isMenuVenue(
  place: Pick<MockPlace, "id" | "kind" | "category">,
): boolean {
  return menuForPlace(place.id) !== undefined || servesFoodOrDrink(place);
}
