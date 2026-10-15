import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchBar } from "@/components/SearchBar";
import { colors } from "@/theme";

import { useRecentSearches } from "./hooks/useRecentSearches";
import { searchFixtures, type SearchResult } from "./services/mapSearch";

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
  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      transparent
    >
      {/* Mount the body only while open so query state seeds fresh from
          `initialQuery` on each open (no setState-in-effect). */}
      {visible ? (
        <SearchBody
          initialQuery={initialQuery}
          onClose={onClose}
          onSubmit={onSubmit}
          onSelect={onSelect}
        />
      ) : null}
    </Modal>
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
    <View className="flex-1">
      {/* Dim backdrop — tap the area below the panel to close (plus the back
          arrow and Android back). */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Lukk"
        onPress={onClose}
        className="absolute inset-0 bg-ink/40"
      />

      <View
        className="flex-1 bg-background"
        style={{
          paddingTop: insets.top + 8,
          marginBottom: insets.bottom + 56,
        }}
      >
        {/* Header: back + search field */}
        <View className="flex-row items-center gap-2 px-gutter pb-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tilbake"
            onPress={onClose}
            className="-ml-1 h-10 w-10 items-center justify-center rounded-full"
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <View className="flex-1">
            <SearchBar
              placeholder="Søk steder, opplevelser, grupper"
              value={query}
              onChangeText={setQuery}
              onSubmit={submit}
              autoFocus
              right={
                hasQuery ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Tøm søk"
                    onPress={() => setQuery("")}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.muted}
                    />
                  </Pressable>
                ) : undefined
              }
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
              <Ionicons name="search" size={32} color={colors.muted} />
              <Text className="text-base font-semibold text-ink">
                Ingen treff
              </Text>
              <Text className="text-center text-sm text-muted">
                Prøv et annet søkeord.
              </Text>
            </View>
          ) : (
            <>
              <ResultGroup
                title="På kartet"
                icon="location-outline"
                items={results.places}
                onPick={pick}
              />
              <ResultGroup
                title="Opplevelser"
                icon="sparkles-outline"
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
  if (recent.length === 0) {
    return (
      <View className="items-center gap-2 pt-10">
        <Ionicons name="time-outline" size={32} color={colors.muted} />
        <Text className="text-center text-sm text-muted">
          Søk etter steder, opplevelser og grupper.
        </Text>
      </View>
    );
  }
  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-ink">Nylige søk</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tøm nylige søk"
          onPress={onClear}
        >
          <Text className="text-sm text-muted">Tøm</Text>
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
            <Ionicons name="time-outline" size={18} color={colors.muted} />
            <Text className="text-base text-ink">{q}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Fjern ${q}`}
            onPress={() => onRemove(q)}
            hitSlop={8}
          >
            <Ionicons name="close" size={18} color={colors.muted} />
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
  icon: keyof typeof Ionicons.glyphMap;
  items: SearchResult[];
  onPick: (r: SearchResult) => void;
}) {
  if (items.length === 0) return null;
  return (
    <View className="gap-1">
      <Text className="text-sm font-semibold text-ink">{title}</Text>
      {items.map((r) => (
        <Pressable
          key={`${r.kind}:${r.id}`}
          accessibilityRole="button"
          accessibilityLabel={`${r.title}, ${r.subtitle}`}
          onPress={() => onPick(r)}
          className="flex-row items-center gap-3 rounded-md px-1 py-2"
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted">
            <Ionicons name={icon} size={18} color={colors.ink} />
          </View>
          <View className="flex-1">
            <Text className="text-base text-ink" numberOfLines={1}>
              {r.title}
            </Text>
            <Text className="text-sm text-muted" numberOfLines={1}>
              {r.subtitle}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
