import { router } from "expo-router";
import { View } from "react-native";

import { ChatSection } from "@/components/experience/ExperienceSections";
import { Icon, MetaRow, Text, Pressable as UIPressable } from "@/components/ui";
import { Card } from "@/components/Card";
import { businessById, chatForPlace, placeById } from "@/fixtures";
import { libImage, photosForPlace } from "@/fixtures/images";

import { Gallery } from "../Gallery";

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
      {place ? (
        <Gallery
          photos={photosForPlace(place).map(libImage)}
          height={200}
          label={business.name}
        />
      ) : null}
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

      {/* The business's chat is its place's (user 2026-11-10: every place,
          business and experience has a chat on the details sheet). */}
      <ChatSection
        chat={chatForPlace(business.placeId)}
        onNavigate={(href) => router.push(href)}
      />

      {place ? (
        <UIPressable
          pressedScale={0.99}
          accessibilityRole="button"
          onPress={() => push({ kind: "place", id: place.id })}
        >
          <Card>
            <View className="flex-row items-center justify-between">
              <Text variant="body">{place.name}</Text>
              <Icon name="chevron-forward" size="md" tone="muted" />
            </View>
          </Card>
        </UIPressable>
      ) : null}

      <UIPressable
        pressedScale={0.99}
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
      </UIPressable>
    </View>
  );
}
