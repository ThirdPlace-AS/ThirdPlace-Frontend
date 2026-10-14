import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/Card";
import { DemoBadge } from "@/components/DemoBadge";
import { NavHeader } from "@/components/NavHeader";
import { EmptyState } from "@/components/states/StateView";
import { businessById, placeById } from "@/fixtures";
import { colors } from "@/theme";

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

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const business = id ? businessById(id) : undefined;

  if (!business) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <NavHeader title="Bedrift" />
        <EmptyState
          icon="alert-circle-outline"
          title="Fant ikke bedriften"
          message="Denne bedriften finnes ikke i demoen."
        />
      </SafeAreaView>
    );
  }

  const place = placeById(business.placeId);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <NavHeader title={business.name} />
      <ScrollView contentContainerClassName="gap-4 p-gutter pb-10">
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
          <View className="gap-2">
            <Text className="text-base font-semibold text-ink">Sted</Text>
            <Card>
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-ink">{place.name}</Text>
                <Text
                  className="text-sm font-semibold text-ember"
                  onPress={() =>
                    router.push({
                      pathname: "/place/[id]",
                      params: { id: place.id },
                    })
                  }
                >
                  Åpne
                </Text>
              </View>
            </Card>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/verification")}
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

        <View className="flex-row items-center gap-2">
          <DemoBadge />
          <Text className="flex-1 text-xs text-muted">
            Demo — bedriftsprofil er visuell, ingen reelle data eller
            handlinger.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
