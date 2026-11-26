import { router, type Href } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  Header,
  Icon,
  IconButton,
  Screen,
  SearchBar,
  SortableList,
  Pressable as UIPressable,
  Section,
  Text,
  EmptyState,
} from "@/components/ui";
import type { ItemAction } from "@/components/actions/ActionSheets";
import { ContextMenu } from "@/components/actions/ContextMenu";
import { ChatFilterPills } from "@/features/chat/ChatFilterPills";
import { ChatPeek } from "@/features/chat/ChatPeek";
import { ChatRow } from "@/features/chat/ChatRow";
import {
  chatFilterPills,
  filterChats,
  type ChatFilterKey,
} from "@/features/chat/chatFilters";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCreatedVersion } from "@/fixtures/created";
import { isMember, useJoinedChats } from "@/lib/joinedChats";
import { useNotificationReads } from "@/hooks/useNotificationReads";
import { markChatRead, unreadOf, useChatReads } from "@/lib/chatReads";
import { useThreads, withLastSent } from "@/lib/chatThreads";
import {
  setPinnedOrder,
  togglePinnedChat,
  usePinnedChats,
} from "@/lib/pinnedChats";
import { chats, type MockChat } from "@/fixtures";
import { motion } from "@/theme/motion";
import { GuestPage } from "@/components/GuestPage";

const chatKey = (c: MockChat) => c.id;
const chatName = (c: MockChat) => c.name;

// Chat tab, laid out per the design (PDF p9): search, "Aktive samtaler" (the
// collapsible Opplevelser / Steder groups are gone, user 2026-11-26: every
// chat is in the one list, the pills still narrow it), a pencil FAB for "Ny chat" (p10) and
// a link to "Arkiverte chatter" (read-only, p10). Phase 18 (founder, screen
// benchmark: WhatsApp, Telegram): a long press on a chat offers "Fest øverst"
// / "Løsne" and "Merk som lest"; pinned chats lead the list under "Festet"
// and leave their other section (src/lib/pinnedChats.ts, in memory).
// 0459 (user 2026-11-17): filter pills under the search (Alle, Ulest,
// Personer, Grupper, Opplevelser, Steder, Marked; a pill shows only while one
// of your chats matches it), and the title, search and pills stay put while
// the list scrolls, with a hairline under them once it has scrolled. No
// realtime or messaging backend; chat types / access modes are display labels
// (BLOCKED_CONTRACT_GAP).
export default function ChatScreen() {
  return (
    <GuestPage
      title="Chat"
      tab
      message="Logg inn for å se chattene dine."
      action="se chattene dine"
    >
      <ChatContent />
    </GuestPage>
  );
}

