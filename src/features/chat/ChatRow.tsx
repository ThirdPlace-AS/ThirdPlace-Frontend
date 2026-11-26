// One chat in a list (Chat tab, Arkiverte chatter): avatar, name, last
// message, time and the unread count. Unread rows read as unread. Phase 18:
// a pinned chat shows a pin, and the Chat tab's rows open quick actions on a
// long press ("Flere valg" for screen readers). A tap on the picture shows
// it larger with the chat's actions (ChatPeek, user 2026-11-26; "Vis bilde"
// for screen readers).
import { Pressable, View } from "react-native";

import {
  Avatar,
  Icon,
  Pressable as UIPressable,
  Text,
  type IconName,
} from "@/components/ui";
import type { MockChat } from "@/fixtures";
import { unreadOf, useChatReads } from "@/lib/chatReads";

/** The glyph a chat without a face shows (experience or place). */
export function chatIcon(chat: MockChat): IconName | undefined {
  return chat.type === "experience"
    ? "tp-experience"
    : chat.type === "place" || chat.type === "business"
      ? "cafe-outline"
      : undefined;
}

export function ChatRow({
  chat,
  onPress,
  onLongPress,
  onPicturePress,
  pinned = false,
}: {
  chat: MockChat;
  onPress: () => void;
  onLongPress?: () => void;
  onPicturePress?: () => void;
  pinned?: boolean;
}) {
  const icon = chatIcon(chat);
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
      accessibilityActions={[
        ...(onLongPress ? [{ name: "longpress", label: "Flere valg" }] : []),
        ...(onPicturePress ? [{ name: "picture", label: "Vis bilde" }] : []),
      ]}
      onAccessibilityAction={(e) => {
        const name = e.nativeEvent.actionName;
        if (name === "longpress") onLongPress?.();
        else if (name === "picture") onPicturePress?.();
      }}
      pressedScale={0.99}
      contentClassName="flex-row items-center gap-3 rounded-md bg-surface px-4 py-3"
    >
      <Pressable
        onPress={onPicturePress}
        disabled={!onPicturePress}
        hitSlop={6}
        // The row reads as one button; its "Vis bilde" action opens this.
        accessible={false}
      >
        <Avatar
          name={chat.name}
          initials={chat.initials}
          icon={icon}
          size="md"
          decorative
        />
      </Pressable>
      {/* Unread rows read as unread: bold name, ink preview and time. */}
      <View className="flex-1 gap-1">
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
            <View className="h-5 min-w-5 items-center justify-center rounded-full bg-emberStrong px-2">
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
