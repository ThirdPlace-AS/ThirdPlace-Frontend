import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { WriteReviewSheet } from "@/components/WriteReviewSheet";
import { placeById, reviewsForPlace } from "@/fixtures";
import { colors } from "@/theme";

export function ReviewsContent({ id }: { id: string }) {
  const place = placeById(id);
  const [writing, setWriting] = useState(false);
  const list = place ? reviewsForPlace(place.id) : [];

  return (
    <View className="gap-3">
      {place ? (
        <View className="flex-row items-center gap-1">
          <Ionicons name="star" size={18} color={colors.ember} />
          <Text className="text-base font-semibold text-ink">
            {place.rating.toFixed(1)}
          </Text>
          <Text className="text-sm text-muted">
            · {place.reviews} anmeldelser · {place.name}
          </Text>
        </View>
      ) : null}

      {list.length === 0 ? (
        <Text className="text-sm text-muted">Ingen anmeldelser ennå.</Text>
      ) : (
        list.map((item) => (
          <Card key={item.id}>
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
        ))
      )}

      <Button
        label="Skriv anmeldelse"
        variant="ember"
        onPress={() => setWriting(true)}
      />

      <WriteReviewSheet
        placeName={place?.name ?? "stedet"}
        visible={writing}
        onClose={() => setWriting(false)}
      />
    </View>
  );
}
