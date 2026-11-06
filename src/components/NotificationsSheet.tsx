import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Icon, Text } from "@/components/ui";
import { DemoNote } from "@/components/DemoNote";
import { Sheet } from "@/components/Sheet";
import {
  MOCK_NOTIFICATIONS,
  notificationTimeLabel,
  visibleNotifications,
  type NotificationType,
} from "@/fixtures";

// type → leading category glyph.
const TYPE_ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  join: "people-outline",
  message: "chatbubble-outline",
  review: "star-outline",
  follow: "person-add-outline",
  invite: "mail-outline",
};

// Varsler (DEMO), per the design (PDF p20): a light list of cards — category
// glyph, bold title, one-line detail, time and an unread dot — with "Merk alle
// lest". Read state is local only. BLOCKED_CONTRACT_GAP: no push, inbox or
// notification feed exists; the items are static demo activity.
export function NotificationsSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(
    () => new Set(MOCK_NOTIFICATIONS.filter((n) => n.read).map((n) => n.id)),
  );
  const items = visibleNotifications(MOCK_NOTIFICATIONS);
  const unread = items.filter((n) => !readIds.has(n.id)).length;
  const markRead = (id: string) => setReadIds((s) => new Set([...s, id]));

  return (
    <Sheet visible={visible} onClose={onClose} title="Varsler">
      <View className="gap-2">
        <View className="flex-row items-center justify-end">
          <Pressable
            accessibilityRole="button"
            disabled={unread === 0}
            onPress={() => setReadIds(new Set(items.map((n) => n.id)))}
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
        </View>

        {items.map((n) => {
          const isRead = readIds.has(n.id);
          return (
            <Pressable
              key={n.id}
              accessibilityRole="button"
              accessibilityLabel={`${n.actorName} ${n.text}`}
              onPress={() => markRead(n.id)}
              className={`flex-row items-start gap-3 rounded-lg border bg-surface p-3.5 active:opacity-80 ${
                isRead ? "border-line" : "border-ink"
              }`}
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
            </Pressable>
          );
        })}

        <DemoNote>
          Dette er eksempelvarsler. Push og innboks er ikke slått på.
        </DemoNote>
      </View>
    </Sheet>
  );
}
