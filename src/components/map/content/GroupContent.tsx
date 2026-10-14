import { Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DemoBadge } from "@/components/DemoBadge";
import { GuestLock } from "@/components/GuestLock";
import { groupById } from "@/fixtures";

export function GroupContent({ id }: { id: string }) {
  const group = groupById(id);
  if (!group) {
    return <Text className="text-sm text-muted">Fant ikke gruppen.</Text>;
  }

  return (
    <View className="gap-4">
      <Text className="text-sm text-muted">{group.about}</Text>
      <Text className="text-sm text-muted">{group.memberCount} medlemmer</Text>

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
    </View>
  );
}
