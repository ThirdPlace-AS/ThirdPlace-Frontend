import { Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { attendeesForExperience, experienceById } from "@/fixtures";

export function AttendeesContent({ id }: { id: string }) {
  const exp = experienceById(id);
  const list = attendeesForExperience(id);

  return (
    <View className="gap-3">
      {exp ? (
        <Text className="text-sm text-muted font-normal">
          {exp.title} · {list.length} påmeldt
        </Text>
      ) : null}
      {list.length === 0 ? (
        <Text className="text-sm text-muted font-normal">
          Ingen deltakere ennå.
        </Text>
      ) : (
        list.map((a) => (
          <View key={a.id} className="flex-row items-center gap-3">
            <Avatar initials={a.initials} />
            <Text className="flex-1 text-base text-ink font-normal">
              {a.name}
            </Text>
            {a.isHost ? (
              <View className="rounded-full bg-ink px-2 py-0.5">
                <Text className="text-xs font-semibold text-onInk">Vert</Text>
              </View>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}
