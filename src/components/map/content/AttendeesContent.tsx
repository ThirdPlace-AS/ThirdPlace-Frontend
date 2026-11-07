import { View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { attendeesForExperience, experienceById } from "@/fixtures";
import { Text } from "@/components/ui";

export function AttendeesContent({ id }: { id: string }) {
  const exp = experienceById(id);
  const list = attendeesForExperience(id);

  return (
    <View className="gap-3">
      {exp ? (
        <Text variant="caption" tone="muted">
          {exp.title} · {list.length} påmeldt
        </Text>
      ) : null}
      {list.length === 0 ? (
        <Text variant="caption" tone="muted">
          Ingen deltakere ennå.
        </Text>
      ) : (
        list.map((a) => (
          <View key={a.id} className="flex-row items-center gap-3">
            <Avatar initials={a.initials} />
            <Text variant="body" className="flex-1">
              {a.name}
            </Text>
            {a.isHost ? (
              <View className="rounded-full bg-ink px-2 py-0.5">
                <Text variant="caption" weight="semibold" tone="onInk">
                  Vert
                </Text>
              </View>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}
