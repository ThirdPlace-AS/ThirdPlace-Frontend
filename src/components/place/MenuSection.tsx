// "Meny" on a café's, bar's or restaurant's page (user 2026-11-10: "We need
// to have a meny section in the map details sheet for restaurants, cafes and
// bars"). One generic menu for every venue type (MASTER_SPEC's venue menus
// contract, src/fixtures/menus/types.ts): the offerings as chips, when the
// chosen one is served, its first items with prices, and "Vis hele menyen"
// for the menu page (/place/[id]/menu). A venue without a menu says so.
import type { Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Badge, Chip, Text } from "@/components/ui";
import type { MockPlace } from "@/fixtures";
import {
  isMenuVenue,
  menuForPlace,
  type MockMenuItem,
  type MockMenuOffering,
} from "@/fixtures/menus";
import { formatMoney } from "@/lib/format";

/** How many items the page shows before "Vis hele menyen". */
export const MENU_PREVIEW_ITEMS = 4;

export const NO_MENU_TEXT = "Menyen er ikke lagt ut ennå.";

/** The menu page, opened on an offering (the first one needs no param). */
export function menuHref(placeId: string, offering = 0): Href {
  return (
    offering > 0
      ? `/place/${placeId}/menu?offering=${offering}`
      : `/place/${placeId}/menu`
  ) as Href;
}

/** The offering a page link asks for, or the first when it names none. */
export function offeringIndex(
  param: string | undefined,
  count: number,
): number {
  const n = Number(param);
  return Number.isInteger(n) && n >= 0 && n < count ? n : 0;
}

/** "Glass 145 kr · Flaske 690 kr" for an item sold in sizes. */
export function variantsLabel(item: MockMenuItem): string | undefined {
  return item.variants
    ?.map((v) => `${v.label} ${formatMoney(v.price)}`)
    .join(" · ");
}

/** What a screen reader says for an item: name, price(s), words, labels. */
export function menuItemLabel(item: MockMenuItem): string {
  return [
    item.name,
    item.price ? formatMoney(item.price) : variantsLabel(item),
    item.description,
    item.note,
    item.labels?.join(", "),
  ]
    .filter(Boolean)
    .join(". ");
}

/** The offerings as single-choice chips (only when there is more than one). */
export function OfferingChips({
  offerings,
  active,
  onPick,
}: {
  offerings: MockMenuOffering[];
  active: number;
  onPick: (i: number) => void;
}) {
  if (offerings.length < 2) return null;
  return (
    <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
      {offerings.map((o, i) => (
        <Chip
          key={o.name}
          label={o.name}
          size="sm"
          role="radio"
          selected={i === active}
          onPress={() => onPick(i)}
        />
      ))}
    </View>
  );
}

/** One item: name and price on a line, then sizes, words, note and labels. */
export function MenuItemRow({
  item,
  compact = false,
}: {
  item: MockMenuItem;
  /** The page section: one line of description, no labels. */
  compact?: boolean;
}) {
  const sizes = variantsLabel(item);
  // An item without a price always says why (part of a set menu, free), so
  // the note shows in the page section too.
  const showNote = item.note && (!compact || (!item.price && !sizes));
  return (
    <View accessible accessibilityLabel={menuItemLabel(item)} className="gap-1">
      <View className="flex-row items-start justify-between gap-3">
        <Text variant="label" weight="semibold" className="flex-1">
          {item.name}
        </Text>
        {item.price ? (
          <Text variant="label" weight="semibold">
            {formatMoney(item.price)}
          </Text>
        ) : null}
      </View>
      {sizes ? (
        <Text variant="caption" tone="ink">
          {sizes}
        </Text>
      ) : null}
      {item.description ? (
        <Text
          variant="caption"
          tone="muted"
          numberOfLines={compact ? 1 : undefined}
        >
          {item.description}
        </Text>
      ) : null}
      {showNote ? (
        <Text variant="caption" tone="muted">
          {item.note}
        </Text>
      ) : null}
      {!compact && item.labels ? (
        <View className="flex-row flex-wrap gap-1.5">
          {item.labels.map((l) => (
            <Badge key={l} kind="status" label={l} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function MenuSection({
  place,
  onNavigate,
}: {
  place: Pick<MockPlace, "id" | "kind" | "category">;
  onNavigate: (href: Href) => void;
}) {
  const [active, setActive] = useState(0);
  if (!isMenuVenue(place)) return null;
  const menu = menuForPlace(place.id);
  const offering = menu?.offerings[active] ?? menu?.offerings[0];
  const preview = (offering?.sections ?? [])
    .flatMap((s) => s.items)
    .slice(0, MENU_PREVIEW_ITEMS);

  return (
    <View className="gap-3">
      <Text variant="h2" accessibilityRole="header">
        Meny
      </Text>
      {!menu || !offering ? (
        <Text variant="body" tone="muted">
          {NO_MENU_TEXT}
        </Text>
      ) : (
        <>
          <OfferingChips
            offerings={menu.offerings}
            active={active}
            onPick={setActive}
          />
          {offering.when ? (
            <Text variant="caption" tone="muted">
              {offering.when}
            </Text>
          ) : null}
          <View className="gap-4">
            {preview.map((it) => (
              <MenuItemRow key={it.name} item={it} compact />
            ))}
          </View>
          <Button
            label="Vis hele menyen"
            variant="secondary"
            // The page opens on the offering chosen here.
            onPress={() => onNavigate(menuHref(place.id, active))}
          />
        </>
      )}
    </View>
  );
}
