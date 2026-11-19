import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Keyboard, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Icon,
  BACK_ICON,
  IconButton,
  type IconName,
  Text,
  Pressable as UIPressable,
} from "@/components/ui";
import { experienceById, placeById } from "@/fixtures";
import { coverForPlace, libThumb, smallImage } from "@/fixtures/images";
import { SearchBar } from "@/components/SearchBar";

import { useRecentSearches } from "./hooks/useRecentSearches";
import { useRecentlyViewed, type ViewedItem } from "./hooks/useRecentlyViewed";
import { searchFixtures, type SearchResult } from "./services/mapSearch";

// Map search (Phase 12 H4c: the /search page, was a full-screen overlay).
// Deterministic fixture search only (no network, no stored history — CB-8).
// Focused field → recent searches and "Nylig sett" (empty query) or grouped
// results (På kartet / Opplevelser / Grupper). The page decides where a
// submit or a pick goes (back to the map with the query, or the item).
// No suggestion chips above the results (user 2026-11-11: "remove the five
// options that appears below the search"): they repeated the result rows.
export function MapSearch({
  initialQuery,
  onBack,
  onSubmit,
  onSelect,
}: {
  initialQuery: string;
  onBack: () => void;
  onSubmit: (q: string) => void;
  onSelect: (r: SearchResult) => void;
}) {
  const insets = useSafeAreaInsets();
  const { recent, add, remove, clear } = useRecentSearches();
  const { viewed, clear: clearViewed } = useRecentlyViewed();
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => searchFixtures(query), [query]);
  const hasQuery = query.trim() !== "";

  const submit = (q: string) => {
    add(q);
    Keyboard.dismiss();
    onSubmit(q);
  };

  const pick = (r: SearchResult) => {
    add(r.title);
    Keyboard.dismiss();
    onSelect(r);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Full-screen search page: back arrow or Android back leaves it. */}
      <View
        className="flex-1"
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom,
        }}
      >
        {/* Header: back + search field */}
        <View className="flex-row items-center gap-2 px-gutter pb-2">
          <IconButton
            icon={BACK_ICON}
            label="Tilbake"
            onPress={() => {
              Keyboard.dismiss();
              onBack();
            }}
          />
          <View className="flex-1">
            <SearchBar
              placeholder="Søk steder, opplevelser, grupper"
              value={query}
              onChangeText={setQuery}
              onSubmit={submit}
              autoFocus
            />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-gutter pb-16 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          {!hasQuery ? (
            <>
              {recent.length === 0 && viewed.length === 0 ? (
                <View className="items-center gap-2 pt-10">
                  <Icon name="time-outline" size="xl" tone="muted" />
                  <Text variant="caption" tone="muted" className="text-center">
                    Søk etter steder, opplevelser og grupper.
                  </Text>
                </View>
              ) : null}
              <RecentSearches
                recent={recent}
                onPick={submit}
                onRemove={remove}
                onClear={clear}
              />
              <RecentlyViewed
                viewed={viewed}
                onClear={clearViewed}
                onPick={(v) => {
                  onSelect({
                    kind: v.kind,
                    id: v.id,
                    title: v.title,
                    subtitle: "",
                  });
                }}
              />
            </>
          ) : results.total === 0 ? (
            <View className="items-center gap-2 pt-10">
              <Icon name="search" size="xl" tone="muted" />
              <Text variant="body" weight="semibold">
                Ingen treff
              </Text>
              <Text variant="caption" tone="muted" className="text-center">
                Prøv et annet søkeord.
              </Text>
            </View>
          ) : (
            <>
              {/* More matches than the rows show (a type search: "park",
                  "festival"): the submit lists them all on the map. */}
              {results.onMap >
              results.places.length + results.experiences.length ? (
                <UIPressable
                  accessibilityRole="button"
                  accessibilityLabel={`Vis alle ${results.onMap} på kartet`}
                  onPress={() => submit(query)}
                  contentClassName="flex-row items-center gap-3 rounded-md px-1 py-2"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted">
                    <Icon name="map-outline" size="md" tone="ink" />
                  </View>
                  <Text variant="body" weight="semibold" className="flex-1">
                    {`Vis alle ${results.onMap} på kartet`}
                  </Text>
                  <Icon name="chevron-forward" size="md" tone="muted" />
                </UIPressable>
              ) : null}
              <ResultGroup
                title="På kartet"
                icon="location-outline"
                items={results.places}
                onPick={pick}
              />
              <ResultGroup
                title="Opplevelser"
                icon="tp-experience"
                items={results.experiences}
                onPick={pick}
              />
              <ResultGroup
                title="Grupper"
                icon="people-outline"
                items={results.groups}
                onPick={pick}
              />
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function RecentSearches({
  recent,
  onPick,
  onRemove,
  onClear,
}: {
  recent: readonly string[];
  onPick: (q: string) => void;
  onRemove: (q: string) => void;
  onClear: () => void;
}) {
  if (recent.length === 0) return null;
  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text variant="label" weight="semibold">
          Nylige søk
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tøm nylige søk"
          onPress={onClear}
        >
          <Text variant="caption" tone="muted">
            Tøm
          </Text>
        </Pressable>
      </View>
      {recent.map((q) => (
        <View
          key={q}
          className="flex-row items-center gap-3 rounded-md px-1 py-2"
        >
          <UIPressable
            accessibilityRole="button"
            accessibilityLabel={`Søk etter ${q}`}
            onPress={() => onPick(q)}
            className="flex-1"
            contentClassName="flex-row items-center gap-3"
          >
            <Icon name="time-outline" size="md" tone="muted" />
            <Text variant="body">{q}</Text>
          </UIPressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Fjern ${q}`}
            onPress={() => onRemove(q)}
            hitSlop={8}
          >
            <Icon name="close" size="md" tone="muted" />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

// "Nylig sett" (approved new surface, 2026-11-06): details opened in this
// session, newest first. Local only; the note says it clears on restart.
function RecentlyViewed({
  viewed,
  onPick,
  onClear,
}: {
  viewed: readonly ViewedItem[];
  onPick: (v: ViewedItem) => void;
  onClear: () => void;
}) {
  if (viewed.length === 0) return null;
  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text variant="label" weight="semibold">
          Nylig sett
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tøm nylig sett"
          onPress={onClear}
          hitSlop={8}
        >
          <Text variant="caption" tone="muted">
            Tøm
          </Text>
        </Pressable>
      </View>
      {viewed.map((v) => {
        const place = v.kind === "place" ? placeById(v.id) : undefined;
        const exp = v.kind === "experience" ? experienceById(v.id) : undefined;
        const src = place
          ? libThumb(coverForPlace(place))
          : exp?.photos[0] && smallImage(exp.photos[0]);
        return (
          <UIPressable
            key={`${v.kind}:${v.id}`}
            accessibilityRole="button"
            accessibilityLabel={`${v.title}, ${v.kind === "place" ? "sted" : "opplevelse"}`}
            onPress={() => onPick(v)}
            pressedScale={0.99}
            contentClassName="flex-row items-center gap-3 rounded-md px-1 py-2"
          >
            {src ? (
              <Image
                source={src}
                contentFit="cover"
                style={{ height: 40, width: 40, borderRadius: 8 }}
                accessible={false}
              />
            ) : (
              <View className="h-10 w-10 rounded-sm bg-surfaceMuted" />
            )}
            <View className="flex-1">
              <Text variant="body" numberOfLines={1}>
                {v.title}
              </Text>
              <Text variant="caption" tone="muted">
                {v.kind === "place" ? "Sted" : "Opplevelse"}
              </Text>
            </View>
          </UIPressable>
        );
      })}
    </View>
  );
}

function ResultGroup({
  title,
  icon,
  items,
  onPick,
}: {
  title: string;
  icon: IconName;
  items: SearchResult[];
  onPick: (r: SearchResult) => void;
}) {
  if (items.length === 0) return null;
  return (
    <View className="gap-1">
      <Text variant="label" weight="semibold">
        {title}
      </Text>
      {items.map((r) => (
        <UIPressable
          key={`${r.kind}:${r.id}`}
          accessibilityRole="button"
          accessibilityLabel={`${r.title}, ${r.subtitle}`}
          onPress={() => onPick(r)}
          contentClassName="flex-row items-center gap-3 rounded-md px-1 py-2"
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted">
            <Icon name={icon} size="md" tone="ink" />
          </View>
          <View className="flex-1">
            <Text variant="body" numberOfLines={1}>
              {r.title}
            </Text>
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {r.subtitle}
            </Text>
          </View>
        </UIPressable>
      ))}
    </View>
  );
}
