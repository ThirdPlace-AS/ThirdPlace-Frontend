import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailStackSheet } from "@/components/DetailStackSheet";
import { RouteHeader } from "@/components/RouteHeader";
import type { SheetTarget } from "@/components/map/sheetTypes";
import { businesses, type MockBusiness } from "@/fixtures";
import { coverForPlaceCategory, libImage } from "@/fixtures/images";
import { colors } from "@/theme";

// Businesses index (DEMO). Reached from Profile → Oppdag. Tapping a business
// opens the existing BusinessContent (which drills into verification) in a sheet.
// BLOCKED_CONTRACT_GAP: no business entity, verification, or claim backend.
export default function BusinessesScreen() {
  const [target, setTarget] = useState<SheetTarget | null>(null);
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Bedrifter" />
      <FlatList
        data={businesses}
        keyExtractor={(b) => b.id}
        contentContainerClassName="px-gutter pb-10"
        ListHeaderComponent={
          <Text className="pb-3 pt-1 text-sm text-muted">
            Lokale steder drevet av naboer.
          </Text>
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <BusinessRow
            business={item}
            onPress={() => setTarget({ kind: "business", id: item.id })}
          />
        )}
      />
      <DetailStackSheet target={target} onClose={() => setTarget(null)} />
    </SafeAreaView>
  );
}

function BusinessRow({
  business,
  onPress,
}: {
  business: MockBusiness;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl bg-surface p-2.5 active:opacity-90"
    >
      <Image
        source={libImage(coverForPlaceCategory(business.category))}
        contentFit="cover"
        transition={150}
        style={{ height: 64, width: 64, borderRadius: 12 }}
        className="bg-surfaceMuted"
        accessibilityLabel={business.name}
      />
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text
            className="flex-1 text-base font-semibold text-ink"
            numberOfLines={1}
          >
            {business.name}
          </Text>
          {business.verified ? (
            <Ionicons name="checkmark-circle" size={16} color={colors.ember} />
          ) : null}
        </View>
        <Text className="text-sm text-muted" numberOfLines={1}>
          {business.category}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}
