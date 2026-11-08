import { View } from "react-native";

import { Icon, MetaRow, Text, Pressable as UIPressable } from "@/components/ui";
import { Card } from "@/components/Card";
import { DirectionsButton } from "@/components/DirectionsButton";
import { Chip } from "@/components/Chip";
import {
  businessForPlace,
  experiencesForPlace,
  placeById,
  priceBandFor,
  placeRating,
} from "@/fixtures";
import { libImage, photosForPlace } from "@/fixtures/images";
import { formatRating } from "@/lib/format";
import { distanceLabelFor, useOrigin } from "@/lib/origin";

import { Gallery } from "../Gallery";
import type { PushFn } from "../sheetTypes";
import { markerId } from "../types/mapPresentation";
import { DetailActions } from "./DetailActions";

export function PlaceContent({ id, push }: { id: string; push: PushFn }) {
  const origin = useOrigin();
  const place = placeById(id);
  if (!place) {
    return (
      <Text variant="caption" tone="muted">
        Fant ikke stedet.
      </Text>
    );
  }
  const business = businessForPlace(place.id);
  const exps = experiencesForPlace(place.id);
  const rating = placeRating(place.id);

  return (
    <View className="gap-4">
      {/* Peek line: rating · distance · open · category */}
      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
        <View className="flex-row items-center gap-1">
          <Icon name="star" size="sm" tone="ink" />
          <Text variant="label" weight="semibold">
            {formatRating(rating.score)}
          </Text>
          <Text variant="caption" tone="muted">
            ({rating.count})
          </Text>
        </View>
        <Text variant="caption" tone="muted">
          · {distanceLabelFor(place.coord, origin)}
        </Text>
        <Text
          variant="label"
          weight="regular"
          tone={place.openNow ? "success" : "muted"}
        >
          · {place.openNow ? "Åpent nå" : "Stengt"}
        </Text>
        <Text variant="caption" tone="muted">
          · {place.category}
        </Text>
        <Text variant="caption" tone="muted">
          · {priceBandFor(place.priceNok)}
        </Text>
      </View>

      {/* Gallery: illustrative library photos (MOCK; not of this venue). */}
      <Gallery
        photos={photosForPlace(place).map(libImage)}
        height={200}
        label={place.name}
      />

      <DetailActions
        markerId={markerId("place", place.id)}
        title={place.name}
      />

      <Text variant="caption" tone="muted">
        {place.about}
      </Text>

      {/* Location & opening hours */}
      <Card>
        <View className="gap-2">
          <MetaRow icon="location-outline" text={place.address} />
          <MetaRow icon="time-outline" text={place.hours} />
          {place.specialHours ? (
            <MetaRow icon="calendar-outline" text={place.specialHours} />
          ) : null}
          <DirectionsButton coord={place.coord} name={place.name} />
        </View>
      </Card>

      {/* Vibe tags */}
      <View className="gap-1">
        <Text variant="label" weight="semibold">
          Vibe
        </Text>
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
          <Text variant="label" weight="semibold">
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
        <Text variant="caption" tone="muted" className="flex-1">
          {place.source}
        </Text>
      </View>

      {business ? (
        <UIPressable
          pressedScale={0.99}
          accessibilityRole="button"
          onPress={() => push({ kind: "business", id: business.id })}
        >
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text variant="micro" weight="regular" tone="muted">
                  Drives av
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text variant="body" weight="semibold">
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
        </UIPressable>
      ) : null}

      <UIPressable
        pressedScale={0.99}
        accessibilityRole="button"
        onPress={() => push({ kind: "reviews", id: place.id })}
      >
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Icon name="star" size="sm" tone="ink" />
              <Text variant="body" weight="semibold">
                {formatRating(rating.score)}
              </Text>
              <Text variant="caption" tone="muted">
                · {rating.count}{" "}
                {rating.count === 1 ? "vurdering" : "vurderinger"}
              </Text>
            </View>
            <Icon name="chevron-forward" size="md" tone="muted" />
          </View>
        </Card>
      </UIPressable>

      {/* Place chat — no real chat room is opened. */}
      <View className="flex-row items-center gap-2 rounded-md border border-line bg-surface px-3 py-3">
        <Icon name="chatbubbles-outline" size="md" tone="ink" />
        <Text variant="label" weight="regular" className="flex-1">
          Stedschat
        </Text>
      </View>

      <View className="gap-2">
        <Text variant="body" weight="semibold">
          Arrangementer her
        </Text>
        {exps.length === 0 ? (
          <Text variant="caption" tone="muted">
            Ingen kommende arrangementer.
          </Text>
        ) : (
          exps.map((e) => (
            <UIPressable
              pressedScale={0.99}
              key={e.id}
              accessibilityRole="button"
              onPress={() => push({ kind: "experience", id: e.id })}
            >
              <Card>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text variant="body" weight="semibold">
                      {e.title}
                    </Text>
                    <Text variant="caption" tone="muted">
                      {e.when} · Vert: {e.host}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size="md" tone="muted" />
                </View>
              </Card>
            </UIPressable>
          ))
        )}
      </View>
    </View>
  );
}
