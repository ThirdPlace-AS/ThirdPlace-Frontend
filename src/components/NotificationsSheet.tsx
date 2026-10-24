import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DemoBadge } from "@/components/DemoBadge";
import { Sheet } from "@/components/Sheet";
import { SwipeableRow } from "@/components/SwipeableRow";
import {
  MOCK_NOTIFICATIONS,
  NOTIFICATION_GROUPS,
  notificationGroup,
  notificationTimeLabel,
  visibleNotifications,
  type MockNotification,
  type NotificationType,
} from "@/fixtures";
import { colors, motion } from "@/theme";

// type → the small category glyph (avatar corner badge + thumbnail placeholder).
const TYPE_ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  join: "people",
  message: "chatbubble",
  review: "star",
  follow: "person-add",
  invite: "mail",
};

const LINK_BLUE = "#3797EF"; // iOS-style link color for the "Filter" action
const SWIPE_GREY = "#48484A"; // ••• action tile on the dark theme
const SWIPE_RED = "#FF3B30"; // trash action tile
const SWIPE_BG = "#202020"; // opaque row bg over the swipe actions (= ink)

function NotificationRow({
  item,
  read,
  following,
  onPress,
  onToggleFollow,
  onOpenMenu,
  onDismiss,
}: {
  item: MockNotification;
  read: boolean;
  following: boolean;
  onPress: () => void;
  onToggleFollow: () => void;
  onOpenMenu: () => void;
  onDismiss: () => void;
}) {
  return (
    <SwipeableRow
      background={SWIPE_BG}
      actions={[
        {
          icon: "ellipsis-horizontal",
          bg: SWIPE_GREY,
          tint: "#FFFFFF",
          accessibilityLabel: "Flere valg",
          onPress: onOpenMenu,
        },
        {
          icon: "trash",
          bg: SWIPE_RED,
          tint: "#FFFFFF",
          accessibilityLabel: `Fjern varsel fra ${item.actorName}`,
          onPress: onDismiss,
        },
      ]}
    >
      {/* The tappable body and the follow button are SIBLINGS, never nested —
          a button inside a button is invalid DOM on web. */}
      <View
        className={`flex-row items-center gap-3 px-2 py-3 ${
          read ? "" : "bg-white/5"
        }`}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.actorName} ${item.text} ${notificationTimeLabel(
            item.minutesAgo,
          )}`}
          onPress={onPress}
          onLongPress={onOpenMenu}
          delayLongPress={300}
          className="flex-1 flex-row items-center gap-3"
        >
          {/* Initials avatar (no photos exist in fixtures) + type glyph corner. */}
          <View className="h-14 w-14 items-center justify-center rounded-full bg-white/10">
            <Text className="text-base font-semibold text-white">
              {item.actorInitials}
            </Text>
            <View className="absolute -bottom-0.5 -right-0.5 h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-white">
              <Ionicons
                name={TYPE_ICON[item.type]}
                size={11}
                color={colors.ink}
              />
            </View>
          </View>

          <Text className="flex-1 text-[15px] leading-5 text-white">
            <Text className="font-semibold">{item.actorName}</Text> {item.text}{" "}
            <Text className="text-white/50">
              {notificationTimeLabel(item.minutesAgo)}
            </Text>
          </Text>
        </Pressable>

        {item.type === "follow" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              following ? "Følger" : `Følg ${item.actorName} tilbake`
            }
            onPress={onToggleFollow}
            hitSlop={8}
            className={`rounded-lg px-4 py-2 ${
              following ? "border border-white/25" : "bg-ember"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                following ? "text-white" : "text-onEmber"
              }`}
            >
              {following ? "Følger" : "Følg tilbake"}
            </Text>
          </Pressable>
        ) : item.thumbnailTint ? (
          <View
            style={{ backgroundColor: item.thumbnailTint }}
            className="h-14 w-14 items-center justify-center rounded-md"
          >
            <Ionicons
              name={TYPE_ICON[item.type]}
              size={22}
              color="rgba(255,255,255,0.85)"
            />
          </View>
        ) : !read ? (
          <View className="h-2.5 w-2.5 rounded-full bg-ember" />
        ) : null}
      </View>
    </SwipeableRow>
  );
}

// Bottom action sheet for a single notification (DEMO — local only). These
// per-item actions (not-interested / mute-this-kind) are Instagram-parity demo
// UI; they are NOT in the V2.2 Notifications contract.
function NotifActionSheet({
  target,
  onClose,
  onNotInterested,
  onMuteType,
  onDismiss,
}: {
  target: MockNotification | null;
  onClose: () => void;
  onNotInterested: () => void;
  onMuteType: () => void;
  onDismiss: () => void;
}) {
  return (
    <Sheet visible={target !== null} onClose={onClose} tone="dark">
      <View className="flex-row items-center gap-2">
        <DemoBadge />
        <Text className="flex-1 text-xs text-white/50">
          Demo — valgene er lokale og nullstilles ved omstart.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onNotInterested}
        className="flex-row items-center gap-3 rounded-md px-1 py-3"
      >
        <Ionicons name="eye-off-outline" size={22} color={colors.onInk} />
        <Text className="text-base text-white">Ikke interessert</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onMuteType}
        className="flex-row items-center gap-3 rounded-md px-1 py-3"
      >
        <Ionicons
          name="notifications-off-outline"
          size={22}
          color={colors.onInk}
        />
        <Text className="text-base text-white">Slå av varsler som dette</Text>
      </Pressable>
      {/* Also offered here (not only via swipe) so delete is reachable without
          a gesture — keyboard/screen-reader accessible and works on web. */}
      <Pressable
        accessibilityRole="button"
        onPress={onDismiss}
        className="flex-row items-center gap-3 rounded-md px-1 py-3"
      >
        <Ionicons name="trash-outline" size={22} color={colors.ember} />
        <Text className="text-base text-ember">Fjern varsel</Text>
      </Pressable>
    </Sheet>
  );
}

// Fullscreen notifications, Instagram-style. Slides in from the RIGHT over a
// DARK background. All demo/local: read-state, follow, dismiss, mute and
// "not interested" are in-memory only and reset on reload — no real push/inbox/
// follow graph exists (BLOCKED_CONTRACT_GAP).
export function NotificationsSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {visible ? <NotificationsBody onClose={onClose} /> : null}
    </Modal>
  );
}

function NotificationsBody({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const translateX = useSharedValue(reduced ? 0 : width);

  // Slide in from the right on mount (body mounts only while visible).
  useEffect(() => {
    translateX.value = reduced
      ? 0
      : withTiming(0, { duration: motion.duration.base });
  }, [reduced, translateX]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Local demo state only — no real inbox/read receipts/follow graph.
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(MOCK_NOTIFICATIONS.filter((n) => n.read).map((n) => n.id)),
  );
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [notInterestedIds, setNotInterestedIds] = useState<Set<string>>(
    new Set(),
  );
  const [mutedTypes, setMutedTypes] = useState<Set<NotificationType>>(
    new Set(),
  );
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [menuTarget, setMenuTarget] = useState<MockNotification | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const markRead = (id: string) => setReadIds((prev) => new Set(prev).add(id));
  const toggleFollow = (id: string) =>
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const dismiss = (id: string) =>
    setDismissedIds((prev) => new Set(prev).add(id));
  const notInterested = (id: string) =>
    setNotInterestedIds((prev) => new Set(prev).add(id));
  const muteType = (type: NotificationType) =>
    setMutedTypes((prev) => new Set(prev).add(type));

  const shown = visibleNotifications(MOCK_NOTIFICATIONS, {
    dismissedIds,
    notInterestedIds,
    mutedTypes,
    readIds,
    onlyUnread,
  });
  const allCaughtUp = shown.every((n) => readIds.has(n.id));

  return (
    <Animated.View
      className="flex-1"
      style={[
        slideStyle,
        {
          backgroundColor: colors.ink,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Light status-bar icons while the dark overlay is open. */}
      <StatusBar style="light" />

      <View className="flex-row items-center gap-2 px-gutter pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tilbake"
          onPress={onClose}
          hitSlop={8}
          className="-ml-1 h-10 w-10 items-center justify-center rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color={colors.onInk} />
        </Pressable>
        <Text className="flex-1 text-2xl font-bold text-white">Varsler</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filtrer varsler"
          onPress={() => setFilterOpen(true)}
          hitSlop={8}
          className="px-1 py-1"
        >
          <Text
            className="text-base font-semibold"
            style={{ color: LINK_BLUE }}
          >
            Filter
          </Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2 px-gutter pb-1">
        <DemoBadge />
        <Text className="flex-1 text-xs text-white/50">
          Demo — statiske varsler, ingen reell push, innboks eller følging.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-gutter pb-8 pt-1"
        showsVerticalScrollIndicator={false}
      >
        {allCaughtUp ? (
          <View className="flex-row items-center gap-3 px-2 pt-2">
            <View className="h-14 w-14 items-center justify-center rounded-full border border-white/20">
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color={colors.onInk}
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-white">
                Du er oppdatert
              </Text>
              <Text className="text-sm text-white/50">
                Du har sett alle de nye varslene dine.
              </Text>
            </View>
          </View>
        ) : null}

        {NOTIFICATION_GROUPS.map((group) => {
          const rows = shown
            .filter((n) => notificationGroup(n.minutesAgo) === group)
            .sort((a, b) => a.minutesAgo - b.minutesAgo);
          if (rows.length === 0) return null;
          return (
            <View key={group} className="gap-1">
              <Text className="px-2 pb-1 pt-3 text-base font-bold text-white">
                {group}
              </Text>
              {rows.map((n) => (
                <NotificationRow
                  key={n.id}
                  item={n}
                  read={readIds.has(n.id)}
                  following={followedIds.has(n.id)}
                  onPress={() => markRead(n.id)}
                  onToggleFollow={() => toggleFollow(n.id)}
                  onOpenMenu={() => setMenuTarget(n)}
                  onDismiss={() => dismiss(n.id)}
                />
              ))}
            </View>
          );
        })}

        {shown.length === 0 ? (
          <View className="items-center gap-2 pt-16">
            <Ionicons
              name="notifications-off-outline"
              size={32}
              color={colors.onInk}
            />
            <Text className="text-center text-sm text-white/50">
              {onlyUnread ? "Ingen uleste varsler." : "Ingen varsler å vise."}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <NotifActionSheet
        target={menuTarget}
        onClose={() => setMenuTarget(null)}
        onNotInterested={() => {
          if (menuTarget) notInterested(menuTarget.id);
          setMenuTarget(null);
        }}
        onMuteType={() => {
          if (menuTarget) muteType(menuTarget.type);
          setMenuTarget(null);
        }}
        onDismiss={() => {
          if (menuTarget) dismiss(menuTarget.id);
          setMenuTarget(null);
        }}
      />

      <Sheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Vis varsler"
        tone="dark"
      >
        {(
          [
            { label: "Alle", value: false },
            { label: "Uleste", value: true },
          ] as const
        ).map((opt) => {
          const active = onlyUnread === opt.value;
          return (
            <Pressable
              key={opt.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                setOnlyUnread(opt.value);
                setFilterOpen(false);
              }}
              className={`flex-row items-center justify-between rounded-md border px-3 py-3 ${
                active ? "border-ember bg-ember/10" : "border-white/15"
              }`}
            >
              <Text className="text-base text-white">{opt.label}</Text>
              {active ? (
                <Ionicons name="checkmark" size={20} color={colors.ember} />
              ) : null}
            </Pressable>
          );
        })}
      </Sheet>
    </Animated.View>
  );
}
