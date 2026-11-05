import { Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GuestLock } from "@/components/GuestLock";
import { groupById } from "@/fixtures";

export function GroupContent({ id }: { id: string }) {
  const group = groupById(id);
  if (!group) {
    return (
      <Text className="text-sm text-muted font-normal">Fant ikke gruppen.</Text>
    );
  }

  return (
    <View className="gap-4">
      <Text className="text-sm text-muted font-normal">{group.about}</Text>
      <Text className="text-sm text-muted font-normal">
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

      <Button label="Bli medlem" variant="ember" />
    </View>
  );
}
