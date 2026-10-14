import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { NavHeader } from "@/components/NavHeader";
import { EmptyState } from "@/components/states/StateView";
import { WriteReviewSheet } from "@/components/WriteReviewSheet";
import { placeById, reviewsForPlace } from "@/fixtures";
import { colors } from "@/theme";

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = id ? placeById(id) : undefined;
  const [writing, setWriting] = useState(false);

  const list = place ? reviewsForPlace(place.id) : [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <NavHeader title={place ? `Anmeldelser` : "Anmeldelser"} />
      <FlatList
        data={list}
        keyExtractor={(r) => r.id}
        contentContainerClassName="gap-3 p-gutter pb-28"
        ListHeaderComponent={
          place ? (
            <View className="flex-row items-center gap-1 pb-1">
              <Ionicons name="star" size={18} color={colors.ember} />
              <Text className="text-base font-semibold text-ink">
                {place.rating.toFixed(1)}
              </Text>
              <Text className="text-sm text-muted">
                · {place.reviews} anmeldelser · {place.name}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbox-ellipses-outline"
            title="Ingen anmeldelser"
            message="Bli den første til å anmelde stedet."
          />
        }
        renderItem={({ item }) => (
          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-ink">
                {item.author}
              </Text>
              <View className="flex-row items-center gap-1">
                <Ionicons name="star" size={14} color={colors.ember} />
                <Text className="text-sm font-semibold text-ink">
                  {item.rating}
                </Text>
              </View>
            </View>
            <Text className="mt-0.5 text-xs text-muted">{item.when}</Text>
            <Text className="mt-1 text-sm text-muted">{item.text}</Text>
          </Card>
        )}
      />
      <View className="absolute inset-x-0 bottom-0 border-t border-line bg-surface p-gutter">
        <Button
          label="Skriv anmeldelse"
          variant="ember"
          onPress={() => setWriting(true)}
        />
      </View>
      <WriteReviewSheet
        placeName={place?.name ?? "stedet"}
        visible={writing}
        onClose={() => setWriting(false)}
      />
    </SafeAreaView>
  );
}
