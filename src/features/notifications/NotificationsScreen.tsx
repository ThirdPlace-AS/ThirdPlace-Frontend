// Varsler (PDF p20), a page since Phase 12 H4c (a list you browse), with
// "Merk alle lest" in the header. Read state is the shared in-memory store
// (useNotificationReads), so the bell badges drop as items are read. A tap
// marks the row read and opens what it names (Phase 13: the person,
// experience, group or reviews in the fixtures).
// Phase 16 (founder, after the section benchmark; Instagram, Facebook): the
// rows sit under "I dag" / "Denne uka" / "Tidligere", and a new follower gets
// "Følg tilbake" (the same follow store as Folk).
// Phase 18 (founder, screen benchmark: Instagram): same-kind notices in a time
// group collapse into one row ("Erik Haug og 2 andre begynte å følge deg.",
// which opens Følgere).
// 0460 (Instagram benchmark 2, user 2026-11-17): flat rows with the actor's
// photo (a small type badge on it), one sentence "name text · time", and on
// the right either "Følg tilbake" or a thumbnail of what the notice names;
// the shared `FilterPills` row with one pill per type that has notices; and
// "Du er helt oppdatert" at the top once nothing is unread.
// BLOCKED_CONTRACT_GAP: no push, inbox or notification feed exists.
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, View, type ImageSourcePropType } from "react-native";

import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { SignInPrompt } from "@/components/SignInPrompt";
import { EmptyState } from "@/components/states/StateView";
import {
  Avatar,
  FilterPills,
  FollowButton,
  Icon,
  LoadingImage,
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
import { libImage } from "@/fixtures/images";
import { useNotificationReads } from "@/hooks/useNotificationReads";
import {
  collapseNotifications,
  entryActor,
  type NotificationEntry,
} from "@/lib/collapseNotifications";
import { notificationHref } from "@/lib/entityRoutes";
import { toggleFollow, useFollowing } from "@/lib/following";

import {
  filterNotifications,
  notificationPerson,
  notificationPills,
  notificationThumb,
  type NotificationFilterKey,
} from "./notificationFilters";

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
  const following = useFollowing();
  const { isGuest } = useGuestMode();
  const [signIn, setSignIn] = useState(false);
  const [filter, setFilter] = useState<NotificationFilterKey>("all");
  const pills = useMemo(() => notificationPills(items), [items]);
  // A pill whose type has no notices left falls back to Alle.
  const active = pills.some((p) => p.key === filter) ? filter : "all";
  const shown = filterNotifications(items, active);
  const groups = NOTIFICATION_GROUPS.map((title) => ({
    title,
    entries: collapseNotifications(
      shown.filter((n) => notificationGroup(n.minutesAgo) === title),
    ),
  })).filter((g) => g.entries.length > 0);

  const open = (entry: NotificationEntry) => {
    const first = entry.items[0];
    if (!first) return;
    entry.items.forEach((n) => markRead(n.id));
    // Several new followers open the Følgere list; anything else opens what
    // the newest notice names.
    router.push(
      entry.items.length > 1 && first.type === "follow"
        ? "/profile/followers"
        : notificationHref(first.target),
    );
  };

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
      ) : (
        <>
          <FilterPills
            bleed
            pills={pills}
            value={active}
            onChange={setFilter}
          />
          {unread === 0 ? (
            <View className="flex-row items-center gap-3">
              <Icon name="checkmark-circle-outline" size="md" tone="muted" />
              <Text variant="label" tone="muted">
                Du er helt oppdatert
              </Text>
            </View>
          ) : null}
        </>
      )}
      {groups.map((g) => (
        <View key={g.title}>
          <Text variant="body" weight="semibold" accessibilityRole="header">
            {g.title}
          </Text>
          {g.entries.map((entry) => {
            const n = entry.items[0];
            if (!n) return null;
            // Follow back on a row of one new follower.
            const person =
              entry.items.length === 1 &&
              n.type === "follow" &&
              n.target.kind === "person"
                ? n.target.id
                : null;
            return (
              <NotificationRow
                key={entry.key}
                n={n}
                actor={entryActor(entry)}
                isRead={entry.items.every((x) => readIds.has(x.id))}
                onOpen={() => open(entry)}
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

// The type badge on the actor's photo (24 px, an exact size).
const BADGE = { width: 24, height: 24 };
// The thumbnail of what the notice names (44 px).
const THUMB = { width: 44, height: 44 };

// One row. The follow button is a sibling of the row's tap area, never inside
// it (a button in a button is invalid on web).
function NotificationRow({
  n,
  actor,
  isRead,
  onOpen,
  follow,
}: {
  n: MockNotification;
  /** "Erik Haug", or "Erik Haug og 2 andre" for a collapsed row. */
  actor: string;
  isRead: boolean;
  onOpen: () => void;
  follow?: { following: boolean; onPress: () => void };
}) {
  const person = notificationPerson(n);
  const thumb: ImageSourcePropType | undefined = follow
    ? undefined
    : notificationThumb(n);
  return (
    <View className="flex-row items-center gap-3">
      <UIPressable
        accessibilityRole="button"
        accessibilityLabel={`${actor} ${n.text}${isRead ? "" : ", ulest"}`}
        accessibilityHint="Åpner det varselet gjelder"
        onPress={onOpen}
        className="flex-1"
        contentClassName="flex-row items-center gap-3 py-3"
        pressedScale={0.99}
      >
        <View className="w-2 items-center">
          {!isRead ? <View className="h-2 w-2 rounded-full bg-ember" /> : null}
        </View>
        <View>
          <Avatar
            decorative
            size="md"
            name={n.actorName}
            initials={n.actorInitials}
            source={person ? libImage(person.avatar) : undefined}
          />
          <View
            className="absolute -bottom-1 -right-1 items-center justify-center rounded-full border-2 border-background bg-surfaceMuted"
            style={BADGE}
          >
            <Icon name={TYPE_ICON[n.type]} size="sm" tone="ink" />
          </View>
        </View>
        <Text variant="label" numberOfLines={3} className="flex-1">
          <Text variant="label" weight="semibold">
            {actor}
          </Text>{" "}
          {n.text}{" "}
          <Text variant="label" tone="muted">
            {/* Non-breaking spaces keep "· 3 d" on one line. */}
            {`· ${notificationTimeLabel(n.minutesAgo).replace(/ /g, " ")}`}
          </Text>
        </Text>
        {thumb ? (
          <View
            testID="notification-thumb"
            className="overflow-hidden rounded-sm bg-surfaceMuted"
            style={THUMB}
          >
            <LoadingImage
              thumb
              source={thumb}
              contentFit="cover"
              style={THUMB}
            />
          </View>
        ) : null}
      </UIPressable>
      {follow ? (
        <FollowButton
          following={follow.following}
          onPress={follow.onPress}
          name={n.actorName}
          followLabel="Følg tilbake"
        />
      ) : null}
    </View>
  );
}
