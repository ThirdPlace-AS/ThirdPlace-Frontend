import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DemoBadge } from "@/components/DemoBadge";
import { MapCanvas } from "@/components/map/MapCanvas";
import { PlaceDetailSheet } from "@/components/PlaceDetailSheet";
import { SearchBar } from "@/components/SearchBar";
import {
  PLACE_CATEGORIES,
  places,
  type MockPlace,
  type PlaceCategory,
} from "@/fixtures";
import { colors } from "@/theme";

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
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PlaceCategory>("Alle");
  const [selected, setSelected] = useState<MockPlace | null>(null);
  // Bumped on each "my location" tap to recenter the map on the demo location.
  const [recenterSignal, setRecenterSignal] = useState(0);

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

  // Full-bleed map fills the whole tab (everything above the bottom nav). Search
  // + category chips float on top; tapping a pin opens the place-detail sheet.
  return (
    <View className="flex-1 bg-background">
      <MapCanvas
        fill
        places={filtered}
        onSelect={setSelected}
        recenterSignal={recenterSignal}
      />
      <View
        className="absolute left-0 right-0 top-0 gap-3 px-gutter pb-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <SearchBar
          placeholder="Søk steder og opplevelser"
          value={query}
          onChangeText={setQuery}
        />
        <CategoryFilter value={category} onChange={setCategory} />
      </View>
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
      <PlaceDetailSheet
        place={selected}
        visible={selected !== null}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}
