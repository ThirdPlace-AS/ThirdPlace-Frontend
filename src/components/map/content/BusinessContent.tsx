import { Pressable, View } from "react-native";

import { Icon, MetaRow, Text } from "@/components/ui";
import { Card } from "@/components/Card";
import { businessById, placeById } from "@/fixtures";

import type { PushFn } from "../sheetTypes";

export function BusinessContent({ id, push }: { id: string; push: PushFn }) {
  const business = businessById(id);
  if (!business) {
    return (
      <Text variant="caption" tone="muted">
        Fant ikke bedriften.
      </Text>
    );
  }
  const place = placeById(business.placeId);

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <Text variant="caption" tone="muted">
          {business.category}
        </Text>
        {business.verified ? (
          <View className="flex-row items-center gap-1">
            <Icon name="checkmark-circle" size="sm" tone="success" />
            <Text variant="label" weight="regular" tone="success">
              Verifisert
            </Text>
          </View>
        ) : (
          <Text variant="caption" tone="muted">
            · Uverifisert
          </Text>
        )}
      </View>

      <Text variant="caption" tone="muted">
        {business.about}
      </Text>

      <Card>
        <View className="gap-2">
          <MetaRow icon="location-outline" text={business.address} />
          <MetaRow icon="time-outline" text={business.hours} />
        </View>
      </Card>

      {place ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => push({ kind: "place", id: place.id })}
        >
          <Card>
            <View className="flex-row items-center justify-between">
              <Text variant="body">{place.name}</Text>
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
              <Text variant="body">Verifiseringsstatus</Text>
            </View>
            <Icon name="chevron-forward" size="md" tone="muted" />
          </View>
        </Card>
      </Pressable>
    </View>
  );
}
