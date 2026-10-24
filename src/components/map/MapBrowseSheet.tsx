import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";

import { MAP_CITY, type MockWeather } from "@/fixtures";
import { colors } from "@/theme";

import { browseAnimatedIndex } from "./browseSheetProgress";
import type { DiscoveryItem } from "./types/mapPresentation";

// Airbnb-style persistent "browse" sheet. Always peeks (~9%) when no marker
// detail is open, showing a city + weather header; dragging up expands into a
// list of large image cards for the active discovery results (MASTER_SPEC §6
// map/list alternative). Row tap opens the same detail sheet a marker tap does.
// A floating "Kart" pill collapses the expanded list back to the map peek.
// When a marker detail opens, `hidden` collapses this out of the way.
export function MapBrowseSheet({
  items,
  selectedMarkerId,
  onSelect,
  isSaved,
  onToggleSave,
  emptyMessage,
  areaLabel,
  weather,
  hidden,
  expandSignal = 0,
}: {
  items: DiscoveryItem[];
  selectedMarkerId: string | null;
  onSelect: (item: DiscoveryItem) => void;
  isSaved: (markerId: string) => boolean;
  onToggleSave: (item: DiscoveryItem) => void;
  emptyMessage: string;
  areaLabel: string | null;
  weather: MockWeather;
  hidden: boolean;
  // Bumped to force the sheet to expand (e.g. a SoftMap cluster tap).
  expandSignal?: number;
}) {
  const snapPoints = useMemo(() => ["7.2%", "49%", "84.5%"], []);
  const sheetRef = useRef<BottomSheet>(null);

  // The floating "Kart" pill mirrors the tab bar: it fades + slides in as the
  // sheet goes mid (index 1) → full (index 2), driven by the same shared value.
  // `pillInteractive` gates touches so the invisible pill never swallows taps
  // on the cards below while it is faded out.
  const [pillInteractive, setPillInteractive] = useState(false);
  const pillStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      browseAnimatedIndex.value,
      [1, 2],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity: progress,
      transform: [{ translateY: (1 - progress) * 24 }],
    };
  });
  useAnimatedReaction(
    () =>
      interpolate(
        browseAnimatedIndex.value,
        [1, 2],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    (progress, prev) => {
      const active = progress > 0.6;
      if (active !== (prev != null && prev > 0.6)) {
        runOnJS(setPillInteractive)(active);
      }
    },
  );

  // Collapse to the peek (lowest snap) while a marker detail is open, and
  // restore to it when the detail closes. Never `close()` — the sheet must
  // never drop below its minimum snap point; a marker detail renders on top
  // and covers the peek.
  useEffect(() => {
    sheetRef.current?.snapToIndex(0);
  }, [hidden]);

  // Expand on demand (cluster tap).
  useEffect(() => {
    if (expandSignal > 0 && !hidden) sheetRef.current?.snapToIndex(1);
  }, [expandSignal, hidden]);

  // Reset the shared animated index when this screen unmounts so the tab bar
  // (which reads it) is fully shown on the other tabs.
  useEffect(() => {
    return () => {
      browseAnimatedIndex.value = 0;
    };
  }, []);

  const cityLine = areaLabel ? `${MAP_CITY} · ${areaLabel}` : MAP_CITY;
  // The pill is mounted whenever the sheet is live; its own opacity hides it
  // until the sheet nears full extent.
  const showMapPill = !hidden;

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        animatedIndex={browseAnimatedIndex}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        // Hard requirement: the sheet must never slide below its lowest snap
        // point. gorhom's default overdrag rubber-bands ~60px past the peek on
        // an active down-drag; disabling it clamps the gesture at index 0.
        enableOverDrag={false}
        handleIndicatorStyle={{ backgroundColor: colors.line }}
        backgroundStyle={{ backgroundColor: colors.surface }}
      >
        {/* Peek header — city (left) + weather (right). Always visible. */}
        <View className="flex-row items-center justify-between pb-3 px-gutter">
          <View className="flex-row items-center flex-1 gap-2">
            <Ionicons name="location" size={18} color={colors.ember} />
            <Text
              className="text-base font-semibold text-ink"
              numberOfLines={1}
            >
              {cityLine}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1">
              <Ionicons
                name={weather.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={colors.ink}
              />
              <Text className="text-sm font-semibold text-ink">
                {weather.tempC}°
              </Text>
            </View>
          </View>
        </View>

        <BottomSheetFlatList
          data={items}
          keyExtractor={(i) => i.markerId}
          contentContainerClassName="gap-6 px-gutter pb-28"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center gap-2 p-gutter">
              <Ionicons name="compass-outline" size={32} color={colors.muted} />
              <Text className="text-sm text-center text-muted">
                {emptyMessage}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const selected = item.markerId === selectedMarkerId;
            const saved = isSaved(item.markerId);
            return (
              // Card wrapper is a View; the save heart is a SIBLING of the
              // select Pressable (never nested) — nested <button> is invalid
              // DOM on web.
              <View className="relative gap-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${item.title}, ${item.category}, ${item.subtitle}`}
                  onPress={() => onSelect(item)}
                  className="gap-3"
                >
                  {/* Hero — full-width placeholder image block with overlays. */}
                  <View
                    className={`h-52 w-full items-center justify-center overflow-hidden rounded-lg bg-surfaceMuted ${
                      selected ? "border-2 border-ink" : ""
                    }`}
                  >
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={colors.muted}
                    />

                    {/* Top-left: category chip. */}
                    <View className="absolute left-3 top-3">
                      <View className="px-3 py-1 rounded-full bg-surface">
                        <Text className="text-xs font-semibold text-ink">
                          {item.category}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Body — title + rating, subtitle, info line, tag chips. */}
                  <View className="gap-1">
                    <View className="flex-row items-center gap-2">
                      <Text
                        className="flex-1 text-base font-semibold text-ink"
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {item.rating != null ? (
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="star" size={13} color={colors.ink} />
                          <Text className="text-sm font-semibold text-ink">
                            {item.rating.toFixed(1).replace(".", ",")}
                          </Text>
                          {item.reviewCount != null ? (
                            <Text className="text-sm text-muted">
                              ({item.reviewCount})
                            </Text>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                    <Text className="text-sm text-muted" numberOfLines={1}>
                      {item.category} · {item.subtitle}
                    </Text>
                    {item.meta ? (
                      <Text
                        className="text-sm font-semibold text-ink"
                        numberOfLines={1}
                      >
                        {item.meta}
                      </Text>
                    ) : null}
                    {item.tags && item.tags.length > 0 ? (
                      <View className="flex-row flex-wrap gap-1.5 mt-0.5">
                        {item.tags.slice(0, 3).map((t) => (
                          <View
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-surfaceMuted"
                          >
                            <Text className="text-[11px] text-muted">{t}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </Pressable>

                {/* Top-right save (heart) — sibling overlay over the hero. */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={saved ? "Fjern fra lagret" : "Lagre"}
                  accessibilityState={{ selected: saved }}
                  onPress={() => onToggleSave(item)}
                  hitSlop={8}
                  className="absolute items-center justify-center rounded-full right-3 top-3 h-9 w-9 bg-surface/90"
                >
                  <Ionicons
                    name={saved ? "heart" : "heart-outline"}
                    size={22}
                    color={saved ? colors.ember : colors.ink}
                  />
                </Pressable>
              </View>
            );
          }}
        />
      </BottomSheet>

      {/* Floating "Kart" pill — fades + slides in as the sheet nears full
          extent (mirroring the tab bar fading out); tapping it collapses the
          list back to the map. */}
      {showMapPill ? (
        <Animated.View
          pointerEvents={pillInteractive ? "box-none" : "none"}
          style={pillStyle}
          className="absolute inset-x-0 items-center bottom-8"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Vis kart"
            onPress={() => sheetRef.current?.snapToIndex(0)}
            className="flex-row items-center gap-2 px-5 py-3 rounded-full bg-ink"
          >
            <Text className="text-sm font-semibold text-onInk">Kart</Text>
            <Ionicons name="map" size={16} color={colors.onInk} />
          </Pressable>
        </Animated.View>
      ) : null}
    </>
  );
}
