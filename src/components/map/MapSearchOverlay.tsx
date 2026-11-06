import { useMemo, useState } from "react";
import { Keyboard, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Icon,
  IconButton,
  Overlay,
  type IconName,
  Text,
} from "@/components/ui";
import { Chip } from "@/components/Chip";
import { SearchBar } from "@/components/SearchBar";

import { useRecentSearches } from "./hooks/useRecentSearches";
import {
  searchFixtures,
  suggestFixtures,
  type SearchResult,
} from "./services/mapSearch";

// Full-screen search overlay. Deterministic fixture search only (no network, no
// stored history — CB-8). Focused field → recent searches (empty query) or
// grouped results (På kartet / Opplevelser / Grupper). Selecting a result opens
// it; submitting applies the text as the map search filter.
export function MapSearchOverlay({
  visible,
  initialQuery,
  onClose,
  onSubmit,
  onSelect,
}: {
  visible: boolean;
  initialQuery: string;
  onClose: () => void;
  onSubmit: (q: string) => void;
  onSelect: (r: SearchResult) => void;
}) {
  // Closing fully disengages search: drop the keyboard, then close. The map's
  // search is a button (not an input), so there is no field to refocus behind us.
  const close = () => {
    Keyboard.dismiss();
    onClose();
  };
  return (
    // The Overlay mounts the body only while open, so query state seeds fresh
    // from `initialQuery` on each open (no setState-in-effect).
    <Overlay
      visible={visible}
      onClose={close}
      enter="fade"
      className="bg-background"
    >
      <SearchBody
        initialQuery={initialQuery}
        onClose={close}
        onSubmit={onSubmit}
        onSelect={onSelect}
      />
    </Overlay>
  );
}

function SearchBody({
  initialQuery,
  onClose,
  onSubmit,
  onSelect,
}: {
  initialQuery: string;
  onClose: () => void;
  onSubmit: (q: string) => void;
  onSelect: (r: SearchResult) => void;
}) {
  const insets = useSafeAreaInsets();
  const { recent, add, remove, clear } = useRecentSearches();
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => searchFixtures(query), [query]);
  const suggestions = useMemo(() => suggestFixtures(query, 5), [query]);
  const hasQuery = query.trim() !== "";

  const submit = (q: string) => {
    add(q);
    onSubmit(q);
    onClose();
  };

  const pick = (r: SearchResult) => {
    add(r.title);
    onSelect(r);
    onClose();
  };

  return (
    <View className="flex-1 bg-background">
      {/* Full-screen search: opaque, edge-to-edge (covers the map + tab bar).
          Closes via the back arrow, Android back, or on submit/select. */}
      <View
        className="flex-1"
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom,
        }}
      >
        {/* Header: back + search field */}
        <View className="flex-row items-center gap-2 px-gutter pb-2">
          <IconButton icon="chevron-back" label="Tilbake" onPress={onClose} />
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
            <RecentSearches
              recent={recent}
              onPick={submit}
              onRemove={remove}
              onClear={clear}
            />
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
              <SuggestionChips suggestions={suggestions} onPick={setQuery} />
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

// Bounded, non-personalized demo suggestions (entity titles) — a stand-in for
// the contract-blocked /search/suggestions endpoint. Tapping fills the field.
function SuggestionChips({
  suggestions,
  onPick,
}: {
  suggestions: string[];
  onPick: (q: string) => void;
}) {
  if (suggestions.length === 0) return null;
  return (
    <View className="flex-row flex-wrap gap-2">
      {suggestions.map((s) => (
        <Chip key={s} label={s} selected={false} onPress={() => onPick(s)} />
      ))}
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
  if (recent.length === 0) {
    return (
      <View className="items-center gap-2 pt-10">
        <Icon name="time-outline" size="xl" tone="muted" />
        <Text variant="caption" tone="muted" className="text-center">
          Søk etter steder, opplevelser og grupper.
        </Text>
      </View>
    );
  }
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Søk etter ${q}`}
            onPress={() => onPick(q)}
            className="flex-1 flex-row items-center gap-3"
          >
            <Icon name="time-outline" size="md" tone="muted" />
            <Text variant="body">{q}</Text>
          </Pressable>
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
        <Pressable
          key={`${r.kind}:${r.id}`}
          accessibilityRole="button"
          accessibilityLabel={`${r.title}, ${r.subtitle}`}
          onPress={() => onPick(r)}
          className="flex-row items-center gap-3 rounded-md px-1 py-2"
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
        </Pressable>
      ))}
    </View>
  );
}
