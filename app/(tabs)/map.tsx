import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  Text,
  Pressable as UIPressable,
} from "@/components/ui";
import { Illustration } from "@/components/illustrations/Illustration";
import { canUseMapbox, MapCanvas } from "@/components/map/MapCanvas";
import { DiscoveryModeTabs } from "@/components/map/DiscoveryModeTabs";
import { MapDetailSheet } from "@/components/map/MapDetailSheet";
import { MapFilterSheet } from "@/components/map/MapFilterSheet";
import { MapLayerSheet } from "@/components/map/MapLayerSheet";
import { MapLocationSheet } from "@/components/map/MapLocationSheet";
import { MapSearchOverlay } from "@/components/map/MapSearchOverlay";
import { periodForKey, styleUrlFor } from "@/components/map/mapStyles";
import { StatusBarStyle } from "@/components/ui/StatusBarStyle";
import type {
  DiscoveryItem,
  DiscoveryMode,
} from "@/components/map/types/mapPresentation";
import { useMapCamera } from "@/components/map/hooks/useMapCamera";
import { useTimeOfDayStyle } from "@/components/map/hooks/useTimeOfDayStyle";
import { useMapLocation } from "@/components/map/hooks/useMapLocation";
import { useMapDiscovery } from "@/components/map/hooks/useMapDiscovery";
import { useMapFilters } from "@/components/map/hooks/useMapFilters";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import {
  mapBackAction,
  useMapSelection,
} from "@/components/map/hooks/useMapSelection";
import { NotificationsSheet } from "@/components/NotificationsSheet";
import { MapBrowseSheet } from "@/components/map/MapBrowseSheet";
import {
  MOCK_NOTIFICATIONS,
  MOCK_WEATHER,
  OSLO_AREAS,
  places,
} from "@/fixtures";
import { useMockResource } from "@/hooks/useMockResource";
import { haptics } from "@/lib/haptics";
import { elevation, useThemeColors } from "@/theme";

