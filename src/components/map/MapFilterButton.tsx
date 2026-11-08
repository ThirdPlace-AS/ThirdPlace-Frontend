import { memo } from "react";
import { View } from "react-native";

import { Icon, Pressable as UIPressable, Text } from "@/components/ui";

import { appliedFilterChips, type MapFilters } from "./services/mapFilters";

// The map's Filtre button in the search bar. Applied filters show only as
// the number on it (founder 2026-11-08: no filter chips on the map); a
// screen reader hears which ones, in the words the Filtre sheet uses.
export const MapFilterButton = memo(function MapFilterButton({
  filters,
  count,
  onPress,
}: {
  filters: MapFilters;
  /** activeExtraFilterCount: one per filter group, as Sveip's badge. */
  count: number;
  onPress: () => void;
}) {
  const applied = appliedFilterChips(filters).map((c) => c.label);
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel="Filtre"
      accessibilityValue={
        applied.length > 0 ? { text: applied.join(", ") } : undefined
      }
      onPress={onPress}
      className="w-12"
      contentClassName="items-center justify-center h-full"
    >
      <Icon name="options-outline" size="md" tone="ink" />
      {count > 0 ? (
        <View className="absolute items-center justify-center w-4 h-4 rounded-full right-1 top-1 bg-emberStrong">
          <Text variant="caption" weight="bold" tone="onEmber">
            {count}
          </Text>
        </View>
      ) : null}
    </UIPressable>
  );
});
