import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SwipeableRow } from "@/components/SwipeableRow";
import { chats, type MockChat } from "@/fixtures";
import { colors } from "@/theme";

// Chat tab — conversation list. Tapping a row opens the thread (/chat/[id]).
// DEMO ONLY: no realtime/messaging backend. Mute and mark-as-read are local
// demo state (reset on reload); nothing is delivered or persisted.
export default function ChatScreen() {
  const [read, setRead] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState<Record<string, boolean>>({});

  const markRead = (id: string) =>
    setRead((r) => ({ ...r, [id]: true }));
  const toggleMute = (id: string) =>
    setMuted((m) => ({ ...m, [id]: !m[id] }));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        data={chats}
        keyExtractor={(c) => c.id}
        contentContainerClassName="px-gutter pb-6"
        ListHeaderComponent={
          <View className="gap-1 pb-3 pt-1">
            <Text className="text-2xl font-bold text-ink">Chat</Text>
            <Text className="text-sm text-muted">
              Samtaler fra steder og opplevelser du er med på.
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <SwipeableRow
            background="#F8F8F8"
            actions={[
              {
                icon: muted[item.id] ? "notifications-outline" : "notifications-off-outline",
                bg: "#F0F0F0",
                tint: "#202020",
                accessibilityLabel: muted[item.id] ? "Slå på varsler" : "Demp",
                onPress: () => toggleMute(item.id),
              },
              {
                icon: "checkmark-done-outline",
                bg: "#D80000",
                tint: "#FFFFFF",
                accessibilityLabel: "Marker som lest",
                onPress: () => markRead(item.id),
              },
            ]}
          >
            <ChatRow
              chat={item}
              muted={!!muted[item.id]}
              unread={read[item.id] ? 0 : item.unread}
              onPress={() =>
                router.push({ pathname: "/chat/[id]", params: { id: item.id } })
              }
            />
          </SwipeableRow>
        )}
      />
    </SafeAreaView>
  );
}

function ChatRow({
  chat,
  muted,
  unread,
  onPress,
}: {
  chat: MockChat;
  muted: boolean;
  unread: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl bg-surface px-3 py-3 active:opacity-80"
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-surfaceMuted">
        <Text className="text-base font-semibold text-ink">{chat.initials}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          {chat.kind === "group" ? (
            <Ionicons name="people" size={13} color={colors.muted} />
          ) : null}
          <Text
            className="flex-1 text-base font-semibold text-ink"
            numberOfLines={1}
          >
            {chat.name}
          </Text>
        </View>
        <Text className="text-sm text-muted" numberOfLines={1}>
          {chat.last}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text className="text-xs text-muted">{chat.time}</Text>
        {muted ? (
          <Ionicons name="notifications-off" size={14} color={colors.muted} />
        ) : unread > 0 ? (
          <View className="h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1.5">
            <Text className="text-xs font-semibold text-onEmber">{unread}</Text>
          </View>
        ) : (
          <View className="h-5" />
        )}
      </View>
    </Pressable>
  );
}
