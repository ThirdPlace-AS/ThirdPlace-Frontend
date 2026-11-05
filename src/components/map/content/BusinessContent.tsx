import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/ui";
import { Card } from "@/components/Card";
import { businessById, placeById } from "@/fixtures";

import type { PushFn } from "../sheetTypes";

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon
        name={icon as keyof typeof Ionicons.glyphMap}
        size="sm"
        tone="muted"
      />
      <Text className="flex-1 text-sm text-ink font-normal">{text}</Text>
    </View>
  );
}

export function BusinessContent({ id, push }: { id: string; push: PushFn }) {
  const business = businessById(id);
  if (!business) {
    return (
      <Text className="text-sm text-muted font-normal">
        Fant ikke bedriften.
      </Text>
    );
  }
  const place = placeById(business.placeId);

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <Text className="text-sm text-muted font-normal">
          {business.category}
        </Text>
        {business.verified ? (
          <View className="flex-row items-center gap-1">
            <Icon name="checkmark-circle" size="sm" tone="success" />
            <Text className="text-sm text-successText font-normal">
              Verifisert
            </Text>
          </View>
        ) : (
          <Text className="text-sm text-muted font-normal">· Uverifisert</Text>
        )}
      </View>

      <Text className="text-sm text-muted font-normal">{business.about}</Text>

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
              <Text className="text-base text-ink font-normal">
                {place.name}
              </Text>
              <Icon name="chevron-forward" size="md" tone="muted" />
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
              <Icon name="shield-checkmark-outline" size="md" tone="ink" />
              <Text className="text-base text-ink font-normal">
                Verifiseringsstatus
              </Text>
            </View>
            <Icon name="chevron-forward" size="md" tone="muted" />
          </View>
        </Card>
      </Pressable>
    </View>
  );
}
