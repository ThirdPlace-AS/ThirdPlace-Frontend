import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/Card";
import { PlaceDetailSheet } from "@/components/PlaceDetailSheet";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/states/StateView";
import { SkeletonCard } from "@/components/states/Skeleton";
import {
  PLACE_CATEGORIES,
  places,
  type MockPlace,
  type PlaceCategory,
} from "@/fixtures";
import { useMockResource } from "@/hooks/useMockResource";

// Soft-map placeholder (no Mapbox token in Phase 1). Pastel blobs + a pin, as in
// the screens (PDF 5). It is a visual fixture, NOT authoritative geodata.
function SoftMap() {
  return (
    <View className="h-40 overflow-hidden rounded-lg border border-line bg-surfaceMuted">
      <View
        className="absolute h-24 w-24 rounded-full bg-success/20"
        style={{ top: 16, left: 24 }}
      />
      <View
        className="absolute h-20 w-20 rounded-full bg-ember/10"
        style={{ bottom: 12, right: 28 }}
      />
      <View className="flex-1 items-center justify-center">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-ink">
          <View className="h-2.5 w-2.5 rounded-full bg-onInk" />
        </View>
      </View>
    </View>
  );
}

function CategoryFilter({
  value,
  onChange,
}: {
  value: PlaceCategory;
  onChange: (c: PlaceCategory) => void;
}) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={PLACE_CATEGORIES}
      keyExtractor={(c) => c}
      contentContainerClassName="gap-2"
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(item)}
          className={`rounded-full border px-4 py-2 ${
            item === value ? "border-ink bg-ink" : "border-line bg-surface"
          }`}
        >
          <Text
            className={`text-sm font-medium ${item === value ? "text-onInk" : "text-ink"}`}
          >
            {item}
          </Text>
        </Pressable>
      )}
    />
  );
}

export default function MapScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PlaceCategory>("Alle");
  const [selected, setSelected] = useState<MockPlace | null>(null);

  const { status } = useMockResource(places, { delayMs: 500 });

  const filtered = useMemo(() => {
    return places.filter((p) => {
      const matchesCat = category === "Alle" || p.category === category;
      const matchesText =
        query.trim() === "" ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesText;
    });
  }, [query, category]);

  const loading = status === "loading";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(p) => p.id}
        contentContainerClassName="gap-3 p-gutter"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="gap-4 pb-1">
            <Text className="text-2xl font-bold text-ink">Kart</Text>
            <SearchBar
              placeholder="Søk steder og opplevelser"
              value={query}
              onChangeText={setQuery}
            />
            <CategoryFilter value={category} onChange={setCategory} />
            <SoftMap />
            <Text className="text-base font-semibold text-ink">I nærheten</Text>
            {loading ? (
              <View className="gap-3">
                <SkeletonCard />
                <SkeletonCard />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="search"
              title="Ingen treff"
              message="Prøv et annet søk eller en annen kategori."
              actionLabel="Nullstill"
              onAction={() => {
                setQuery("");
                setCategory("Alle");
              }}
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => setSelected(item)}
          >
            <Card>
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-ink">
                  {item.name}
                </Text>
                <Text className="text-sm text-muted">{item.distance}</Text>
              </View>
              <Text className="mt-0.5 text-sm text-ember">{item.category}</Text>
              <Text className="mt-1 text-sm text-muted">{item.blurb}</Text>
            </Card>
          </Pressable>
        )}
      />
      <PlaceDetailSheet
        place={selected}
        visible={selected !== null}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}
