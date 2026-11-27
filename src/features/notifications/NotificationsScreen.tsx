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
// and "Du er helt oppdatert" at the top once nothing is unread. The type pills
// are gone (user 2026-11-26).
// 0561 (user 2026-11-27, Instagram's Varsler): swipe a row left for «…»
// (Ikke interessert, Blokker) and Slett (asks first); Filtrer in the header
// keeps chosen kinds of notice or only people you follow.
// User 2026-11-27: «…» also offers Fjern følger for a follower, Filtrer adds
// Verifisert, and "Merk alle lest" moved from the header into Filtrer's sheet.
// BLOCKED_CONTRACT_GAP: no push, inbox or notification feed exists.
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Pressable, View, type ImageSourcePropType } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import {
  BlockSheet,
  ItemActionsSheet,
  type ItemAction,
} from "@/components/actions/ActionSheets";
import { showToastAfterSheet } from "@/components/Toast";
import { confirmToast, followerRemovedToast } from "@/copy";

import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { SignInPrompt } from "@/components/SignInPrompt";
import { EmptyState } from "@/components/states/StateView";
import {
  Avatar,
  Button,
  FollowButton,
  Icon,
  IconButton,
  LoadingImage,
  Page,
  Sheet,
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
import {
  isFollower,
  removeFollower,
  toggleFollow,
  useFollowing,
  useRemovedFollowers,
} from "@/lib/following";

import { NotificationFilterSheet } from "./NotificationFilterSheet";
import {
  NO_NOTIFICATION_FILTER,
  applyNotificationFilter,
  isNotificationFilterOn,
  notificationPerson,
  notificationThumb,
  type NotificationFilter,
} from "./notificationFilters";
import { GuestPage } from "@/components/GuestPage";

const TYPE_ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  join: "people-outline",
  message: "chatbubble-outline",
  review: "star-outline",
  follow: "person-add-outline",
  invite: "mail-outline",
};

export default function NotificationsScreen() {
  return (
    <GuestPage
      title="Varsler"
      message="Logg inn for å se varslene dine."
      action="se varslene dine"
    >
      <NotificationsContent />
    </GuestPage>
  );
}

