import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DemoBadge } from "@/components/DemoBadge";
import { NavHeader } from "@/components/NavHeader";
import { EmptyState } from "@/components/states/StateView";
import {
  attendeesForExperience,
  experienceById,
  type ExperienceStatus,
} from "@/fixtures";
import { colors } from "@/theme";

const statusLabel: Record<ExperienceStatus, string> = {
  open: "Åpen",
  waitlist: "Venteliste",
  full: "Fullt",
  joined: "Påmeldt",
  cancelled: "Avlyst",
};

export default function HostManagementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const exp = id ? experienceById(id) : undefined;
  // Demo-only local status so host actions do something visible.
  const [status, setStatus] = useState<ExperienceStatus | null>(
    exp?.status ?? null,
  );

  if (!exp) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <NavHeader title="Administrer" />
        <EmptyState
          icon="alert-circle-outline"
          title="Fant ikke arrangementet"
          message="Dette arrangementet finnes ikke i demoen."
        />
      </SafeAreaView>
    );
  }

  const attendees = attendeesForExperience(exp.id);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <NavHeader title="Administrer" />
      <ScrollView contentContainerClassName="gap-4 p-gutter pb-10">
        <View>
          <Text className="text-xl font-bold text-ink">{exp.title}</Text>
          <Text className="text-sm text-muted">
            {exp.when} · Status: {status ? statusLabel[status] : "—"}
          </Text>
        </View>

        <Card>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/attendees/[id]",
                params: { id: exp.id },
              })
            }
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="people-outline" size={20} color={colors.ink} />
              <Text className="text-base text-ink">
                Deltakere ({attendees.length}/{exp.capacity})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        </Card>

        <View className="flex-row items-center gap-2">
          <DemoBadge />
          <Text className="flex-1 text-xs text-muted">
            Demo — vertshandlinger endrer kun visningen, ingenting lagres.
          </Text>
        </View>

        <View className="gap-3">
          <Button label="Rediger arrangement" variant="secondary" />
          <Button
            label="Marker som fullført"
            variant="ink"
            disabled={status === "cancelled"}
            onPress={() => setStatus("joined")}
          />
          <Button
            label={status === "cancelled" ? "Gjenåpne" : "Avlys arrangement"}
            variant="secondary"
            onPress={() =>
              setStatus(status === "cancelled" ? exp.status : "cancelled")
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
