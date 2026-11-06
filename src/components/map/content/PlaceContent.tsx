import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { Icon, MetaRow, Text as UIText } from "@/components/ui";
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

export function PlaceContent({ id, push }: { id: string; push: PushFn }) {
  const place = placeById(id);
  if (!place) {
    return (
      <UIText variant="caption" tone="muted">
        Fant ikke stedet.
      </UIText>
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
          <UIText variant="label" weight="semibold">
            {place.rating.toFixed(1)}
          </UIText>
          <UIText variant="caption" tone="muted">
            ({place.reviews})
          </UIText>
        </View>
        <UIText variant="caption" tone="muted">
          · {place.distance}
        </UIText>
        <Text
          className={`font-normal text-sm ${place.openNow ? "text-successText" : "text-muted"}`}
        >
          · {place.openNow ? "Åpent nå" : "Stengt"}
        </Text>
        <UIText variant="caption" tone="muted">
          · {place.category}
        </UIText>
        <UIText variant="caption" tone="muted">
          · {priceBandFor(place.priceNok)}
        </UIText>
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

      <UIText variant="caption" tone="muted">
        {place.about}
      </UIText>

      {/* Location & opening hours */}
      <Card>
        <View className="gap-2">
          <MetaRow icon="location-outline" text={place.address} />
          <MetaRow icon="time-outline" text={place.hours} />
          {place.specialHours ? (
            <MetaRow icon="calendar-outline" text={place.specialHours} />
          ) : null}
        </View>
      </Card>

      {/* Vibe tags */}
      <View className="gap-1">
        <UIText variant="label" weight="semibold">
          Vibe
        </UIText>
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
          <UIText variant="label" weight="semibold">
            Tilgjengelighet
          </UIText>
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
        <UIText variant="caption" tone="muted" className="flex-1">
          {place.source}
        </UIText>
      </View>

      {business ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => push({ kind: "business", id: business.id })}
        >
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <UIText variant="micro" weight="regular" tone="muted">
                  Drives av
                </UIText>
                <View className="flex-row items-center gap-1">
                  <UIText variant="body" weight="semibold">
                    {business.name}
                  </UIText>
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
              <UIText variant="body" weight="semibold">
                {place.rating.toFixed(1)}
              </UIText>
              <UIText variant="caption" tone="muted">
                · {place.reviews} anmeldelser
              </UIText>
            </View>
            <Icon name="chevron-forward" size="md" tone="muted" />
          </View>
        </Card>
      </Pressable>

      {/* Place chat — no real chat room is opened. */}
      <View className="flex-row items-center gap-2 rounded-md border border-line bg-surface px-3 py-3">
        <Icon name="chatbubbles-outline" size="md" tone="ink" />
        <UIText variant="label" weight="regular" className="flex-1">
          Stedschat
        </UIText>
      </View>

      <View className="gap-2">
        <UIText variant="body" weight="semibold">
          Arrangementer her
        </UIText>
        {exps.length === 0 ? (
          <UIText variant="caption" tone="muted">
            Ingen kommende arrangementer.
          </UIText>
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
                    <UIText variant="body" weight="semibold">
                      {e.title}
                    </UIText>
                    <UIText variant="caption" tone="muted">
                      {e.when} · Vert: {e.host}
                    </UIText>
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
