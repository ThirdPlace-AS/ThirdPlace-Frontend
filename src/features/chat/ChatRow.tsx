// One chat in a list (Chat tab, Arkiverte chatter): avatar, name, last
// message, time and the unread count. Unread rows read as unread. Phase 18:
// a pinned chat shows a pin, and the Chat tab's rows open quick actions on a
// long press ("Flere valg" for screen readers).
import { View } from "react-native";

import { Avatar, Icon, Pressable as UIPressable, Text } from "@/components/ui";
import type { MockChat } from "@/fixtures";
import { unreadOf, useChatReads } from "@/lib/chatReads";

export function ChatRow({
  chat,
  onPress,
  onLongPress,
  pinned = false,
}: {
  chat: MockChat;
  onPress: () => void;
  onLongPress?: () => void;
  pinned?: boolean;
}) {
  const icon =
    chat.type === "experience"
      ? "tp-experience"
      : chat.type === "place" || chat.type === "business"
        ? "cafe-outline"
        : null;
  // Opening a chat reads it this session (src/lib/chatReads.ts).
  const count = unreadOf(chat, useChatReads());
  const unread = count > 0 ? `, ${count} uleste` : "";
  const pin = pinned ? ", festet" : "";
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={`${chat.name}, ${chat.last}, ${chat.time}${unread}${pin}`}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={320}
      accessibilityActions={
        onLongPress ? [{ name: "longpress", label: "Flere valg" }] : undefined
      }
      onAccessibilityAction={
        onLongPress
          ? (e) => {
              if (e.nativeEvent.actionName === "longpress") onLongPress();
            }
          : undefined
      }
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
          weight={count > 0 ? "bold" : "semibold"}
          numberOfLines={1}
        >
          {chat.name}
        </Text>
        <Text
          variant="caption"
          tone={count > 0 ? "ink" : "muted"}
          weight={count > 0 ? "medium" : "regular"}
          numberOfLines={1}
        >
          {chat.last}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text
          variant="caption"
          tone={count > 0 ? "ink" : "muted"}
          weight={count > 0 ? "semibold" : "regular"}
        >
          {chat.time}
        </Text>
        <View className="h-5 flex-row items-center gap-1">
          {pinned ? <Icon name="pin" size="sm" tone="muted" /> : null}
          {count > 0 ? (
            <View className="h-5 min-w-5 items-center justify-center rounded-full bg-emberStrong px-1.5">
              <Text
                variant="micro"
                weight="bold"
                tone="onEmber"
                className="normal-case"
              >
                {String(count)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </UIPressable>
  );
}
