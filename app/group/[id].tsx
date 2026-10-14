import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DemoBadge } from "@/components/DemoBadge";
import { GuestLock } from "@/components/GuestLock";
import { NavHeader } from "@/components/NavHeader";
import { EmptyState } from "@/components/states/StateView";
import { groupById } from "@/fixtures";

export default function GroupProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = id ? groupById(id) : undefined;

  if (!group) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <NavHeader title="Gruppe" />
        <EmptyState
          icon="alert-circle-outline"
          title="Fant ikke gruppen"
          message="Denne gruppen finnes ikke i demoen."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <NavHeader title={group.name} />
      <ScrollView contentContainerClassName="gap-4 p-gutter pb-10">
        <Text className="text-sm text-muted">{group.about}</Text>
        <Text className="text-sm text-muted">
          {group.memberCount} medlemmer
        </Text>

        <Card>
          <View className="gap-2">
            <Text className="text-base font-semibold text-ink">Medlemmer</Text>
            <View className="flex-row flex-wrap gap-2">
              {group.members.map((m) => (
                <Avatar key={m} initials={m} size={36} />
              ))}
            </View>
          </View>
        </Card>

        <GuestLock message="Logg inn for å bli medlem og se gruppechatten." />

        <View className="flex-row items-center gap-2">
          <DemoBadge />
          <Text className="flex-1 text-xs text-muted">
            Demo — ingen reell gruppemedlemskap eller chat.
          </Text>
        </View>

        <Button label="Bli medlem" variant="ember" />
      </ScrollView>
    </SafeAreaView>
  );
}
