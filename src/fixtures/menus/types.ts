// Venue menus (user 2026-11-10: "We need to have a meny section in the map
// details sheet for restaurants, cafes and bars"). One generic model for every
// café, bar and restaurant, as the spec asks (MASTER_SPEC L188 and L8932, and
// the Venue Content & Menus Contract V1 at L21953): a venue has named
// offerings ("Frokost", "Lunsj", "Drikke", "Happy hour"), each of ordered
// sections of ordered items. Prices are integer minor units plus currency and
// are never guessed: an item without a price shows none. Labels are the
// venue's own claims, never a medical guarantee. MOCK fixture content; the
// contract authorizes no new entity or API (BLOCKED_CONTRACT_GAP,
// BLOCKED_NOT_V22_CERTIFIED).

/** Money in minor units (øre) plus its currency. */
export type MenuMoney = { amountMinor: number; currency: "NOK" };

/** The controlled labels an item can carry: the venue's own claims. */
export const MENU_LABELS = [
  "Vegansk",
  "Vegetar",
  "Glutenfri",
  "Laktosefri",
  "Alkoholfri",
  "Inneholder nøtter",
] as const;
export type MenuLabel = (typeof MENU_LABELS)[number];

/** A size or serving with its own price ("Glass", "Flaske", "0,4 l"). */
export type MenuVariant = { label: string; price: MenuMoney };

export type MockMenuItem = {
  name: string;
  description?: string;
  price?: MenuMoney;
  variants?: MenuVariant[];
  labels?: MenuLabel[];
  /** A serving note ("Til deling", "Spør om dagens"). */
  note?: string;
};

export type MockMenuSection = { title: string; items: MockMenuItem[] };

export type MockMenuOffering = {
  name: string;
  /** When it is served ("Hverdager 07–11"). */
  when?: string;
  sections: MockMenuSection[];
};

export type MockMenu = { placeId: string; offerings: MockMenuOffering[] };

const nok = (kr: number): MenuMoney => ({
  amountMinor: Math.round(kr * 100),
  currency: "NOK",
});

/** An item priced in kroner, or with no price (never guessed). */
export function item(
  name: string,
  kr?: number,
  description?: string,
  labels?: MenuLabel[],
  note?: string,
): MockMenuItem {
  return {
    name,
    ...(kr !== undefined ? { price: nok(kr) } : {}),
    ...(description ? { description } : {}),
    ...(labels && labels.length > 0 ? { labels } : {}),
    ...(note ? { note } : {}),
  };
}

/** An item sold in sizes or servings, each [label, kroner]. */
export function sized(
  name: string,
  sizes: readonly (readonly [string, number])[],
  description?: string,
  labels?: MenuLabel[],
): MockMenuItem {
  return {
    name,
    variants: sizes.map(([label, kr]) => ({ label, price: nok(kr) })),
    ...(description ? { description } : {}),
    ...(labels && labels.length > 0 ? { labels } : {}),
  };
}
