import { Image } from "expo-image";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailStackSheet } from "@/components/DetailStackSheet";
import { RouteHeader } from "@/components/RouteHeader";
import type { SheetTarget } from "@/components/map/sheetTypes";
import { groups, type MockGroup } from "@/fixtures";
import { libImage } from "@/fixtures/images";

// Groups index (DEMO). Reached from Profile → Oppdag. Tapping a group opens the
// existing GroupContent in a detail sheet (join is already a GuestLock demo).
// BLOCKED_CONTRACT_GAP: no group entity, membership, or roles backend.
export default function GroupsScreen() {
  const [target, setTarget] = useState<SheetTarget | null>(null);
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Grupper" />
      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        contentContainerClassName="px-gutter pb-10"
        ListHeaderComponent={
          <Text className="pb-3 pt-1 text-sm text-muted">
            Fellesskap du kan bli med i.
          </Text>
        }
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onPress={() => setTarget({ kind: "group", id: item.id })}
          />
        )}
      />
      <DetailStackSheet target={target} onClose={() => setTarget(null)} />
    </SafeAreaView>
  );
}

function GroupCard({
  group,
  onPress,
}: {
  group: MockGroup;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="overflow-hidden rounded-2xl bg-surface active:opacity-90"
    >
      <Image
        source={libImage(group.cover)}
        contentFit="cover"
        transition={200}
        style={{ height: 128, width: "100%" }}
        className="bg-surfaceMuted"
        accessibilityLabel={group.name}
      />
      <View className="gap-1 p-3">
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {group.name}
        </Text>
        <Text className="text-sm text-muted" numberOfLines={1}>
          {group.about}
        </Text>
        <Text className="pt-0.5 text-xs text-muted">
          {group.memberCount} medlemmer
        </Text>
      </View>
    </Pressable>
  );
}