function NotificationsContent() {
  const {
    items,
    readIds,
    unread,
    markRead,
    markAllRead,
    dismiss,
    notInterested,
  } = useNotificationReads();
  const following = useFollowing();
  useRemovedFollowers();
  const { isGuest } = useGuestMode();
  const [signIn, setSignIn] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>(
    NO_NOTIFICATION_FILTER,
  );
  const [filterOpen, setFilterOpen] = useState(false);
  // The row whose «…» sheet or Slett question is open, and who to block.
  const [menuFor, setMenuFor] = useState<NotificationEntry | null>(null);
  const [deleteFor, setDeleteFor] = useState<NotificationEntry | null>(null);
  const [blockFor, setBlockFor] = useState<{ id: string; name: string } | null>(
    null,
  );
  // One row open at a time: opening another closes the last.
  const openRow = useRef<SwipeableMethods | null>(null);
  const onRowOpen = useCallback((row: SwipeableMethods) => {
    if (openRow.current && openRow.current !== row) openRow.current.close();
    openRow.current = row;
  }, []);
  const filterOn = isNotificationFilterOn(filter);
  const shown = applyNotificationFilter(items, filter, following);
  const groups = NOTIFICATION_GROUPS.map((title) => ({
    title,
    entries: collapseNotifications(
      shown.filter((n) => notificationGroup(n.minutesAgo) === title),
    ),
  })).filter((g) => g.entries.length > 0);
  const idsOf = (entry: NotificationEntry) => entry.items.map((n) => n.id);
  const menuActions = (entry: NotificationEntry): ItemAction[] => {
    const first = entry.items[0];
    const person =
      entry.items.length === 1 && first ? notificationPerson(first) : undefined;
    const firstName = person?.name.split(" ")[0] ?? "";
    return [
      {
        label: "Ikke interessert",
        icon: "eye-off-outline",
        onPress: () => {
          notInterested(idsOf(entry));
          showToastAfterSheet(confirmToast.notificationHidden);
        },
      },
      ...(person && isFollower(person.id)
        ? [
            {
              label: "Fjern følger",
              icon: "person-remove-outline" as const,
              onPress: () => {
                removeFollower(person.id);
                showToastAfterSheet(followerRemovedToast(firstName));
              },
            },
          ]
        : []),
      ...(person
        ? [
            {
              label: "Blokker " + firstName,
              icon: "ban-outline" as const,
              afterClose: true,
              onPress: () => setBlockFor({ id: person.id, name: person.name }),
            },
          ]
        : []),
    ];
  };

  const open = (entry: NotificationEntry) => {
    const first = entry.items[0];
    if (!first) return;
    entry.items.forEach((n) => markRead(n.id));
    // A message opens its thread over the Chat tab, so back from the thread
    // goes to the chat list as in any messaging app (review 2026-11-18 JR2).
    if (first.target.kind === "chat") {
      router.dismissTo("/chat");
      router.push(notificationHref(first.target));
      return;
    }
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
        <IconButton
          icon="options-outline"
          label={filterOn ? "Filtrer, filter på" : "Filtrer"}
          badge={filterOn}
          onPress={() => setFilterOpen(true)}
        />
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
      {items.length > 0 && filterOn && groups.length === 0 ? (
        <EmptyState
          fill={false}
          icon="options-outline"
          title="Ingen varsler passer filteret"
          actionLabel="Fjern filteret"
          onAction={() => setFilter(NO_NOTIFICATION_FILTER)}
        />
      ) : null}
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
              <SwipeRow
                key={entry.key}
                onOpen={onRowOpen}
                onMore={() => setMenuFor(entry)}
                onDelete={() => setDeleteFor(entry)}
              >
                <NotificationRow
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
              </SwipeRow>
            );
          })}
        </View>
      ))}
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="følge folk"
      />
      {filterOpen ? (
        <NotificationFilterSheet
          value={filter}
          onApply={setFilter}
          onClose={() => setFilterOpen(false)}
          unread={unread}
          onMarkAllRead={markAllRead}
        />
      ) : null}
      {menuFor ? (
        <ItemActionsSheet
          title={entryActor(menuFor)}
          actions={menuActions(menuFor)}
          onClose={() => {
            setMenuFor(null);
            openRow.current?.close();
          }}
        />
      ) : null}
      {deleteFor ? (
        <Sheet
          visible
          onClose={() => setDeleteFor(null)}
          title="Vil du slette dette varselet?"
        >
          <View className="gap-3">
            <Button
              label="Slett"
              variant="danger"
              onPress={() => {
                dismiss(idsOf(deleteFor));
                setDeleteFor(null);
                openRow.current = null;
                showToastAfterSheet(confirmToast.notificationDeleted);
              }}
            />
            <Button
              label="Avbryt"
              variant="secondary"
              onPress={() => {
                setDeleteFor(null);
                openRow.current?.close();
              }}
            />
          </View>
        </Sheet>
      ) : null}
      {blockFor ? (
        <BlockSheet
          name={blockFor.name}
          personId={blockFor.id}
          onClose={() => setBlockFor(null)}
        />
      ) : null}
    </Page>
  );
}

// Width of each swipe action («…» and Slett).
const ACTION_W = 72;

// A row that swipes left to show «…» and Slett (0561). Screen readers get
// the same two as accessibility actions on the row.
function SwipeRow({
  children,
  onOpen,
  onMore,
  onDelete,
}: {
  children: React.ReactNode;
  onOpen: (row: SwipeableMethods) => void;
  onMore: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<SwipeableMethods>(null);
  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={1.5}
      rightThreshold={ACTION_W / 2}
      overshootRight={false}
      onSwipeableWillOpen={() => {
        if (ref.current) onOpen(ref.current);
      }}
      renderRightActions={() => (
        <View className="flex-row">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Flere valg"
            onPress={onMore}
            className="items-center justify-center bg-surfaceMuted"
            style={{ width: ACTION_W }}
          >
            <Icon name="ellipsis-horizontal" size="md" tone="ink" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Slett"
            onPress={onDelete}
            className="items-center justify-center bg-danger"
            style={{ width: ACTION_W }}
          >
            <Icon name="trash-outline" size="md" tone="onMedia" />
          </Pressable>
        </View>
      )}
    >
      <View
        className="bg-background"
        accessibilityActions={[
          { name: "more", label: "Flere valg" },
          { name: "delete", label: "Slett" },
        ]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === "more") onMore();
          if (e.nativeEvent.actionName === "delete") onDelete();
        }}
      >
        {children}
      </View>
    </ReanimatedSwipeable>
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
