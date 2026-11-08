import { memo } from "react";
import { ScrollView } from "react-native";

import { Icon, Pressable as UIPressable, Text } from "@/components/ui";
import { elevation } from "@/theme";

import { appliedFilterChips, type MapFilters } from "./services/mapFilters";

// Applied filters as removable chips on the map (Phase 18, from the screen
// benchmark: Amazon's filter chips). Under the mode chips, one chip with an ✕
// per applied value, so the list, its count, Filtre's badge and Sveip's sheet
// agree. The pin categories are picked only in Filtre's "Kategori" section
// (founder 2026-11-08); a chosen category shows here like any other applied
// filter.

export const AppliedChip = memo(function AppliedChip({
  label,
  onRemove,
  floating = false,
}: {
  label: string;
  onRemove: () => void;
  floating?: boolean;
}) {
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={`Fjern «${label}»`}
      onPress={onRemove}
      haptic="selection"
      pressedScale={0.95}
      hitSlop={4}
      contentStyle={floating ? elevation.e1 : undefined}
      contentClassName="flex-row items-center gap-1 rounded-full border border-ink bg-ink px-3 py-1.5"
    >
      <Text variant="caption" weight="semibold" tone="onInk">
        {label}
      </Text>
      <Icon name="close" size="sm" tone="onInk" />
    </UIPressable>
  );
});

export const MapQuickChips = memo(function MapQuickChips({
  filters,
  onChange,
}: {
  filters: MapFilters;
  onChange: (next: MapFilters) => void;
}) {
  const applied = appliedFilterChips(filters);
  // Nothing applied: no row, so the map keeps the space.
  if (applied.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="items-center gap-2 px-gutter py-1"
    >
      {applied.map((c) => (
        <AppliedChip
          key={c.key}
          label={c.label}
          floating
          onRemove={() => onChange(c.remove(filters))}
        />
      ))}
    </ScrollView>
  );
});
