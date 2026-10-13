import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { chats } from "@/fixtures";

// Fixture chat list (visual only). No realtime / messaging backend.
export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        data={chats}
        keyExtractor={(c) => c.id}
        contentContainerClassName="p-gutter"
        ListHeaderComponent={
          <Text className="pb-3 text-2xl font-bold text-ink">Chat</Text>
        }
        ItemSeparatorComponent={() => <View className="h-px bg-line" />}
        renderItem={({ item }) => (
          <View className="flex-row items-center gap-3 py-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-surfaceMuted">
              <Text className="text-base font-semibold text-ink">
                {item.name.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-ink">
                {item.name}
              </Text>
              <Text className="text-sm text-muted" numberOfLines={1}>
                {item.last}
              </Text>
            </View>
            <View className="items-end gap-1">
              <Text className="text-xs text-muted">{item.time}</Text>
              {item.unread > 0 ? (
                <View className="h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1.5">
                  <Text className="text-xs font-semibold text-onEmber">
                    {item.unread}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
