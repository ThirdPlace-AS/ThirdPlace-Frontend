import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DemoBadge } from "@/components/DemoBadge";
import { MapCanvas } from "@/components/map/MapCanvas";
import {
  activeExtraFilterCount,
  applyFilters,
  DEFAULT_FILTERS,
  MapFilterSheet,
  type MapFilters,
} from "@/components/map/MapFilterSheet";
import { PlaceDetailSheet } from "@/components/PlaceDetailSheet";
import { SearchBar } from "@/components/SearchBar";
import { Chip } from "@/components/Chip";
import { PLACE_CATEGORIES, places, type MockPlace } from "@/fixtures";
import { useMockResource } from "@/hooks/useMockResource";
import { colors } from "@/theme";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<MockPlace | null>(null);
  // Bumped on each "my location" tap to recenter the map on the demo location.
  const [recenterSignal, setRecenterSignal] = useState(0);

  // Mock async load so the surface can show a loading state (no backend).
  const { status } = useMockResource(places, { delayMs: 500 });
  const loading = status === "loading";

  const filtered = useMemo(
    () => applyFilters(places, query, filters),
    [query, filters],
  );
  const extraFilters = activeExtraFilterCount(filters);
  const noResults = !loading && filtered.length === 0;

  const resetAll = () => {
    setQuery("");
    setFilters(DEFAULT_FILTERS);
  };

  // Full-bleed map fills the whole tab (everything above the bottom nav). Search
  // + category chips + a filter button float on top; tapping a pin opens the
  // place-detail sheet.
  return (
    <View className="flex-1 bg-background">
      <MapCanvas
        fill
        places={loading ? [] : filtered}
        onSelect={setSelected}
        selectedId={selected?.id ?? null}
        recenterSignal={recenterSignal}
      />

      {/* Floating controls */}
      <View
        className="absolute left-0 right-0 top-0 gap-3 px-gutter pb-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <SearchBar
              placeholder="Søk steder og opplevelser"
              value={query}
              onChangeText={setQuery}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filtre"
            onPress={() => setFilterOpen(true)}
            className="h-12 w-12 items-center justify-center rounded-full border border-line bg-surface"
          >
            <Ionicons name="options-outline" size={22} color={colors.ink} />
            {extraFilters > 0 ? (
              <View className="absolute -right-0.5 -top-0.5 h-5 w-5 items-center justify-center rounded-full bg-ember">
                <Text className="text-[10px] font-bold text-onEmber">
                  {extraFilters}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={PLACE_CATEGORIES}
          keyExtractor={(c) => c}
          contentContainerClassName="gap-2"
          renderItem={({ item }) => (
            <Chip
              label={item}
              selected={filters.category === item}
              onPress={() => setFilters((f) => ({ ...f, category: item }))}
            />
          )}
        />
      </View>

      {/* Loading overlay (mock async load) */}
      {loading ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-0 items-center justify-center"
        >
          <View className="flex-row items-center gap-2 rounded-full border border-line bg-surface px-4 py-2">
            <ActivityIndicator color={colors.ink} />
            <Text className="text-sm text-muted">Laster steder…</Text>
          </View>
        </View>
      ) : null}

      {/* Empty overlay — no results for the current search/filters */}
      {noResults ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 bottom-0 top-0 items-center justify-center p-gutter"
        >
          <View className="w-full max-w-sm items-center gap-2 rounded-lg border border-line bg-surface p-5">
            <Ionicons name="search" size={32} color={colors.muted} />
            <Text className="text-base font-semibold text-ink">
              Ingen treff
            </Text>
            <Text className="text-center text-sm text-muted">
              Prøv et annet søk eller juster filtrene.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={resetAll}
              className="mt-1 rounded-md bg-surfaceMuted px-4 py-2"
            >
              <Text className="text-sm font-semibold text-ink">Nullstill</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* "My location" — DEMO: recenters on the mock demo location, no real GPS. */}
      <View
        className="absolute right-gutter items-end gap-1"
        style={{ bottom: 72 + insets.bottom }}
      >
        <DemoBadge />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Gå til min posisjon (demo)"
          onPress={() => setRecenterSignal((n) => n + 1)}
          className="h-12 w-12 items-center justify-center rounded-full border border-line bg-surface shadow-sm"
        >
          <Ionicons name="locate" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <MapFilterSheet
        visible={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
      <PlaceDetailSheet
        place={selected}
        visible={selected !== null}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}