// Map discovery surface. Thin composition over feature hooks:
// filters/search, discovery mode, selection (detail sheet), camera, location.
// Map-only — no list view. All data is MOCK fixtures (no backend).
export default function MapScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  // Keep the bottom-right map tools clear of the persistent ~12% browse peek.
  // Tools sit just above the browse peek: its measured height once known
  // (12 % of the window left ~30 dp of extra gap on tall phones).
  const [peekH, setPeekH] = useState<number | null>(null);
  const browsePeekClearance = peekH ?? Math.round(windowHeight * 0.12);
  const [filterOpen, setFilterOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [layerOpen, setLayerOpen] = useState(false);
  const {
    styleKey,
    auto: styleAuto,
    selectStyle,
    enableAuto,
  } = useTimeOfDayStyle();
  // The dusk/night basemaps are dark whatever the app theme, so the status-bar
  // icons go light over them; the themed SoftMap follows the theme.
  const darkBasemap =
    canUseMapbox &&
    (periodForKey(styleKey) === "night" || periodForKey(styleKey) === "dusk");
  // Bumped to force the browse sheet to expand (SoftMap cluster tap).
  const [browseExpand, setBrowseExpand] = useState(0);

  const filters = useMapFilters();
  const saved = useMapSaved();
  const discovery = useMapDiscovery({
    places: filters.filteredPlaces,
    query: filters.query,
    savedIds: saved.savedIds,
    time: filters.filters.time,
    hasSpots: filters.filters.hasSpots,
  });
  const selection = useMapSelection();
  const camera = useMapCamera();
  const location = useMapLocation();

  // Stable methods (the hooks useCallback these) for memo-friendly handlers.
  const { selectMarker, back: sheetBack, close: sheetClose } = selection;

  // /map?focus=<kind>:<id>&at=<stamp> (e.g. "Vis på kartet" in the Steder
  // deck) opens that item's detail once per request; the stamp tells repeat
  // taps apart because the tab stays mounted.
  const { focus, at } = useLocalSearchParams<{ focus?: string; at?: string }>();
  const focusKey = focus ? `${focus}:${at ?? ""}` : undefined;
  const [focusedKey, setFocusedKey] = useState<string | undefined>(undefined);
  if (focusKey && focusKey !== focusedKey) {
    setFocusedKey(focusKey);
    const [kind, id] = (focus ?? "").split(":");
    if ((kind === "place" || kind === "experience") && id)
      selection.openTarget({ kind, id });
  }
  const { setMode: setDiscoveryMode } = discovery;

  // Android back key: an open detail sheet steps back / closes first, so back
  // does not leave the map with the sheet still up. Only while the map is
  // focused; Modal sheets (Filtre, search, …) handle back themselves.
  const sheetDepth = selection.sheetStack.length;
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        const action = mapBackAction(sheetDepth);
        if (action === "back") sheetBack();
        else if (action === "close") sheetClose();
        return action !== "none";
      });
      return () => sub.remove();
    }, [sheetDepth, sheetBack, sheetClose]),
  );

  // Mock async load so the surface can show loading/error states (no backend).
  // `offline` is a demo toggle (from the location sheet) that forces an error.
  const [offline, setOffline] = useState(false);
  const { status, reload } = useMockResource(places, {
    delayMs: 500,
    // No fake wait on open: the fixtures are already here. "Prøv igjen" and
    // the offline toggle still show the loading / error states.
    immediate: true,
    simulate: offline ? "error" : "success",
  });
  const loading = status === "loading";
  const errored = status === "error";

  const retry = () => {
    setOffline(false);
    reload();
  };

  const items = discovery.items;
  const noResults = !loading && !errored && items.length === 0;

  // Unread badge on the bell (MOCK — static demo notifications, no real inbox).
  const unreadNotifs = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const itemByMarker = useMemo(() => {
    const map = new Map(items.map((i) => [i.markerId, i]));
    return map;
  }, [items]);

  // Coord of the selected marker — pans the camera to center the pin above the
  // detail sheet (Google-Maps style). Null when nothing is selected.
  const focusCoord = useMemo(() => {
    const id = selection.selectedMarkerId;
    return id ? (itemByMarker.get(id)?.coord ?? null) : null;
  }, [selection.selectedMarkerId, itemByMarker]);

  // Handlers passed to memoized children are stabilized so the memo holds.
  // Tapping a marker opens the detail sheet at the 16% peek (see useMapSelection).
  const handleSelectMarker = useCallback(
    (markerId: string) => {
      const item = itemByMarker.get(markerId);
      if (item) {
        haptics.selection();
        selectMarker(item);
      }
    },
    [itemByMarker, selectMarker],
  );

  // Shared by marker taps and browse-list rows — opens the detail sheet.
  const handleSelectItem = useCallback(
    (item: DiscoveryItem) => {
      haptics.selection();
      selectMarker(item);
    },
    [selectMarker],
  );

  const handleToggleSave = useCallback(
    (item: DiscoveryItem) => saved.toggle(item.markerId),
    [saved],
  );

  // Tap on empty map: dismiss the keyboard and collapse the open sheet.
  const handleMapPress = useCallback(() => {
    Keyboard.dismiss();
    selection.close();
  }, [selection]);

  const handleModeChange = useCallback(
    (m: DiscoveryMode) => {
      haptics.selection();
      setDiscoveryMode(m);
    },
    [setDiscoveryMode],
  );

  const handleApplyFilters = (next: typeof filters.filters) => {
    haptics.light();
    // "Where?" recenters the map to the chosen Oslo area (demo — reuses the
    // manual-area fallback; it does not refilter the mock distances).
    if (next.whereArea && next.whereArea !== filters.filters.whereArea) {
      const area = OSLO_AREAS.find((a) => a.name === next.whereArea);
      if (area) {
        location.selectArea(area);
        camera.recenter();
      }
    }
    filters.setFilters(next);
  };

  const handleLocationPress = () => {
    if (location.status === "granted" && location.coord) {
      camera.recenter();
    } else if (location.status === "granted") {
      // A manual area replaced the GPS fix — go back to the real position.
      void handleRequestLocation();
    } else {
      setLocationOpen(true);
    }
  };

  const handleRequestLocation = async () => {
    await location.request();
    camera.recenter();
  };

  const handleSelectArea = (a: Parameters<typeof location.selectArea>[0]) => {
    location.selectArea(a);
    camera.recenter();
    setLocationOpen(false);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBarStyle style={darkBasemap ? "light" : "auto"} />
      <MapCanvas
        fill
        markers={loading ? [] : items}
        selectedMarkerId={selection.selectedMarkerId}
        onSelectMarker={handleSelectMarker}
        onMapPress={handleMapPress}
        onClusterPress={() => setBrowseExpand((n) => n + 1)}
        focusCoord={focusCoord}
        styleURL={styleUrlFor(styleKey)}
        darkBasemap={darkBasemap}
        recenterSignal={camera.recenterSignal}
        center={location.center}
        userCoord={location.coord}
        heading={location.heading}
      />

      {/* Floating top controls: search + notifications, then discovery modes.
          Gutter is applied per-row so the chip row can scroll edge-to-edge. */}
      <View
        className="absolute top-0 left-0 right-0 gap-2 pb-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center gap-2 px-gutter">
          {/* Search bar is a View (not a Pressable) holding two SIBLING
              Pressables — the search opener and the trailing filter icon — so
              the filter button isn't nested inside a button (invalid DOM on
              web). The search opener launches the full-screen overlay, so the
              bar itself never takes focus (no residual keyboard on close). */}
          <View className="flex-row items-center flex-1 h-12 border rounded-full border-line bg-surface">
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel="Søk steder og opplevelser"
              onPress={() => setSearchOpen(true)}
              className="flex-1"
              contentClassName="flex-row items-center h-full gap-2 pl-3"
            >
              <Icon name="search" size="md" tone="muted" />
              <Text
                numberOfLines={1}
                variant="body"
                tone={filters.query ? "ink" : "muted"}
                className="flex-1"
              >
                {filters.query || "Søk steder, opplevelser …"}
              </Text>
            </UIPressable>
            <View className="w-px h-6 bg-line" />
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel="Filtre"
              onPress={() => setFilterOpen(true)}
              className="w-12"
              contentClassName="items-center justify-center h-full"
            >
              <Icon name="options-outline" size="md" tone="ink" />
              {filters.extraCount > 0 ? (
                <View className="absolute items-center justify-center w-4 h-4 rounded-full right-1 top-1 bg-ember">
                  <Text variant="caption" weight="bold" tone="onEmber">
                    {filters.extraCount}
                  </Text>
                </View>
              ) : null}
            </UIPressable>
          </View>
          <IconButton
            icon="notifications-outline"
            label="Varsler"
            variant="outline"
            size="lg"
            badge={unreadNotifs}
            onPress={() => setNotifOpen(true)}
          />
        </View>

        <DiscoveryModeTabs mode={discovery.mode} onChange={handleModeChange} />
      </View>

      {/* Map tools (layer + location) docked bottom-right. Historically these
          lived in the top cluster because floating buttons over the BOTTOM of
          the native Mapbox map could miss taps on Android; they sit above the
          canvas (sibling, elevated) and need native-build verification (NV). */}
      <View
        pointerEvents="box-none"
        className="absolute bottom-0 right-0 items-end gap-2 px-gutter"
        style={{
          // The tab bar already covers the bottom inset inside a tab screen.
          paddingBottom: 12 + browsePeekClearance,
          zIndex: 0,
        }}
      >
        {location.areaLabel ? (
          <View className="px-2 py-1 border rounded-full border-line bg-surface">
            <Text variant="caption" tone="muted">
              {location.areaLabel}
            </Text>
          </View>
        ) : null}
        <IconButton
          icon="layers-outline"
          label="Kartlag"
          variant="floating"
          size="lg"
          onPress={() => setLayerOpen(true)}
        />
        <IconButton
          icon={location.status === "granted" ? "locate" : "locate-outline"}
          label="Posisjon"
          variant="floating"
          size="lg"
          onPress={handleLocationPress}
        />
      </View>

      {/* Loading overlay (mock async load) */}
      {loading ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-0 items-center justify-center"
        >
          <View className="flex-row items-center gap-2 px-4 py-2 border rounded-full border-line bg-surface">
            <ActivityIndicator color={colors.ink} />
            <Text variant="caption" tone="muted">
              Laster steder…
            </Text>
          </View>
        </View>
      ) : null}

      {/* Error / offline overlay — recoverable via retry */}
      {errored ? (
        <MapStateCard>
          <ErrorState
            fill={false}
            illustration={<Illustration name="offline" width={128} />}
            title="Frakoblet"
            message="Fant ikke steder. Sjekk tilkoblingen og prøv igjen."
            actionLabel="Prøv igjen"
            onAction={retry}
          />
        </MapStateCard>
      ) : null}

      {/* Empty overlay — no results for the current mode/filters */}
      {noResults ? (
        <MapStateCard>
          <EmptyState
            fill={false}
            icon="search"
            title="Ingen treff"
            message={discovery.emptyMessage}
            actionLabel="Nullstill"
            onAction={filters.reset}
          />
        </MapStateCard>
      ) : null}

      <MapFilterSheet
        visible={filterOpen}
        filters={filters.filters}
        query={filters.query}
        mode={discovery.mode}
        savedIds={saved.savedIds}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilters}
      />
      <NotificationsSheet
        visible={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
      <MapLayerSheet
        visible={layerOpen}
        active={styleKey}
        auto={styleAuto}
        onClose={() => setLayerOpen(false)}
        onSelect={selectStyle}
        onEnableAuto={enableAuto}
      />
      <MapLocationSheet
        visible={locationOpen}
        onClose={() => setLocationOpen(false)}
        status={location.status}
        areaLabel={location.areaLabel}
        selectedAreaName={location.area?.name ?? null}
        onRequest={handleRequestLocation}
        onSelectArea={handleSelectArea}
        offline={offline}
        onToggleOffline={() => setOffline((v) => !v)}
      />
      <MapSearchOverlay
        visible={searchOpen}
        initialQuery={filters.query}
        onClose={() => setSearchOpen(false)}
        onSubmit={filters.setQuery}
        onSelect={(r) => selection.openTarget({ kind: r.kind, id: r.id })}
      />
      {/* Persistent Google-Maps-style peek: city + weather header, drag up for
          the Airbnb list of the active mode. Rendered BEFORE the detail sheet so
          it sits behind it — while a marker detail is open the sheet collapses
          to its peek (never below) and the detail, on top, covers it. */}
      {!errored ? (
        <MapBrowseSheet
          items={loading ? [] : items}
          loading={loading}
          selectedMarkerId={selection.selectedMarkerId}
          onSelect={handleSelectItem}
          isSaved={saved.isSaved}
          onToggleSave={handleToggleSave}
          emptyMessage={discovery.emptyMessage}
          areaLabel={location.areaLabel}
          weather={MOCK_WEATHER}
          hidden={selection.sheetStack.length > 0}
          expandSignal={browseExpand}
          onPeekHeight={setPeekH}
        />
      ) : null}

      {/* Mounted only while open: a closed @gorhom sheet keeps a full-screen
          container that would swallow taps meant for the map's floating buttons. */}
      {selection.sheetStack.length > 0 ? (
        <MapDetailSheet
          stack={selection.sheetStack}
          openIndex={selection.openIndex}
          openNonce={selection.openNonce}
          push={selection.push}
          onBack={selection.back}
          onClose={selection.close}
        />
      ) : null}
    </View>
  );
}

// A floating card over the map for the empty/error states (taps outside it
// still reach the map).
function MapStateCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-0 items-center justify-center p-gutter"
    >
      <View
        className="w-full max-w-sm rounded-lg bg-surface"
        style={elevation.e2}
      >
        {children}
      </View>
    </View>
  );
}
