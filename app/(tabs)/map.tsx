import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/Card";
import { places } from "@/fixtures";

// Soft-map placeholder (no Mapbox token in Phase 0). Pastel blobs + a pin, as in
// the screens. Below it, a static list of nearby places from fixtures.
function SoftMap() {
  return (
    <View className="h-44 overflow-hidden rounded-lg border border-line bg-surfaceMuted">
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

export default function MapScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        data={places}
        keyExtractor={(p) => p.id}
        contentContainerClassName="gap-3 p-gutter"
        ListHeaderComponent={
          <View className="gap-4 pb-1">
            <Text className="text-2xl font-bold text-ink">Kart</Text>
            <SoftMap />
            <Text className="text-base font-semibold text-ink">I nærheten</Text>
          </View>
        }
        renderItem={({ item }) => (
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
        )}
      />
    </SafeAreaView>
  );
}
