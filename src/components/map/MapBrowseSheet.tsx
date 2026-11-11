import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  Badge,
  HeartToggle,
  Icon,
  Loader,
  Pressable as UIPressable,
  SkeletonList,
  Text,
  useSheetChrome,
} from "@/components/ui";
import { elevation, gutterPx } from "@/theme";
import { areaFor, type MockWeather } from "@/fixtures";
import { useOrigin } from "@/lib/origin";
import { formatRating } from "@/lib/format";
import { GoingLine } from "@/components/GoingLine";
import { PhotoPager } from "./PhotoPager";
import { sheetA11yChrome } from "./sheetA11y";
import { photosForItem } from "./services/itemCover";
import { browseCardLine, browseCardOpenBadge } from "./services/itemType";
import type { DiscoveryItem } from "./types/mapPresentation";

// Airbnb-style persistent "browse" sheet. Always peeks (handle + header,
// measured) when no marker
// detail is open, showing a city + weather header; dragging up expands into a
// list of large image cards for the active discovery results (MASTER_SPEC §6
// map/list alternative). Row tap opens the same detail sheet a marker tap does.
// A floating "Kart" pill collapses the expanded list back to the map peek.
// When a marker detail opens, `hidden` collapses this out of the way.
// The sheet handle area above the header (indicator + vertical padding).
const PEEK_HANDLE = 24;
// The card's floating bookmark (IconButton size "sm") is this tall; the
// opening badge on the other corner is centred on the same line.
const BOOKMARK_PX = 36;