function ChatContent() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ChatFilterKey>("all");
  // A row's picture, larger with the chat's actions (ChatPeek).
  const [peek, setPeek] = useState<MockChat | null>(null);
  const { unread: unreadNotifs } = useNotificationReads();
  const pins = usePinnedChats();
  const reads = useChatReads();
  const reduced = useReducedMotion();

  const q = query.trim().toLowerCase();
  // Experience and place chats the viewer has not joined stay out of the list.
  const joined = useJoinedChats();
  const created = useCreatedVersion();
  // What you wrote this session is the row’s last message.
  const threads = useThreads();
  const mine = useMemo(
    () =>
      chats
        .filter((c) => c.status === "active" && isMember(c, joined))
        .map((c) => withLastSent(c, threads)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- created: a new group chat joined the list
    [joined, created, threads],
  );
  const visible = useMemo(
    () =>
      q
        ? mine.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.last.toLowerCase().includes(q),
          )
        : mine,
    [mine, q],
  );
  const unreadCount = useCallback((c: MockChat) => unreadOf(c, reads), [reads]);
  // Pills follow your chats, not the search, so they hold still while typing.
  const pills = useMemo(
    () => chatFilterPills(mine, unreadCount),
    [mine, unreadCount],
  );
  // A pill that has nothing left (the last unread chat was read) falls back
  // to Alle.
  const current: ChatFilterKey = pills.some((p) => p.key === filter)
    ? filter
    : "all";
  const flat = useMemo(
    () =>
      current === "all"
        ? null
        : filterChats(visible, current, unreadCount, pins),
    [current, visible, unreadCount, pins],
  );
  const shown = flat ?? visible;

  // The hairline under the fixed top: a shared value flips only when the list
  // crosses its top, so a scroll costs no React render.
  const scrolled = useSharedValue(0);
  const atTop = useRef(true);
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const top = e.nativeEvent.contentOffset.y <= 2;
      if (top === atTop.current) return;
      atTop.current = top;
      const to = top ? 0 : 1;
      scrolled.set(
        reduced ? to : withTiming(to, { duration: motion.duration.fast }),
      );
    },
    [reduced, scrolled],
  );
  const hairline = useAnimatedStyle(() => ({ opacity: scrolled.value }));
  const archived = chats.filter((c) => c.status === "archived");
  const isPinned = (c: MockChat) => pins.includes(c.id);
  const pinnedChats = pins.flatMap((id) => {
    const c = visible.find((x) => x.id === id);
    return c ? [c] : [];
  });
  // "Aktive samtaler": every chat that is not pinned.
  const active = visible.filter((c) => !isPinned(c));

  const openChat = (c: MockChat) =>
    router.push({ pathname: "/chat/[id]", params: { id: c.id } });
  // Long press: pin or unpin, and mark as read when there is something new.
  const actionsOf = (c: MockChat): ItemAction[] => [
    isPinned(c)
      ? {
          label: "Løsne",
          icon: "remove-circle-outline",
          onPress: () => togglePinnedChat(c.id),
        }
      : {
          label: "Fest øverst",
          icon: "pin-outline",
          onPress: () => togglePinnedChat(c.id),
        },
    ...(unreadOf(c, reads) > 0
      ? [
          {
            label: "Merk som lest",
            icon: "checkmark-done-outline" as const,
            onPress: () => markChatRead(c.id),
          },
        ]
      : []),
  ];
  const row = (c: MockChat) => (
    <ContextMenu key={c.id} title={c.name} actions={actionsOf(c)}>
      {(openMenu) => (
        <ChatRow
          chat={c}
          pinned={isPinned(c)}
          onPress={() => openChat(c)}
          onLongPress={openMenu}
          onPicturePress={() => setPeek(c)}
        />
      )}
    </ContextMenu>
  );

  const reorderPinned = (next: MockChat[]) =>
    setPinnedOrder(next.map((c) => c.id));

  return (
    <Screen edges={["top"]}>
      <View className="bg-background">
        <View className="gap-4 px-gutter">
          <Header
            title="Chat"
            size="large"
            inset={false}
            trailing={
              <IconButton
                icon="notifications-outline"
                label="Varsler"
                badge={unreadNotifs}
                onPress={() => router.push("/notifications" as Href)}
              />
            }
          />

          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Søk i samtaler eller personer …"
            accessibilityLabel="Søk i samtaler"
          />
        </View>
        {pills.length > 1 ? (
          <ChatFilterPills pills={pills} value={current} onChange={setFilter} />
        ) : (
          <View className="h-2" />
        )}
        <Animated.View pointerEvents="none" style={hairline}>
          <View className="h-px bg-line" />
        </Animated.View>
      </View>

      <ScrollView
        contentContainerClassName="gap-4 px-gutter pb-28 pt-2"
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {flat && flat.length > 0 ? (
          <View className="gap-3">{flat.map(row)}</View>
        ) : null}

        {!flat && pinnedChats.length > 0 ? (
          <Section title="Festet" className="pt-2">
            {pinnedChats.length > 1 && !q ? (
              // Drag to reorder (P9): the ≡ handle at each row's end; the
              // row keeps its press and long press. Not while searching.
              <SortableList
                data={pinnedChats}
                keyOf={chatKey}
                nameOf={chatName}
                renderItem={row}
                onReorder={reorderPinned}
              />
            ) : (
              <View className="gap-3">{pinnedChats.map(row)}</View>
            )}
          </Section>
        ) : null}

        {!flat && active.length > 0 ? (
          <Section title="Aktive samtaler" className="pt-2">
            <View className="gap-3">{active.map(row)}</View>
          </Section>
        ) : null}

        {shown.length === 0 && q ? (
          <EmptyState
            fill={false}
            icon="search"
            title="Ingen treff"
            message={`Ingen samtaler matcher «${query.trim()}».`}
            actionLabel="Tøm søk"
            onAction={() => setQuery("")}
          />
        ) : visible.length === 0 ? (
          // No chats yet: the PDF p26 empty state.
          <EmptyState
            fill={false}
            icon="chatbubble-outline"
            title="Her starter praten"
            message="Bli med på noe som skjer, så møter du folk som er der."
            actionLabel="Finn en opplevelse"
            onAction={() => router.navigate("/swipe")}
          />
        ) : null}

        {archived.length > 0 && !q && !flat ? (
          <UIPressable
            accessibilityRole="button"
            hitSlop={{ top: 5, bottom: 5, left: 8, right: 8 }}
            onPress={() => router.push("/chat/archived" as Href)}
            contentClassName="flex-row items-center gap-3 px-1 py-2"
          >
            <Icon name="archive-outline" size="md" tone="muted" />
            <Text variant="caption" tone="muted" className="flex-1">
              Arkiverte chatter ({archived.length})
            </Text>
            <Icon name="chevron-forward" size="sm" tone="muted" />
          </UIPressable>
        ) : null}
      </ScrollView>

      <IconButton
        icon="create-outline"
        label="Ny chat"
        variant="ink"
        size="xl"
        onPress={() => router.push("/chat/new" as Href)}
        className="absolute bottom-6 right-4"
      />
      <ChatPeek chat={peek} onClose={() => setPeek(null)} />
    </Screen>
  );
}
