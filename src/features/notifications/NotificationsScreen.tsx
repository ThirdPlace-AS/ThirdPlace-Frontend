// Varsler (PDF p20), a page since Phase 12 H4c (a list you browse): cards
// with a category glyph, name, one-line detail, time and an unread dot, and
// "Merk alle lest" in the header. Read state is the shared in-memory store
// (useNotificationReads), so the bell badges drop as items are read. A tap
// marks the card read and opens what it names (Phase 13: the person,
// experience, group or reviews in the fixtures).
// Phase 16 (founder, after the section benchmark; Instagram, Facebook): the
// cards sit under "I dag" / "Denne uka" / "Tidligere", and a new follower gets
// "Følg tilbake" on the card itself (the same follow store as Folk).
// BLOCKED_CONTRACT_GAP: no push, inbox or notification feed exists.
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { SignInPrompt } from "@/components/SignInPrompt";
import { EmptyState } from "@/components/states/StateView";
import {
  FollowButton,
  Icon,
  Page,
  Text,
  Pressable as UIPressable,
} from "@/components/ui";
import {
  NOTIFICATION_GROUPS,
  notificationGroup,
  notificationTimeLabel,
  type MockNotification,
  type NotificationType,
} from "@/fixtures";
import { useNotificationReads } from "@/hooks/useNotificationReads";
import { notificationHref } from "@/lib/entityRoutes";
import { toggleFollow, useFollowing } from "@/lib/following";

const TYPE_ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  join: "people-outline",
  message: "chatbubble-outline",
  review: "star-outline",
  follow: "person-add-outline",
  invite: "mail-outline",
};

// The follow button lines up under the text: card padding (14) + glyph (40)
// + gap (12).
const FOLLOW_INDENT = 14 + 40 + 12;

export default function NotificationsScreen() {
  const { items, readIds, unread, markRead, markAllRead } =
    useNotificationReads();
  const following = useFollowing();
  const { isGuest } = useGuestMode();
  const [signIn, setSignIn] = useState(false);
  const groups = NOTIFICATION_GROUPS.map((title) => ({
    title,
    items: items.filter((n) => notificationGroup(n.minutesAgo) === title),
  })).filter((g) => g.items.length > 0);

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
      {items.length === 0 ? (
        <EmptyState
          fill={false}
          icon="notifications-outline"
          title="Ingen varsler ennå"
        />
      ) : null}
      {groups.map((g) => (
        <View key={g.title} className="gap-2">
          <Text variant="body" weight="semibold" accessibilityRole="header">
            {g.title}
          </Text>
          {g.items.map((n) => {
            const person =
              n.type === "follow" && n.target.kind === "person"
                ? n.target.id
                : null;
            return (
              <NotificationCard
                key={n.id}
                n={n}
                isRead={readIds.has(n.id)}
                onOpen={() => {
                  markRead(n.id);
                  router.push(notificationHref(n.target));
                }}
                follow={
                  person
                    ? {
                        following: following.has(person),
                        onPress: () =>
                          isGuest ? setSignIn(true) : toggleFollow(person),
                      }
                    : undefined
                }
              />
            );
          })}
        </View>
      ))}
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="følge folk"
      />
    </Page>
  );
}

// One card. The follow button is a sibling of the card's tap area, never
// inside it (a button in a button is invalid on web).
function NotificationCard({
  n,
  isRead,
  onOpen,
  follow,
}: {
  n: MockNotification;
  isRead: boolean;
  onOpen: () => void;
  follow?: { following: boolean; onPress: () => void };
}) {
  return (
    <View
      className={`rounded-lg border bg-surface ${
        isRead ? "border-line" : "border-ink"
      }`}
    >
      <UIPressable
        accessibilityRole="button"
        accessibilityLabel={`${n.actorName} ${n.text}${isRead ? "" : ", ulest"}`}
        accessibilityHint="Åpner det varselet gjelder"
        onPress={onOpen}
        contentClassName="flex-row items-start gap-3 p-3.5"
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
          {!isRead ? <View className="h-2 w-2 rounded-full bg-ember" /> : null}
        </View>
      </UIPressable>
      {follow ? (
        <View
          className="flex-row pb-3.5 pr-3.5"
          style={{ paddingLeft: FOLLOW_INDENT }}
        >
          <FollowButton
            following={follow.following}
            onPress={follow.onPress}
            name={n.actorName}
            followLabel="Følg tilbake"
          />
        </View>
      ) : null}
    </View>
  );
}