// Memoised (speed pass 0345): the map screen passes stable props, so this
// sheet renders only when its list, selection or state really change.
export const MapBrowseSheet = memo(function MapBrowseSheet({
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
  loading = false,
  loadingSlow = false,
  onPeekHeight,
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
  /** Mock load in flight: show skeleton cards instead of the empty message. */
  loading?: boolean;
  /** Past 2 s: the loader replaces the skeleton (useLoadPhase). */
  loadingSlow?: boolean;
  /** Measured peek height, so map tools can sit just above it. */
  onPeekHeight?: (h: number) => void;
}) {
  const chrome = useSheetChrome();
  // Peek = handle + the measured city/weather header, so no card photo shows
  // under it (review L11; a fixed 8% left a sliver of the first card).
  const [peek, setPeek] = useState<number | null>(null);
  const snapPoints = useMemo(() => [peek ?? "8%", "49%", "83.5%"], [peek]);
  const sheetRef = useRef<BottomSheet>(null);
  // Live fractional snap index (0 peek · 1 mid · 2 full), written by gorhom;
  // the floating "Kart" pill reads it. Per mount, so it starts at the peek.
  const browseAnimatedIndex = useSharedValue(0);

  // The floating "Kart" pill fades + slides in as the sheet goes mid
  // (index 1) → full (index 2), driven by the shared animated index.
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

  // Parent callbacks are read through refs so the card callbacks stay stable;
  // with memoized cards, a map re-render only re-renders cards whose
  // selected/saved state actually changed.
  const onSelectRef = useRef(onSelect);
  const onToggleSaveRef = useRef(onToggleSave);
  useEffect(() => {
    onSelectRef.current = onSelect;
    onToggleSaveRef.current = onToggleSave;
  }, [onSelect, onToggleSave]);
  const handleSelect = useCallback(
    (item: DiscoveryItem) => onSelectRef.current(item),
    [],
  );
  const handleToggleSave = useCallback(
    (item: DiscoveryItem) => onToggleSaveRef.current(item),
    [],
  );
  // The cards span the sheet (the window) less the list's gutters; measured
  // here once instead of by every card's photo pager (speed pass 0349).
  const cardWidth = Math.round(useWindowDimensions().width - 2 * gutterPx);
  const renderItem = useCallback(
    ({ item }: { item: DiscoveryItem }) => (
      <BrowseCard
        item={item}
        width={cardWidth}
        selected={item.markerId === selectedMarkerId}
        saved={isSaved(item.markerId)}
        onSelect={handleSelect}
        onToggleSave={handleToggleSave}
      />
    ),
    [cardWidth, selectedMarkerId, isSaved, handleSelect, handleToggleSave],
  );

  // The municipality the person is in (Phase 19: Oslo and Akershus), then
  // the picked area or "Min posisjon", as before.
  const city = areaFor(useOrigin().coord).municipality;
  const cityLine = areaLabel ? `${city} · ${areaLabel}` : city;
  // The pill is mounted whenever the sheet is live; its own opacity hides it
  // until the sheet nears full extent.
  const showMapPill = !hidden;

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        index={0}
        // Placed at the peek on the first frame, no mount slide. With the
        // mount animation, the measured peek changed the snap points mid-slide
        // and the native view stayed at the closed position (below the tab
        // bar) on the rebuilt dev client, although gorhom reported index 0.
        animateOnMount={false}
        snapPoints={snapPoints}
        animatedIndex={browseAnimatedIndex}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        // Hard requirement: the sheet must never slide below its lowest snap
        // point. gorhom's default overdrag rubber-bands ~60px past the peek on
        // an active down-drag; disabling it clamps the gesture at index 0.
        enableOverDrag={false}
        {...chrome}
        {...sheetA11yChrome}
      >
        {/* Peek header — city (left) + weather (right). Always visible. */}
        <View
          onLayout={(e) => {
            const h = Math.round(e.nativeEvent.layout.height);
            if (h > 0) {
              setPeek(PEEK_HANDLE + h);
              onPeekHeight?.(PEEK_HANDLE + h);
            }
          }}
          className="flex-row items-center justify-between pb-3 px-gutter"
        >
          <View className="flex-row items-center flex-1 gap-2">
            <Icon name="location" size="md" tone="ember" />
            <View className="flex-1">
              <Text variant="body" weight="semibold" numberOfLines={1}>
                {cityLine}
              </Text>
              {/* How many results the list holds (fixture count; benchmark
                  B1). No sort claim: there is no ranking contract. */}
              {loading ? null : (
                <Text variant="caption" tone="muted">
                  {items.length} treff
                </Text>
              )}
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            {/* Fixture weather (MockWeather), not a live reading. */}

            <View
              accessible
              accessibilityLabel={`Vær: ${weather.tempC} grader`}
              className="flex-row items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1"
            >
              <Icon
                name={weather.icon as keyof typeof Ionicons.glyphMap}
                size="md"
                tone="ink"
              />
              <Text variant="label" weight="semibold">
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
            loading ? (
              loadingSlow ? (
                <Loader label="Laster steder …" />
              ) : (
                <SkeletonList
                  variant="mediaCard"
                  count={2}
                  label="Laster steder"
                />
              )
            ) : (
              <View className="items-center gap-2 p-gutter">
                <Icon name="compass-outline" size="xl" tone="muted" />
                <Text variant="caption" tone="muted" className="text-center">
                  {emptyMessage}
                </Text>
              </View>
            )
          }
          renderItem={renderItem}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          // Two screens of cards above and below (was three; speed pass
          // 0349). The cards differ in height (lines, tags, who is going),
          // so there is no getItemLayout.
          windowSize={5}
        />
      </BottomSheet>

      {/* Floating "Kart" pill — fades + slides in as the sheet nears full
          extent; tapping it collapses the
          list back to the map. */}
      {showMapPill ? (
        // Positioned by a plain View; the animated wrapper only carries the
        // fade/slide style (className on Animated views is lost on a cold
        // start — CLAUDE.md).
        <View
          pointerEvents={pillInteractive ? "box-none" : "none"}
          className="absolute inset-x-0 items-center bottom-8"
        >
          <Animated.View style={pillStyle}>
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel="Vis kart"
              onPress={() => sheetRef.current?.snapToIndex(0)}
              contentClassName="flex-row items-center gap-sm rounded-full bg-ink px-lg py-md"
              contentStyle={elevation.e2}
            >
              <Text variant="label" weight="semibold" tone="onInk">
                Kart
              </Text>
              <Icon name="map" size="sm" tone="onInk" />
            </UIPressable>
          </Animated.View>
        </View>
      ) : null}
    </>
  );
});

