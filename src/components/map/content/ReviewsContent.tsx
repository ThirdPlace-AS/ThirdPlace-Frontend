import { router, type Href } from "expo-router";
import { View } from "react-native";

import { Icon, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { placeById, reviewsForPlace } from "@/fixtures";
import { formatRating } from "@/lib/format";

export function ReviewsContent({ id }: { id: string }) {
  const place = placeById(id);
  const list = place ? reviewsForPlace(place.id) : [];

  return (
    <View className="gap-3">
      {place ? (
        <View className="flex-row items-center gap-1">
          <Icon name="star" size="md" tone="ember" />
          <Text variant="body" weight="semibold">
            {formatRating(place.rating)}
          </Text>
          <Text variant="caption" tone="muted">
            · {place.reviews} anmeldelser · {place.name}
          </Text>
        </View>
      ) : null}

      {list.length === 0 ? (
        <Text variant="caption" tone="muted">
          Ingen anmeldelser ennå.
        </Text>
      ) : (
        list.map((item) => (
          <Card key={item.id}>
            <View className="flex-row items-center justify-between">
              <Text variant="body" weight="semibold">
                {item.author}
              </Text>
              <View className="flex-row items-center gap-1">
                <Icon name="star" size="sm" tone="ember" />
                <Text variant="label" weight="semibold">
                  {item.rating}
                </Text>
              </View>
            </View>
            <Text variant="caption" tone="muted" className="mt-0.5">
              {item.when}
            </Text>
            <Text variant="caption" tone="muted" className="mt-1">
              {item.text}
            </Text>
          </Card>
        ))
      )}

      <Button
        label="Skriv anmeldelse"
        variant="ember"
        onPress={() => router.push(`/review/place/${id}` as Href)}
      />
    </View>
  );
}
