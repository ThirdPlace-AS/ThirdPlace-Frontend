// One chat in a list (Chat tab, Arkiverte chatter): avatar, name, last
// message, time and the unread count. Unread rows read as unread.
import { View } from "react-native";

import { Avatar, Pressable as UIPressable, Text } from "@/components/ui";
import type { MockChat } from "@/fixtures";

export function ChatRow({
  chat,
  onPress,
}: {
  chat: MockChat;
  onPress: () => void;
}) {
  const icon =
    chat.type === "experience"
      ? "tp-experience"
      : chat.type === "place" || chat.type === "business"
        ? "cafe-outline"
        : null;
  const unread = chat.unread > 0 ? `, ${chat.unread} uleste` : "";
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={`${chat.name}, ${chat.last}, ${chat.time}${unread}`}
      onPress={onPress}
      pressedScale={0.99}
      contentClassName="flex-row items-center gap-md rounded-lg bg-surface px-md py-md"
    >
      <Avatar
        name={chat.name}
        initials={chat.initials}
        icon={icon ?? undefined}
        size="md"
        decorative
      />
      {/* Unread rows read as unread: bold name, ink preview and time. */}
      <View className="flex-1 gap-0.5">
        <Text
          variant="body"
          weight={chat.unread > 0 ? "bold" : "semibold"}
          numberOfLines={1}
        >
          {chat.name}
        </Text>
        <Text
          variant="caption"
          tone={chat.unread > 0 ? "ink" : "muted"}
          weight={chat.unread > 0 ? "medium" : "regular"}
          numberOfLines={1}
        >
          {chat.last}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text
          variant="caption"
          tone={chat.unread > 0 ? "ink" : "muted"}
          weight={chat.unread > 0 ? "semibold" : "regular"}
        >
          {chat.time}
        </Text>
        {chat.unread > 0 ? (
          <View className="h-5 min-w-5 items-center justify-center rounded-full bg-emberStrong px-1.5">
            <Text
              variant="micro"
              weight="bold"
              tone="onEmber"
              className="normal-case"
            >
              {String(chat.unread)}
            </Text>
          </View>
        ) : (
          <View className="h-5" />
        )}
      </View>
    </UIPressable>
  );
}
