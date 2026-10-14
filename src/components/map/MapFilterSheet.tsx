import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Sheet } from "@/components/Sheet";
import {
  PLACE_CATEGORIES,
  PRICE_BANDS,
  priceBandFor,
  RADIUS_OPTIONS,
  TIME_WINDOWS,
  VIBES,
  type MockPlace,
  type PlaceCategory,
  type PriceBand,
  type TimeWindow,
  type Vibe,
} from "@/fixtures";

// Map filters (MOCK — client-side only over fixtures, no contract).
export type MapFilters = {
  category: PlaceCategory;
  maxDistanceM: number | null; // null = any distance
  priceBand: PriceBand | null; // null = any price
  vibes: Vibe[]; // empty = any vibe
  time: TimeWindow | null; // null = any time (applies to experiences)
  openNowOnly: boolean;
};

export const DEFAULT_FILTERS: MapFilters = {
  category: "Alle",
  maxDistanceM: null,
  priceBand: null,
  vibes: [],
  time: null,
  openNowOnly: false,
};

function radiusLabel(m: number): string {
  return m < 1000 ? `${m} m` : `${m / 1000} km`;
}

// Applies search text + place-level filters to the place list. Time is an
// experience concept and is applied by the discovery adapter, not here.
export function applyFilters(
  all: MockPlace[],
  query: string,
  f: MapFilters,
): MockPlace[] {
  const q = query.trim().toLowerCase();
  return all.filter((p) => {
    if (f.category !== "Alle" && p.category !== f.category) return false;
    if (f.maxDistanceM !== null && p.distanceM > f.maxDistanceM) return false;
    if (f.priceBand !== null && priceBandFor(p.priceNok) !== f.priceBand)
      return false;
    if (f.vibes.length > 0 && !f.vibes.some((v) => p.vibes.includes(v)))
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
    (f.priceBand !== null ? 1 : 0) +
    (f.vibes.length > 0 ? 1 : 0) +
    (f.time !== null ? 1 : 0) +
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

  const toggleVibe = (v: Vibe) =>
    setDraft((d) => ({
      ...d,
      vibes: d.vibes.includes(v)
        ? d.vibes.filter((x) => x !== v)
        : [...d.vibes, v],
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
          <Chip
            label="Alle"
            selected={draft.priceBand === null}
            onPress={() => setDraft((d) => ({ ...d, priceBand: null }))}
          />
          {PRICE_BANDS.map((band) => (
            <Chip
              key={band}
              label={band}
              selected={draft.priceBand === band}
              onPress={() => setDraft((d) => ({ ...d, priceBand: band }))}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <SectionLabel>Vibe</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          {VIBES.map((v) => (
            <Chip
              key={v}
              label={v}
              selected={draft.vibes.includes(v)}
              onPress={() => toggleVibe(v)}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <SectionLabel>Når</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          <Chip
            label="Når som helst"
            selected={draft.time === null}
            onPress={() => setDraft((d) => ({ ...d, time: null }))}
          />
          {TIME_WINDOWS.map((t) => (
            <Chip
              key={t}
              label={t}
              selected={draft.time === t}
              onPress={() => setDraft((d) => ({ ...d, time: t }))}
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
