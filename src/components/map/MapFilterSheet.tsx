import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Sheet } from "@/components/Sheet";
import {
  PLACE_CATEGORIES,
  PRICE_LEVELS,
  RADIUS_OPTIONS,
  type MockPlace,
  type PlaceCategory,
  type PriceLevel,
} from "@/fixtures";

// Map filters (MOCK — client-side only over fixtures, no contract).
export type MapFilters = {
  category: PlaceCategory;
  maxDistanceM: number | null; // null = any distance
  priceLevels: PriceLevel[]; // empty = any price
  openNowOnly: boolean;
};

export const DEFAULT_FILTERS: MapFilters = {
  category: "Alle",
  maxDistanceM: null,
  priceLevels: [],
  openNowOnly: false,
};

function radiusLabel(m: number): string {
  return m < 1000 ? `${m} m` : `${m / 1000} km`;
}

function priceLabel(level: PriceLevel): string {
  return "kr".repeat(level);
}

// Applies search text + filters to the place list. Shared by the map screen.
export function applyFilters(
  all: MockPlace[],
  query: string,
  f: MapFilters,
): MockPlace[] {
  const q = query.trim().toLowerCase();
  return all.filter((p) => {
    if (f.category !== "Alle" && p.category !== f.category) return false;
    if (f.maxDistanceM !== null && p.distanceM > f.maxDistanceM) return false;
    if (f.priceLevels.length > 0 && !f.priceLevels.includes(p.priceLevel))
      return false;
    if (f.openNowOnly && !p.openNow) return false;
    if (
      q !== "" &&
      !p.name.toLowerCase().includes(q) &&
      !p.category.toLowerCase().includes(q)
    )
      return false;
    return true;
  });
}

// Count of filters active beyond category (drives the overlay badge).
export function activeExtraFilterCount(f: MapFilters): number {
  return (
    (f.maxDistanceM !== null ? 1 : 0) +
    (f.priceLevels.length > 0 ? 1 : 0) +
    (f.openNowOnly ? 1 : 0)
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text className="text-sm font-semibold text-ink">{children}</Text>;
}

export function MapFilterSheet({
  visible,
  filters,
  onClose,
  onApply,
}: {
  visible: boolean;
  filters: MapFilters;
  onClose: () => void;
  onApply: (f: MapFilters) => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Filtre">
      {/* Mount the body only while open so its draft seeds fresh from `filters`
          on each open (no setState-in-effect). */}
      {visible ? (
        <FilterBody filters={filters} onClose={onClose} onApply={onApply} />
      ) : null}
    </Sheet>
  );
}

function FilterBody({
  filters,
  onClose,
  onApply,
}: {
  filters: MapFilters;
  onClose: () => void;
  onApply: (f: MapFilters) => void;
}) {
  const [draft, setDraft] = useState<MapFilters>(filters);

  const togglePrice = (level: PriceLevel) =>
    setDraft((d) => ({
      ...d,
      priceLevels: d.priceLevels.includes(level)
        ? d.priceLevels.filter((l) => l !== level)
        : [...d.priceLevels, level],
    }));

  return (
    <>
      <View className="gap-2">
        <SectionLabel>Kategori</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          {PLACE_CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={draft.category === c}
              onPress={() => setDraft((d) => ({ ...d, category: c }))}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <SectionLabel>Avstand</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          <Chip
            label="Alle"
            selected={draft.maxDistanceM === null}
            onPress={() => setDraft((d) => ({ ...d, maxDistanceM: null }))}
          />
          {RADIUS_OPTIONS.map((m) => (
            <Chip
              key={m}
              label={radiusLabel(m)}
              selected={draft.maxDistanceM === m}
              onPress={() => setDraft((d) => ({ ...d, maxDistanceM: m }))}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <SectionLabel>Pris</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          {PRICE_LEVELS.map((level) => (
            <Chip
              key={level}
              label={priceLabel(level)}
              selected={draft.priceLevels.includes(level)}
              onPress={() => togglePrice(level)}
            />
          ))}
        </View>
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: draft.openNowOnly }}
        onPress={() => setDraft((d) => ({ ...d, openNowOnly: !d.openNowOnly }))}
        className="flex-row items-center justify-between rounded-md border border-line bg-surface px-4 py-3"
      >
        <Text className="text-base text-ink">Åpent nå</Text>
        <View
          className={`h-6 w-11 justify-center rounded-full px-0.5 ${
            draft.openNowOnly ? "bg-ink" : "bg-surfaceMuted"
          }`}
        >
          <View
            className={`h-5 w-5 rounded-full bg-surface ${
              draft.openNowOnly ? "self-end" : "self-start"
            }`}
          />
        </View>
      </Pressable>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            label="Nullstill"
            variant="secondary"
            onPress={() => setDraft(DEFAULT_FILTERS)}
          />
        </View>
        <View className="flex-1">
          <Button
            label="Vis resultater"
            variant="ink"
            onPress={() => {
              onApply(draft);
              onClose();
            }}
          />
        </View>
      </View>
    </>
  );
}
