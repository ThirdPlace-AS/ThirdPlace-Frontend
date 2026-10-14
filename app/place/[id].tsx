import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { ExperienceDetailSheet } from "@/components/ExperienceDetailSheet";
import { NavHeader } from "@/components/NavHeader";
import { EmptyState } from "@/components/states/StateView";
import {
  businessForPlace,
  experiencesForPlace,
  placeById,
  type MockExperience,
} from "@/fixtures";
import { colors } from "@/theme";

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const place = id ? placeById(id) : undefined;
  const [selectedExp, setSelectedExp] = useState<MockExperience | null>(null);

  if (!place) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <NavHeader title="Sted" />
        <EmptyState
          icon="alert-circle-outline"
          title="Fant ikke stedet"
          message="Dette stedet finnes ikke i demoen."
        />
      </SafeAreaView>
    );
  }

  const business = businessForPlace(place.id);
  const exps = experiencesForPlace(place.id);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <NavHeader title={place.name} />
      <ScrollView contentContainerClassName="gap-4 p-gutter pb-10">
        <View className="h-40 items-center justify-center rounded-lg bg-surfaceMuted">
          <Ionicons name="image-outline" size={40} color={colors.muted} />
        </View>

        <View className="flex-row items-center gap-3">
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
        </View>

        <Text className="text-sm text-muted">{place.about}</Text>

        <View className="flex-row flex-wrap gap-2">
          {place.tags.map((t) => (
            <Chip key={t} label={t} />
          ))}
        </View>

        {business ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/business/[id]",
                params: { id: business.id },
              })
            }
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
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.muted}
                />
              </View>
            </Card>
          </Pressable>
        ) : null}

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
                onPress={() => setSelectedExp(e)}
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
      </ScrollView>

      <ExperienceDetailSheet
        experience={selectedExp}
        visible={selectedExp !== null}
        onClose={() => setSelectedExp(null)}
      />
    </SafeAreaView>
  );
}
