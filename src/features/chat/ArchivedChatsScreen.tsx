// Arkiverte chatter (PDF p10), a page since Phase 12 H4c: a list you
// browse. Archived chats open read-only.
import { router } from "expo-router";
import { View } from "react-native";

import { EmptyState, Page, Text } from "@/components/ui";
import { chats } from "@/fixtures";

import { ChatRow } from "./ChatRow";

export default function ArchivedChatsScreen() {
  const archived = chats.filter((c) => c.status === "archived");
  return (
    <Page title="Arkiverte chatter">
      <Text variant="caption" tone="muted">
        Bare lesing. Du kan ikke sende nye meldinger.
      </Text>
      {archived.length ? (
        <View className="gap-2">
          {archived.map((c) => (
            <ChatRow
              key={c.id}
              chat={{
                ...c,
                last: `${c.archivedNote ?? "Arkivert"} · ${c.last}`,
              }}
              onPress={() =>
                router.push({ pathname: "/chat/[id]", params: { id: c.id } })
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState
          fill={false}
          icon="archive-outline"
          title="Ingen arkiverte chatter"
        />
      )}
    </Page>
  );
}
