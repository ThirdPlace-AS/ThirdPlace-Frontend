// Varsler (PDF p20), a page since Phase 12 H4c (a list you browse): cards
// with a category glyph, name, one-line detail, time and an unread dot, and
// "Merk alle lest" in the header. Read state is the shared in-memory store
// (useNotificationReads), so the bell badges drop as items are read. A tap
// marks the card read and opens what it names (Phase 13: the person,
// experience, group or reviews in the fixtures).
// BLOCKED_CONTRACT_GAP: no push, inbox or notification feed exists.
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Icon, Page, Text, Pressable as UIPressable } from "@/components/ui";
import { notificationTimeLabel, type NotificationType } from "@/fixtures";
import { useNotificationReads } from "@/hooks/useNotificationReads";
import { notificationHref } from "@/lib/entityRoutes";

const TYPE_ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  join: "people-outline",
  message: "chatbubble-outline",
  review: "star-outline",
  follow: "person-add-outline",
  invite: "mail-outline",
};

export default function NotificationsScreen() {
  const { items, readIds, unread, markRead, markAllRead } =
    useNotificationReads();
  return (
    <Page
      title="Varsler"
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: unread === 0 }}
          disabled={unread === 0}
          onPress={markAllRead}
          hitSlop={8}
        >
          <Text
            variant="label"
            weight="semibold"
            tone={unread === 0 ? "muted" : "ink"}
          >
            Merk alle lest
          </Text>
        </Pressable>
      }
    >
      {items.map((n) => {
        const isRead = readIds.has(n.id);
        return (
          <UIPressable
            key={n.id}
            accessibilityRole="button"
            accessibilityLabel={`${n.actorName} ${n.text}${isRead ? "" : ", ulest"}`}
            accessibilityHint="Åpner det varselet gjelder"
            onPress={() => {
              markRead(n.id);
              router.push(notificationHref(n.target));
            }}
            contentClassName={`flex-row items-start gap-3 rounded-lg border bg-surface p-3.5 ${
              isRead ? "border-line" : "border-ink"
            }`}
            pressedScale={0.99}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted">
              <Icon name={TYPE_ICON[n.type]} size="md" tone="ink" />
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="label" weight="semibold">
                {n.actorName}
              </Text>
              <Text variant="caption" tone="muted" numberOfLines={2}>
                {n.text}
              </Text>
            </View>
            <View className="items-end gap-1.5">
              <Text variant="caption" tone="muted">
                {notificationTimeLabel(n.minutesAgo)}
              </Text>
              {!isRead ? (
                <View className="h-2 w-2 rounded-full bg-ember" />
              ) : null}
            </View>
          </UIPressable>
        );
      })}
    </Page>
  );
}
