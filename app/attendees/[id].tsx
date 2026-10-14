import { useLocalSearchParams } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { NavHeader } from "@/components/NavHeader";
import { EmptyState } from "@/components/states/StateView";
import { attendeesForExperience, experienceById } from "@/fixtures";

export default function AttendeesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exp = id ? experienceById(id) : undefined;
  const list = id ? attendeesForExperience(id) : [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <NavHeader title="Deltakere" />
      <FlatList
        data={list}
        keyExtractor={(a) => a.id}
        contentContainerClassName="gap-3 p-gutter pb-10"
        ListHeaderComponent={
          exp ? (
            <Text className="pb-1 text-sm text-muted">
              {exp.title} · {list.length} påmeldt
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="Ingen deltakere ennå"
            message="Bli den første som melder seg på."
          />
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center gap-3">
            <Avatar initials={item.initials} />
            <Text className="flex-1 text-base text-ink">{item.name}</Text>
            {item.isHost ? (
              <View className="rounded-full bg-ink px-2 py-0.5">
                <Text className="text-xs font-semibold text-onInk">Vert</Text>
              </View>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
