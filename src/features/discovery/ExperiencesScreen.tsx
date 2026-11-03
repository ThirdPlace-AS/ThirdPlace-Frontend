import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailStackSheet } from "@/components/DetailStackSheet";
import { RouteHeader } from "@/components/RouteHeader";
import type { SheetTarget } from "@/components/map/sheetTypes";
import { experiences, type MockExperience } from "@/fixtures";
import { colors } from "@/theme";

// Experiences index route (DEMO). Reached from Profile → Oppdag → Opplevelser.
// Reuses the existing ExperienceContent detail (previously only a map sheet).
// BLOCKED_CONTRACT_GAP: no experience/attendance/capacity backend.
export default function ExperiencesScreen() {
  const [target, setTarget] = useState<SheetTarget | null>(null);
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Opplevelser" />
      <FlatList
        data={experiences}
        keyExtractor={(e) => e.id}
        contentContainerClassName="px-gutter pb-10"
        ListHeaderComponent={
          <Text className="pb-3 pt-1 text-sm text-muted">
            Ting å være med på i nabolaget.
          </Text>
        }
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <ExperienceCard
            experience={item}
            onPress={() => setTarget({ kind: "experience", id: item.id })}
          />
        )}
      />
      <DetailStackSheet target={target} onClose={() => setTarget(null)} />
    </SafeAreaView>
  );
}

function ExperienceCard({
  experience,
  onPress,
}: {
  experience: MockExperience;
  onPress: () => void;
}) {
  const full = experience.going >= experience.capacity;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="overflow-hidden rounded-2xl bg-surface active:opacity-90"
    >
      <Image
        source={experience.photos[0]}
        contentFit="cover"
        transition={200}
        style={{ height: 150, width: "100%" }}
        className="bg-surfaceMuted"
        accessibilityLabel={experience.title}
      />
      <View className="gap-1 p-3">
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {experience.title}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="time-outline" size={14} color={colors.muted} />
          <Text className="text-sm text-muted">{experience.when}</Text>
          <Text className="text-sm text-muted">· {experience.host}</Text>
        </View>
        <Text className="pt-0.5 text-xs text-muted">
          {full
            ? "Fullt — venteliste"
            : `${experience.going}/${experience.capacity} blir med`}
        </Text>
      </View>
    </Pressable>
  );
}
