// "Meny" on a café's, bar's or restaurant's page (user 2026-11-10: "We need
// to have a meny section in the map details sheet for restaurants, cafes and
// bars"). One generic menu for every venue type (MASTER_SPEC's venue menus
// contract, src/fixtures/menus/types.ts): the offerings as chips, when the
// chosen one is served, its first items with prices, and "Vis hele menyen"
// for the menu page (/place/[id]/menu). A venue without a menu says so.
// A photographed item shows a thumbnail; a tap grows its photo out of it into
// the viewer, which pages through the list's other photographed items (0458).
import type { Href } from "expo-router";
import { useCallback, useState } from "react";
import { type ImageSourcePropType, View } from "react-native";

import {
  Badge,
  Button,
  Chip,
  LoadingImage,
  measureRect,
  PhotoViewer,
  Pressable,
  type Rect,
  Text,
} from "@/components/ui";
import type { MockPlace } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import {
  isMenuVenue,
  menuForPlace,
  menuItemImage,
  type MockMenuItem,
  type MockMenuOffering,
} from "@/fixtures/menus";
import { formatMoney } from "@/lib/format";

/** Thumbnail sizes in px: the menu page, and the page section's short list. */
const THUMB = 64;
const THUMB_COMPACT = 48;

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

/** The viewer for menu photos: `open(list, item, from)` shows every
 *  photographed item of `list`, starting at `item`, grown out of `from`. */
export function useMenuPhotos() {
  const [photos, setPhotos] = useState<ImageSourcePropType[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [from, setFrom] = useState<Rect | null>(null);
  const open = useCallback(
    (list: readonly MockMenuItem[], item: MockMenuItem, rect: Rect | null) => {
      const keys = list.flatMap((i) => {
        const key = menuItemImage(i);
        return key ? [{ item: i, key }] : [];
      });
      const at = keys.findIndex((k) => k.item === item);
      if (at < 0) return;
      setPhotos(keys.map((k) => libImage(k.key)));
      setFrom(rect);
      setIndex(at);
    },
    [],
  );
  const viewer = (
    <PhotoViewer
      photos={photos}
      index={index}
      onClose={() => setIndex(null)}
      label="Bilder fra menyen"
      from={from}
    />
  );
  return { open, viewer };
}

/** One item: name and price on a line, then sizes, words, note and labels;
 *  its photo's thumbnail on the right when it has one. */
export function MenuItemRow({
  item,
  compact = false,
  onPhoto,
}: {
  item: MockMenuItem;
  /** The page section: one line of description, no labels. */
  compact?: boolean;
  /** Opens the photo, grown out of the thumbnail's window rect. */
  onPhoto?: (from: Rect | null) => void;
}) {
  const sizes = variantsLabel(item);
  // An item without a price always says why (part of a set menu, free), so
  // the note shows in the page section too.
  const showNote = item.note && (!compact || (!item.price && !sizes));
  const photo = menuItemImage(item);
  const size = compact ? THUMB_COMPACT : THUMB;
  return (
    <View className="flex-row items-start gap-3">
      <MenuItemText
        item={item}
        compact={compact}
        sizes={sizes}
        showNote={!!showNote}
      />
      {photo ? (
        <Pressable
          accessibilityRole="imagebutton"
          accessibilityLabel={`Vis bilde av ${item.name}`}
          hitSlop={8}
          disabled={!onPhoto}
          onPress={(e) =>
            measureRect(e.currentTarget as unknown as View, (rect) =>
              onPhoto?.(rect),
            )
          }
        >
          <View
            className="overflow-hidden rounded-sm"
            style={{ width: size, height: size }}
          >
            <LoadingImage
              source={libImage(photo)}
              thumb
              contentFit="cover"
              style={{ width: size, height: size }}
            />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

function MenuItemText({
  item,
  compact,
  sizes,
  showNote,
}: {
  item: MockMenuItem;
  compact: boolean;
  sizes: string | undefined;
  showNote: boolean;
}) {
  return (
    <View
      accessible
      accessibilityLabel={menuItemLabel(item)}
      className="flex-1 gap-1"
    >
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
        <View className="flex-row flex-wrap gap-2">
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
  const photos = useMenuPhotos();
  if (!isMenuVenue(place)) return null;
  const menu = menuForPlace(place.id);
  const offering = menu?.offerings[active] ?? menu?.offerings[0];
  const preview = (offering?.sections ?? [])
    .flatMap((s) => s.items)
    .slice(0, MENU_PREVIEW_ITEMS);

  return (
    <View className="gap-3">
      <Text variant="h1" accessibilityRole="header">
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
              <MenuItemRow
                key={it.name}
                item={it}
                compact
                onPhoto={(from) => photos.open(preview, it, from)}
              />
            ))}
          </View>
          {photos.viewer}
          <View className="pt-1">
            <Button
              label="Vis hele menyen"
              variant="secondary"
              // The page opens on the offering chosen here.
              onPress={() => onNavigate(menuHref(place.id, active))}
            />
          </View>
        </>
      )}
    </View>
  );
}
