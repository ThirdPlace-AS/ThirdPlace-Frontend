import { memo } from "react";
import { ScrollView, View } from "react-native";

import { Icon, Pressable as UIPressable, Text } from "@/components/ui";
import { elevation } from "@/theme";

import {
  MARKER_CATEGORIES,
  MARKER_LABEL,
  markerFill,
  type MarkerCategory,
} from "./services/markerCategory";
import { appliedFilterChips, type MapFilters } from "./services/mapFilters";

// Quick filter chips on the map (Phase 18, from the screen benchmark:
// Google Maps' category chips, Amazon's removable filter chips). Under the
// mode chips: first every applied filter with an ✕, then the eight pin
// categories, each with its pin colour. A chip edits the same filters as
// Filtre, so the list, its count, Filtre's badge and Sveip's sheet agree.

export const CategoryChip = memo(function CategoryChip({
  category,
  selected,
  onPress,
  floating = false,
}: {
  category: MarkerCategory;
  selected: boolean;
  onPress: () => void;
  /** Over the map: a raised white pill like the mode chips. */
  floating?: boolean;
}) {
  const label = MARKER_LABEL[category];
  return (
    <UIPressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      haptic="selection"
      pressedScale={0.95}
      hitSlop={4}
      contentStyle={floating ? elevation.e1 : undefined}
      contentClassName={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${
        selected ? "border-ink bg-ink" : "border-line bg-surface"
      }`}
    >
      <View
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: markerFill(category) }}
      />
      <Text
        variant="caption"
        weight={selected ? "semibold" : "medium"}
        tone={selected ? "onInk" : "ink"}
      >
        {label}
      </Text>
      {selected ? <Icon name="close" size="sm" tone="onInk" /> : null}
    </UIPressable>
  );
});

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
  // Categories have their own chips below; the rest show as applied chips.
  const applied = appliedFilterChips(filters).filter(
    (c) => !c.key.startsWith("categories:"),
  );
  // Chosen categories first, so one picked elsewhere (Filtre, the search
  // page) is in view, not scrolled off the end of the row.
  const ordered = [...MARKER_CATEGORIES].sort(
    (a, b) =>
      Number(filters.categories.includes(b)) -
      Number(filters.categories.includes(a)),
  );
  const toggle = (c: MarkerCategory) =>
    onChange({
      ...filters,
      categories: filters.categories.includes(c)
        ? filters.categories.filter((x) => x !== c)
        : [...filters.categories, c],
    });
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
      {ordered.map((c) => (
        <CategoryChip
          key={c}
          category={c}
          floating
          selected={filters.categories.includes(c)}
          onPress={() => toggle(c)}
        />
      ))}
    </ScrollView>
  );
});