// One result card. Memoized: props are primitives + stable callbacks, so it
// re-renders only when its own item/selected/saved changes.
export const BrowseCard = memo(function BrowseCard({
  item,
  width,
  selected,
  saved,
  onSelect,
  onToggleSave,
}: {
  item: DiscoveryItem;
  /** The card's width, when the list knows it: the photos page without a
   * layout pass of their own. */
  width?: number;
  selected: boolean;
  saved: boolean;
  onSelect: (item: DiscoveryItem) => void;
  onToggleSave: (item: DiscoveryItem) => void;
}) {
  const photos = photosForItem(item);
  // Tags that repeat the type line ("Festival", the activity) are left out:
  // every fact once.
  const typeWords = new Set(
    (item.typeLabel ?? "").toLowerCase().split(" · ").filter(Boolean),
  );
  const tags = (item.tags ?? [])
    .filter((t) => !typeWords.has(t.toLowerCase()))
    .slice(0, 3);
  const line = browseCardLine(item);
  const openBadge = browseCardOpenBadge(item);
  return (
    // Card wrapper is a View; the save button is a SIBLING of the
    // select Pressable (never nested) — nested <button> is invalid
    // DOM on web.
    <View className="relative gap-3">
      <UIPressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        // A screen reader hears the type, area and distance the card leaves
        // out (founder 2026-11-08) and a place's opening (the badge on a
        // Bedrift or Byrom photo is drawn only).
        accessibilityLabel={`${item.title}, ${item.subtitle}${
          item.openNow === undefined
            ? ""
            : item.openNow
              ? ", åpent nå"
              : ", stengt nå"
        }`}
        onPress={() => onSelect(item)}
        // No long-press menu on the cards (user 2026-11-09); Lagret and
        // Chat rows keep theirs.
        contentClassName="gap-3"
      >
        {/* Hero: bundled photo (placeholder when an item has none). */}
        {/* Near-square photo (benchmark B2), swipeable when the item has
            several (B3). */}
        <View
          style={{ aspectRatio: 1.05 }}
          className={`w-full items-center justify-center overflow-hidden rounded-xl bg-surfaceMuted ${
            selected ? "border-2 border-ink" : ""
          }`}
        >
          {photos.length > 0 ? (
            <PhotoPager
              photos={photos}
              // The selected card's 2 px ink border sits inside the photo box.
              width={
                width === undefined ? undefined : width - (selected ? 4 : 0)
              }
            />
          ) : (
            <Icon name="image-outline" size="2xl" tone="muted" />
          )}
        </View>

        {/* Body (founder 2026-11-08): title + rating, then what it is
            (a business's or city space's kind, "Buldresenter", "Park"; an
            experience's activity; "Organisasjon") with a Bedrift's or
            Byrom's distance (2026-11-09), an Organisasjon's opening or an
            experience's time; for an experience who is going and its price
            (places show no price); tag chips. No pin category or area. */}
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <Text
              variant="body"
              weight="semibold"
              className="flex-1"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {item.rating != null ? (
              <View className="flex-row items-center gap-1">
                <Icon name="star" size="sm" tone="ink" />
                <Text variant="label" weight="semibold">
                  {formatRating(item.rating)}
                </Text>
                {item.reviewCount != null ? (
                  <Text variant="caption" tone="muted">
                    ({item.reviewCount})
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
          {line ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {line}
            </Text>
          ) : null}
          {item.kind === "experience" ? (
            <>
              {/* Who is going, live with your own join (Phase 16). */}
              <GoingLine id={item.id} />
              {item.price ? (
                <Text variant="label" weight="semibold" numberOfLines={1}>
                  {item.price}
                </Text>
              ) : null}
            </>
          ) : null}
          {tags.length > 0 ? (
            <View className="flex-row flex-wrap gap-1.5 mt-0.5">
              {tags.map((t) => (
                <View
                  key={t}
                  className="px-2 py-0.5 rounded-full bg-surfaceMuted"
                >
                  <Text variant="caption" tone="muted">
                    {t}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </UIPressable>

      {/* Top-right save — sibling overlay over the hero. The save icon (a
          bookmark, as in Sveip), not a heart (founder 2026-11-08). */}
      <HeartToggle
        kind="bookmark"
        selected={saved}
        onToggle={() => onToggleSave(item)}
        variant="floating"
        size="sm"
        className="absolute right-3 top-3"
      />

      {/* Top-left: a Bedrift's or Byrom's opening, green "Åpent" or red
          "Stengt" (user 2026-11-09). A plain View as tall as the bookmark, so the
          two sit on one line; touches pass through to the photos. */}
      {openBadge ? (
        <View
          pointerEvents="none"
          className="absolute left-3 top-3 justify-center"
          style={{ height: BOOKMARK_PX }}
        >
          <Badge
            kind="status"
            solid
            tone={openBadge.tone}
            label={openBadge.label}
          />
        </View>
      ) : null}
    </View>
  );
});
