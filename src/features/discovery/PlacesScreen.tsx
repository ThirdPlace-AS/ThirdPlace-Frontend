import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailStackSheet } from "@/components/DetailStackSheet";
import { RouteHeader } from "@/components/RouteHeader";
import type { SheetTarget } from "@/components/map/sheetTypes";
import { places, type MockPlace } from "@/fixtures";
import { coverForPlaceCategory, libImage } from "@/fixtures/images";
import { colors } from "@/theme";

// Places index route (DEMO). Reached from Profile → Oppdag → Steder. Reuses the
// existing PlaceContent detail (previously only a map sheet).
// BLOCKED_CONTRACT_GAP: no place entity, listing, or availability backend.
export default function PlacesScreen() {
  const [target, setTarget] = useState<SheetTarget | null>(null);
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Steder" />
      <FlatList
        data={places}
        keyExtractor={(p) => p.id}
        contentContainerClassName="px-gutter pb-10"
        ListHeaderComponent={
          <Text className="pb-3 pt-1 text-sm text-muted">
            Lune møteplasser i nabolaget.
          </Text>
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <PlaceRow
            place={item}
            onPress={() => setTarget({ kind: "place", id: item.id })}
          />
        )}
      />
      <DetailStackSheet target={target} onClose={() => setTarget(null)} />
    </SafeAreaView>
  );
}

function PlaceRow({
  place,
  onPress,
}: {
  place: MockPlace;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl bg-surface p-2.5 active:opacity-90"
    >
      <Image
        source={libImage(coverForPlaceCategory(place.category))}
        contentFit="cover"
        transition={150}
        style={{ height: 64, width: 64, borderRadius: 12 }}
        className="bg-surfaceMuted"
        accessibilityLabel={place.name}
      />
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {place.name}
        </Text>
        <Text className="text-sm text-muted" numberOfLines={1}>
          {place.category} · {place.distance}
        </Text>
        <View className="flex-row items-center gap-1 pt-0.5">
          <Ionicons name="star" size={12} color={colors.ember} />
          <Text className="text-xs text-muted">
            {place.rating.toFixed(1)} · {place.reviews} anmeldelser
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}
