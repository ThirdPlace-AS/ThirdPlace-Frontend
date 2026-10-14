import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DemoBadge } from "@/components/DemoBadge";
import { MapCanvas } from "@/components/map/MapCanvas";
import { DiscoveryModeTabs } from "@/components/map/DiscoveryModeTabs";
import { MapDetailSheet } from "@/components/map/MapDetailSheet";
import { MapFilterSheet } from "@/components/map/MapFilterSheet";
import { MapPreviewCard } from "@/components/map/MapPreviewCard";
import { MapResultsList } from "@/components/map/MapResultsList";
import { useMapCamera } from "@/components/map/hooks/useMapCamera";
import { useMapDiscovery } from "@/components/map/hooks/useMapDiscovery";
import { useMapFilters } from "@/components/map/hooks/useMapFilters";
import { useMapPresentation } from "@/components/map/hooks/useMapPresentation";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { useMapSelection } from "@/components/map/hooks/useMapSelection";
import { NotificationsSheet } from "@/components/NotificationsSheet";
import { SearchBar } from "@/components/SearchBar";
import { places } from "@/fixtures";
import { useMockResource } from "@/hooks/useMockResource";
import { colors } from "@/theme";

// Map discovery surface. Thin composition over feature hooks:
// filters/search, discovery mode, selection (preview + detail sheet), map/list
// presentation, camera, saved. All data is MOCK fixtures (no backend).
export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [filterOpen, setFilterOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const filters = useMapFilters();
  const saved = useMapSaved();
  const discovery = useMapDiscovery({
    places: filters.filteredPlaces,
    query: filters.query,
    savedIds: saved.savedIds,
  });
  const selection = useMapSelection();
  const presentation = useMapPresentation();
  const camera = useMapCamera();

  // Mock async load so the surface can show a loading state (no backend).
  const { status } = useMockResource(places, { delayMs: 500 });
  const loading = status === "loading";

  const items = discovery.items;
  const noResults = !loading && items.length === 0;
  const isMap = presentation.view === "map";

  const itemByMarker = useMemo(() => {
    const map = new Map(items.map((i) => [i.markerId, i]));
    return map;
  }, [items]);

  const handleSelectMarker = (markerId: string) => {
    const item = itemByMarker.get(markerId);
    if (item) selection.selectPreview(item);
  };

  return (
    <View className="flex-1 bg-background">
      {isMap ? (
        <MapCanvas
          fill
          markers={loading ? [] : items}
          selectedMarkerId={selection.selectedMarkerId}
          onSelectMarker={handleSelectMarker}
          recenterSignal={camera.recenterSignal}
        />
      ) : (
        <View className="flex-1" style={{ paddingTop: insets.top + 118 }}>
          <MapResultsList
            items={items}
            selectedMarkerId={selection.selectedMarkerId}
            onSelect={(i) => selection.openTarget({ kind: i.kind, id: i.id })}
            isSaved={saved.isSaved}
            onToggleSave={(i) => saved.toggle(i.markerId)}
            demo={discovery.demo}
            note={discovery.note}
            emptyMessage={discovery.emptyMessage}
          />
        </View>
      )}

      {/* Floating top controls: search + notifications, then discovery modes */}
      <View
        className="absolute left-0 right-0 top-0 gap-2 px-gutter pb-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <SearchBar
              placeholder="Søk steder og opplevelser"
              value={filters.query}
              onChangeText={filters.setQuery}
              right={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Filtre"
                  onPress={() => setFilterOpen(true)}
                  className="-mr-1 h-7 w-7 items-center justify-center rounded-full"
                >
                  <Ionicons
                    name="options-outline"
                    size={20}
                    color={colors.ink}
                  />
                  {filters.extraCount > 0 ? (
                    <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-ember">
                      <Text className="text-[9px] font-bold text-onEmber">
                        {filters.extraCount}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              }
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Varsler"
            onPress={() => setNotifOpen(true)}
            className="h-12 w-12 items-center justify-center rounded-full border border-line bg-surface"
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.ink}
            />
          </Pressable>
        </View>

        <View className="rounded-full border border-line bg-surface px-3 py-1">
          <DiscoveryModeTabs
            mode={discovery.mode}
            onChange={discovery.setMode}
          />
        </View>

        {discovery.demo ? (
          <View className="flex-row items-center gap-2 self-start rounded-full border border-line bg-surface px-3 py-1">
            <DemoBadge />
            {discovery.note ? (
              <Text className="text-[11px] text-muted">{discovery.note}</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Loading overlay (mock async load) */}
      {loading && isMap ? (
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

      {/* Empty overlay (map view) — no results for the current mode/filters */}
      {noResults && isMap ? (
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
              {discovery.emptyMessage}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={filters.reset}
              className="mt-1 rounded-md bg-surfaceMuted px-4 py-2"
            >
              <Text className="text-sm font-semibold text-ink">Nullstill</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Preview card (map view) — floats above the bottom controls */}
      {isMap && selection.preview ? (
        <View
          className="absolute left-gutter right-gutter"
          style={{ bottom: 140 + insets.bottom }}
        >
          <MapPreviewCard
            item={selection.preview}
            saved={saved.isSaved(selection.preview.markerId)}
            onToggleSave={() => saved.toggle(selection.preview!.markerId)}
            onExpand={selection.expand}
            onDismiss={selection.clearPreview}
            demo={discovery.demo}
            note={discovery.note}
          />
        </View>
      ) : null}

      {/* Bottom-left: map/list view toggle */}
      <View
        className="absolute left-gutter"
        style={{ bottom: 72 + insets.bottom }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isMap ? "Vis liste" : "Vis kart"}
          onPress={presentation.toggle}
          className="h-12 w-12 items-center justify-center rounded-full border border-line bg-surface shadow-sm"
        >
          <Ionicons
            name={isMap ? "list" : "map"}
            size={22}
            color={colors.ink}
          />
        </Pressable>
      </View>

      {/* Bottom-right: "my location" (DEMO recenter, no real GPS) */}
      {isMap ? (
        <View
          className="absolute right-gutter items-end gap-1"
          style={{ bottom: 72 + insets.bottom }}
        >
          <DemoBadge />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Gå til min posisjon (demo)"
            onPress={camera.recenter}
            className="h-12 w-12 items-center justify-center rounded-full border border-line bg-surface shadow-sm"
          >
            <Ionicons name="locate" size={22} color={colors.ink} />
          </Pressable>
        </View>
      ) : null}

      <MapFilterSheet
        visible={filterOpen}
        filters={filters.filters}
        onClose={() => setFilterOpen(false)}
        onApply={filters.setFilters}
      />
      <NotificationsSheet
        visible={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
      <MapDetailSheet
        stack={selection.sheetStack}
        push={selection.push}
        onBack={selection.back}
        onClose={selection.close}
      />
    </View>
  );
}
