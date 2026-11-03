import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DemoBadge } from "@/components/DemoBadge";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { creatorById, creators, type MockCreator } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { colors } from "@/theme";

// Creators index (DEMO). Reached from Profile → Oppdag. Tapping a creator opens
// a progression shell. BLOCKED_CONTRACT_GAP: no creator entity, level/XP system,
// reputation score, or payout model exists — level/progress are demo art.
export default function CreatorsScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? creatorById(selectedId) : undefined;
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Skapere" />
      <FlatList
        data={creators}
        keyExtractor={(c) => c.id}
        contentContainerClassName="px-gutter pb-10"
        ListHeaderComponent={
          <Text className="pb-3 pt-1 text-sm text-muted">
            Folk som samler naboer til noe.
          </Text>
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <CreatorRow creator={item} onPress={() => setSelectedId(item.id)} />
        )}
      />
      <Sheet
        visible={selected != null}
        onClose={() => setSelectedId(null)}
        title={selected?.name}
        fullHeight
      >
        {selected ? <CreatorDetail creator={selected} /> : null}
      </Sheet>
    </SafeAreaView>
  );
}

function CreatorRow({
  creator,
  onPress,
}: {
  creator: MockCreator;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl bg-surface p-2.5 active:opacity-90"
    >
      <Image
        source={libImage(creator.avatar)}
        contentFit="cover"
        transition={150}
        style={{ height: 56, width: 56, borderRadius: 28 }}
        className="bg-surfaceMuted"
        accessibilityLabel={creator.name}
      />
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {creator.name}
        </Text>
        <Text className="text-sm text-muted" numberOfLines={1}>
          {creator.tagline}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

function CreatorDetail({ creator }: { creator: MockCreator }) {
  return (
    <View className="gap-5">
      <View className="flex-row items-center gap-3">
        <Image
          source={libImage(creator.avatar)}
          contentFit="cover"
          transition={150}
          style={{ height: 72, width: 72, borderRadius: 36 }}
          className="bg-surfaceMuted"
          accessibilityLabel={creator.name}
        />
        <View className="flex-1">
          <Text className="text-xl font-bold text-ink">{creator.name}</Text>
          <Text className="text-sm text-muted">{creator.tagline}</Text>
        </View>
      </View>

      <View className="gap-2 rounded-2xl bg-surfaceMuted p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-ink">
            {creator.level}
          </Text>
          <DemoBadge />
        </View>
        <ProgressBar pct={creator.progressPct} />
        <Text className="text-xs text-muted">
          {creator.progressPct}% mot neste nivå · demo-fremdrift, teller
          ingenting
        </Text>
      </View>

      <View className="flex-row gap-3">
        <Stat value={String(creator.hosted)} label="Arrangert" />
        <Stat value={String(creator.specialties.length)} label="Temaer" />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-ink">Spesialiteter</Text>
        <View className="flex-row flex-wrap gap-2">
          {creator.specialties.map((s) => (
            <View
              key={s}
              className="rounded-full border border-line bg-surface px-3 py-1"
            >
              <Text className="text-sm text-ink">{s}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View className="h-2 overflow-hidden rounded-full bg-line">
      <View
        className="h-full rounded-full bg-ember"
        style={{ width: `${clamped}%` }}
      />
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center rounded-2xl bg-surfaceMuted py-3">
      <Text className="text-lg font-bold text-ink">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}
