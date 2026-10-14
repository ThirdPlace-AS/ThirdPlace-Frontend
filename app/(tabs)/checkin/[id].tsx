import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { DemoBadge } from "@/components/DemoBadge";
import { NavHeader } from "@/components/NavHeader";
import { EmptyState } from "@/components/states/StateView";
import { experienceById } from "@/fixtures";
import { colors } from "@/theme";

export default function CheckInScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exp = id ? experienceById(id) : undefined;
  // DEMO proximity + check-in, entirely simulated. There is no real geolocation
  // (fixtures-only) — the toggle just flips the mock distance.
  const [near, setNear] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);

  if (!exp) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <NavHeader title="Innsjekk" />
        <EmptyState
          icon="alert-circle-outline"
          title="Fant ikke arrangementet"
          message="Dette arrangementet finnes ikke i demoen."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <NavHeader title="Innsjekk" />
      <View className="flex-1 gap-5 p-gutter">
        <View>
          <Text className="text-xl font-bold text-ink">{exp.title}</Text>
          <Text className="text-sm text-muted">{exp.when}</Text>
        </View>

        <View className="items-center gap-3 rounded-lg border border-line bg-surface p-6">
          <View
            className={`h-20 w-20 items-center justify-center rounded-full ${
              checkedIn ? "bg-success" : near ? "bg-ember" : "bg-surfaceMuted"
            }`}
          >
            <Ionicons
              name={checkedIn ? "checkmark" : "location"}
              size={36}
              color={checkedIn || near ? colors.onEmber : colors.muted}
            />
          </View>
          <Text className="text-center text-base font-semibold text-ink">
            {checkedIn
              ? "Du er sjekket inn"
              : near
                ? "Du er i nærheten (~40 m)"
                : "For langt unna (~1,2 km)"}
          </Text>
          <Text className="text-center text-sm text-muted">
            {checkedIn
              ? "God tur! (demo)"
              : near
                ? "Du kan sjekke inn nå."
                : "Kom nærmere stedet for å sjekke inn."}
          </Text>
        </View>

        {/* DEMO-only position toggle (no real GPS). */}
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: near }}
          onPress={() => setNear((n) => !n)}
          className="flex-row items-center justify-between rounded-md border border-line bg-surface px-4 py-3"
        >
          <Text className="text-sm text-ink">Simuler: i nærheten</Text>
          <View
            className={`h-6 w-11 justify-center rounded-full px-0.5 ${
              near ? "bg-ink" : "bg-surfaceMuted"
            }`}
          >
            <View
              className={`h-5 w-5 rounded-full bg-surface ${
                near ? "self-end" : "self-start"
              }`}
            />
          </View>
        </Pressable>

        <View className="flex-row items-center gap-2">
          <DemoBadge />
          <Text className="flex-1 text-xs text-muted">
            Demo — simulert posisjon. Ingen ekte GPS eller innsjekking skjer.
          </Text>
        </View>

        <View className="mt-auto">
          <Button
            label={checkedIn ? "Angre innsjekk" : "Sjekk inn"}
            variant={checkedIn ? "secondary" : "ember"}
            disabled={!near && !checkedIn}
            onPress={() => setCheckedIn((c) => !c)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
