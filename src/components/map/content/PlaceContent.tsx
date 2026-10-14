import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import {
  businessForPlace,
  experiencesForPlace,
  placeById,
  priceBandFor,
} from "@/fixtures";
import { colors } from "@/theme";

import type { PushFn } from "../sheetTypes";
import { markerId } from "../types/mapPresentation";
import { DetailActions } from "./DetailActions";

export function PlaceContent({ id, push }: { id: string; push: PushFn }) {
  const place = placeById(id);
  if (!place) {
    return <Text className="text-sm text-muted">Fant ikke stedet.</Text>;
  }
  const business = businessForPlace(place.id);
  const exps = experiencesForPlace(place.id);

  return (
    <View className="gap-4">
      {/* Peek line: rating · distance · open · category */}
      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
        <View className="flex-row items-center gap-1">
          <Ionicons name="star" size={16} color={colors.ember} />
          <Text className="text-sm font-semibold text-ink">
            {place.rating.toFixed(1)}
          </Text>
          <Text className="text-sm text-muted">({place.reviews})</Text>
        </View>
        <Text className="text-sm text-muted">· {place.distance}</Text>
        <Text
          className={`text-sm ${place.openNow ? "text-success" : "text-muted"}`}
        >
          · {place.openNow ? "Åpent nå" : "Stengt"}
        </Text>
        <Text className="text-sm text-muted">· {place.category}</Text>
        <Text className="text-sm text-muted">
          · {priceBandFor(place.priceNok)}
        </Text>
      </View>

      {/* Image gallery (placeholders — no real media in fixtures) */}
      <View className="flex-row gap-2">
        <View className="h-40 flex-1 items-center justify-center rounded-lg bg-surfaceMuted">
          <Ionicons name="image-outline" size={40} color={colors.muted} />
        </View>
        <View className="gap-2">
          <View className="h-[72px] w-20 items-center justify-center rounded-lg bg-surfaceMuted">
            <Ionicons name="image-outline" size={20} color={colors.muted} />
          </View>
          <View className="h-[72px] w-20 items-center justify-center rounded-lg bg-surfaceMuted">
            <Ionicons name="images-outline" size={20} color={colors.muted} />
          </View>
        </View>
      </View>

      <DetailActions markerId={markerId("place", place.id)} />

      <Text className="text-sm text-muted">{place.about}</Text>

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

      {business ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => push({ kind: "business", id: business.id })}
        >
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xs uppercase tracking-wide text-muted">
                  Drives av
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-base font-semibold text-ink">
                    {business.name}
                  </Text>
                  {business.verified ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.success}
                    />
                  ) : null}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
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
              <Ionicons name="star" size={16} color={colors.ember} />
              <Text className="text-base font-semibold text-ink">
                {place.rating.toFixed(1)}
              </Text>
              <Text className="text-sm text-muted">
                · {place.reviews} anmeldelser
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </View>
        </Card>
      </Pressable>

      <View className="gap-2">
        <Text className="text-base font-semibold text-ink">
          Arrangementer her
        </Text>
        {exps.length === 0 ? (
          <Text className="text-sm text-muted">
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
                    <Text className="text-sm text-muted">
                      {e.when} · Vert: {e.host}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.muted}
                  />
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}
