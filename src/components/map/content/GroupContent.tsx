import { View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GuestLock } from "@/components/GuestLock";
import { groupById } from "@/fixtures";
import { Text } from "@/components/ui";

export function GroupContent({ id }: { id: string }) {
  const group = groupById(id);
  if (!group) {
    return (
      <Text variant="caption" tone="muted">
        Fant ikke gruppen.
      </Text>
    );
  }

  return (
    <View className="gap-4">
      <Text variant="caption" tone="muted">
        {group.about}
      </Text>
      <Text variant="caption" tone="muted">
        {group.memberCount} medlemmer
      </Text>

      <Card>
        <View className="gap-2">
          <Text variant="body" weight="semibold">
            Medlemmer
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {group.members.map((m) => (
              <Avatar key={m} initials={m} size="sm" />
            ))}
          </View>
        </View>
      </Card>

      <GuestLock message="Logg inn for å bli medlem og se gruppechatten." />

      <Button label="Bli medlem" variant="ember" />
    </View>
  );
}
