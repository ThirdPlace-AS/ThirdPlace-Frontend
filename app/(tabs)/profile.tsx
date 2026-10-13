import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { profile } from "@/fixtures";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-lg font-bold text-ink">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

// Fixture profile (visual only). No account/session backend.
export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="gap-5 p-gutter">
        <Text className="text-2xl font-bold text-ink">Profil</Text>

        <View className="items-center gap-2">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-surfaceMuted">
            <Text className="text-2xl font-bold text-ink">
              {profile.name.charAt(0)}
            </Text>
          </View>
          <Text className="text-lg font-bold text-ink">{profile.name}</Text>
          <Text className="text-sm text-muted">{profile.handle}</Text>
          <Text className="px-6 text-center text-sm text-muted">
            {profile.bio}
          </Text>
        </View>

        <Card>
          <View className="flex-row justify-around">
            <Stat value={profile.stats.steder} label="Steder" />
            <Stat value={profile.stats.opplevelser} label="Opplevelser" />
            <Stat value={profile.stats.venner} label="Venner" />
          </View>
        </Card>

        <View className="gap-3">
          <Button label="Rediger profil" variant="secondary" />
          <Button label="Logg ut" variant="ink" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
