import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/ui";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import {
  businessForPlace,
  experiencesForPlace,
  placeById,
  priceBandFor,
} from "@/fixtures";
import { coverForPlace, libImage } from "@/fixtures/images";

import type { PushFn } from "../sheetTypes";
import { markerId } from "../types/mapPresentation";
import { DetailActions } from "./DetailActions";

function InfoRow({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon name={icon} size="sm" tone="muted" />
      <Text className="flex-1 text-sm text-ink font-normal">{text}</Text>
    </View>
  );
}

export function PlaceContent({ id, push }: { id: string; push: PushFn }) {
  const place = placeById(id);
  if (!place) {
    return (
      <Text className="text-sm text-muted font-normal">Fant ikke stedet.</Text>
    );
  }
  const business = businessForPlace(place.id);
  const exps = experiencesForPlace(place.id);

  return (
    <View className="gap-4">
      {/* Peek line: rating · distance · open · category */}
      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
        <View className="flex-row items-center gap-1">
          <Icon name="star" size="sm" tone="ember" />
          <Text className="text-sm font-semibold text-ink">
            {place.rating.toFixed(1)}
          </Text>
          <Text className="text-sm text-muted font-normal">
            ({place.reviews})
          </Text>
        </View>
        <Text className="text-sm text-muted font-normal">
          · {place.distance}
        </Text>
        <Text
          className={`font-normal text-sm ${place.openNow ? "text-successText" : "text-muted"}`}
        >
          · {place.openNow ? "Åpent nå" : "Stengt"}
        </Text>
        <Text className="text-sm text-muted font-normal">
          · {place.category}
        </Text>
        <Text className="text-sm text-muted font-normal">
          · {priceBandFor(place.priceNok)}
        </Text>
      </View>

      {/* Cover — illustrative library photo (MOCK; not of this venue). */}
      <Image
        source={libImage(coverForPlace(place))}
        contentFit="cover"
        transition={150}
        accessibilityLabel={place.name}
        style={{ height: 176, width: "100%", borderRadius: 12 }}
        className="bg-surfaceMuted"
      />

      <DetailActions
        markerId={markerId("place", place.id)}
        title={place.name}
      />

      <Text className="text-sm text-muted font-normal">{place.about}</Text>

      {/* Location & opening hours */}
      <Card>
        <View className="gap-2">
          <InfoRow icon="location-outline" text={place.address} />
          <InfoRow icon="time-outline" text={place.hours} />
          {place.specialHours ? (
            <InfoRow icon="calendar-outline" text={place.specialHours} />
          ) : null}
        </View>
      </Card>

      {/* Vibe tags */}
      <View className="gap-1">
        <Text className="text-sm font-semibold text-ink">Vibe</Text>
        <View className="flex-row flex-wrap gap-2">
          {place.vibes.map((v) => (
            <Chip key={v} label={v} />
          ))}
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {place.tags.map((t) => (
          <Chip key={t} label={t} />
        ))}
      </View>

      {/* Accessibility */}
      {place.accessibility.length > 0 ? (
        <View className="gap-1">
          <Text className="text-sm font-semibold text-ink">
            Tilgjengelighet
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {place.accessibility.map((a) => (
              <Chip key={a} label={a} />
            ))}
          </View>
        </View>
      ) : null}

      {/* Source / provenance indicator */}
      <View className="flex-row items-center gap-2">
        <Icon name="shield-checkmark-outline" size="sm" tone="muted" />
        <Text className="flex-1 text-xs text-muted font-normal">
          {place.source}
        </Text>
      </View>

      {business ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => push({ kind: "business", id: business.id })}
        >
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xs uppercase tracking-wide text-muted font-normal">
                  Drives av
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-base font-semibold text-ink">
                    {business.name}
                  </Text>
                  {business.verified ? (
                    <Icon name="checkmark-circle" size="sm" tone="success" />
                  ) : null}
                </View>
              </View>
              <Icon name="chevron-forward" size="md" tone="muted" />
            </View>
          </Card>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => push({ kind: "reviews", id: place.id })}
      >
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Icon name="star" size="sm" tone="ember" />
              <Text className="text-base font-semibold text-ink">
                {place.rating.toFixed(1)}
              </Text>
              <Text className="text-sm text-muted font-normal">
                · {place.reviews} anmeldelser
              </Text>
            </View>
            <Icon name="chevron-forward" size="md" tone="muted" />
          </View>
        </Card>
      </Pressable>

      {/* Place chat — no real chat room is opened. */}
      <View className="flex-row items-center gap-2 rounded-md border border-line bg-surface px-3 py-3">
        <Icon name="chatbubbles-outline" size="md" tone="ink" />
        <Text className="flex-1 text-sm text-ink font-normal">Stedschat</Text>
      </View>

      <View className="gap-2">
        <Text className="text-base font-semibold text-ink">
          Arrangementer her
        </Text>
        {exps.length === 0 ? (
          <Text className="text-sm text-muted font-normal">
            Ingen kommende arrangementer.
          </Text>
        ) : (
          exps.map((e) => (
            <Pressable
              key={e.id}
              accessibilityRole="button"
              onPress={() => push({ kind: "experience", id: e.id })}
            >
              <Card>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-ink">
                      {e.title}
                    </Text>
                    <Text className="text-sm text-muted font-normal">
                      {e.when} · Vert: {e.host}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size="md" tone="muted" />
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}
