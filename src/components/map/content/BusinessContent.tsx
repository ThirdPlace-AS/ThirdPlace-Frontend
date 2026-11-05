import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { businessById, placeById } from "@/fixtures";
import { colors } from "@/theme";

import type { PushFn } from "../sheetTypes";

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons
        name={icon as keyof typeof Ionicons.glyphMap}
        size={16}
        color={colors.muted}
      />
      <Text className="flex-1 text-sm text-ink">{text}</Text>
    </View>
  );
}

export function BusinessContent({ id, push }: { id: string; push: PushFn }) {
  const business = businessById(id);
  if (!business) {
    return <Text className="text-sm text-muted">Fant ikke bedriften.</Text>;
  }
  const place = placeById(business.placeId);

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <Text className="text-sm text-muted">{business.category}</Text>
        {business.verified ? (
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.success}
            />
            <Text className="text-sm text-success">Verifisert</Text>
          </View>
        ) : (
          <Text className="text-sm text-muted">· Uverifisert</Text>
        )}
      </View>

      <Text className="text-sm text-muted">{business.about}</Text>

      <Card>
        <View className="gap-2">
          <InfoRow icon="location-outline" text={business.address} />
          <InfoRow icon="time-outline" text={business.hours} />
        </View>
      </Card>

      {place ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => push({ kind: "place", id: place.id })}
        >
          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-ink">{place.name}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </View>
          </Card>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => push({ kind: "verification", id: business.id })}
      >
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.ink}
              />
              <Text className="text-base text-ink">Verifiseringsstatus</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </View>
        </Card>
      </Pressable>
    </View>
  );
}
