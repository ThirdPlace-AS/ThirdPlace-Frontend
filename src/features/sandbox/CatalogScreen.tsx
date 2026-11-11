// Dev-only: every interest with its six items (Phase 19), grouped by pin
// colour; tap a row to open its page (thirdplace://_sandbox/catalog). A
// release build redirects _sandbox to the map.
import { router } from "expo-router";
import { useMemo } from "react";
import { SectionList, View } from "react-native";

import { ITEM_TYPE_ICON } from "@/components/map/services/itemType";
import { MARKER_LABEL } from "@/components/map/services/markerCategory";
import { Icon, Pressable, Screen, Text, type IconName } from "@/components/ui";
import {
  INTERESTS,
  INTEREST_CATEGORIES,
  interestsInCategory,
  type Interest,
} from "@/fixtures/catalog/interests";

import {
  CATALOG_SLOTS,
  SLOT_LABEL,
  catalogSlots,
  filledSlots,
  type CatalogSlot,
  type InterestSlots,
} from "./catalogSlots";

const SLOT_ICON: Record<CatalogSlot, IconName> = {
  ...ITEM_TYPE_ICON,
  gruppe: "people-outline",
};

export default function CatalogScreen() {
  const slots = useMemo(() => catalogSlots(), []);
  const sections = useMemo(
    () =>
      INTEREST_CATEGORIES.map((cat) => ({
        title: MARKER_LABEL[cat],
        data: interestsInCategory(cat),
      })),
    [],
  );
  const complete = INTERESTS.filter(
    (i) => filledSlots(slots.get(i.id)) === CATALOG_SLOTS.length,
  ).length;

  return (
    <Screen edges={["top"]}>
      <SectionList
        sections={sections}
        keyExtractor={(i) => i.id}
        contentContainerClassName="gap-4 px-gutter py-4 pb-12"
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View className="gap-1">
            <Text variant="h2">Katalog</Text>
            <Text variant="caption" tone="muted">
              {`${complete} av ${INTERESTS.length} interesser har alle seks`}
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text variant="label" weight="semibold" className="mt-4">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <InterestCard interest={item} slots={slots.get(item.id)} />
        )}
      />
    </Screen>
  );
}

function InterestCard({
  interest,
  slots,
}: {
  interest: Interest;
  slots: InterestSlots | undefined;
}) {
  return (
    <View className="gap-1 rounded-md border border-line p-3">
      <View className="flex-row items-center justify-between">
        <Text variant="label" weight="semibold">
          {interest.label}
        </Text>
        <Text variant="caption" tone="muted">
          {`${filledSlots(slots)}/${CATALOG_SLOTS.length}`}
        </Text>
      </View>
      {CATALOG_SLOTS.map((k) => {
        const items = slots?.[k] ?? [];
        const first = items[0];
        return (
          <Pressable
            key={k}
            disabled={!first}
            accessibilityRole="button"
            accessibilityLabel={`${SLOT_LABEL[k]}: ${first?.title ?? "mangler"}`}
            onPress={() => first && router.push(first.href)}
            contentClassName="flex-row items-center gap-2 py-1"
          >
            <Icon name={SLOT_ICON[k]} size="sm" tone="muted" />
            <Text variant="caption" tone="muted" className="w-24">
              {SLOT_LABEL[k]}
            </Text>
            <Text
              variant="caption"
              tone={first ? "ink" : "muted"}
              numberOfLines={1}
              className="flex-1"
            >
              {first
                ? `${first.title}${items.length > 1 ? ` (+${items.length - 1})` : ""}`
                : "Mangler"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
