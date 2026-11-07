import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import {
  Header,
  Icon,
  IconButton,
  Screen,
  SearchBar,
  Accordion,
  Pressable as UIPressable,
  Text,
  EmptyState,
} from "@/components/ui";
import { ChatRow } from "@/features/chat/ChatRow";
import { useCreatedVersion } from "@/fixtures/created";
import { isMember, useJoinedChats } from "@/lib/joinedChats";
import { useNotificationReads } from "@/hooks/useNotificationReads";
import { chats, type MockChat } from "@/fixtures";

// Chat tab, laid out per the design (PDF p9): search, "Aktive samtaler", then
// collapsible Opplevelser / Steder groups, a pencil FAB for "Ny chat" (p10) and
// a link to "Arkiverte chatter" (read-only, p10). DEMO ONLY: no realtime or
// messaging backend; chat types / access modes are display labels
// (BLOCKED_CONTRACT_GAP).
export default function ChatScreen() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const { unread: unreadNotifs } = useNotificationReads();

  const q = query.trim().toLowerCase();
  // Experience and place chats the viewer has not joined stay out of the list.
  const joined = useJoinedChats();
  const created = useCreatedVersion();
  const visible = useMemo(
    () =>
      chats.filter(
        (c) =>
          c.status === "active" &&
          isMember(c, joined) &&
          (!q ||
            c.name.toLowerCase().includes(q) ||
            c.last.toLowerCase().includes(q)),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- created: a new group chat joined the list
    [q, joined, created],
  );
  const archived = chats.filter((c) => c.status === "archived");
  const groups = [
    {
      key: "experience",
      label: "Opplevelser",
      icon: "tp-experience" as const,
      items: visible.filter((c) => c.type === "experience"),
    },
    {
      key: "place",
      label: "Steder",
      icon: "location-outline" as const,
      items: visible.filter((c) => c.type === "place" || c.type === "business"),
    },
  ];
  // "Aktive samtaler": everything that is not filed under a group below
  // (DMs, user-created, group-swipe, marketplace …) plus any grouped chat with
  // unread messages.
  const grouped = (c: MockChat) =>
    c.type === "experience" || c.type === "place" || c.type === "business";
  const active = visible.filter((c) => !grouped(c) || c.unread > 0);

  const openChat = (c: MockChat) =>
    router.push({ pathname: "/chat/[id]", params: { id: c.id } });

  return (
    <Screen edges={["top"]}>
      <ScrollView
        contentContainerClassName="gap-4 px-gutter pb-28"
        keyboardShouldPersistTaps="handled"
      >
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

        {active.length > 0 ? (
          <View className="gap-2">
            <Text variant="title" accessibilityRole="header">
              Aktive samtaler
            </Text>
            {active.map((c) => (
              <ChatRow key={c.id} chat={c} onPress={() => openChat(c)} />
            ))}
          </View>
        ) : null}

        {groups.map((g) =>
          g.items.length > 0 ? (
            <Accordion
              key={g.key}
              variant="card"
              icon={g.icon}
              title={g.label}
              meta={String(g.items.length)}
              open={!!open[g.key] || !!q}
              onToggle={() => setOpen((s) => ({ ...s, [g.key]: !s[g.key] }))}
            >
              <View className="gap-2 px-2 pb-2">
                {g.items.map((c) => (
                  <ChatRow key={c.id} chat={c} onPress={() => openChat(c)} />
                ))}
              </View>
            </Accordion>
          ) : null,
        )}

        {visible.length === 0 && q ? (
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

        {archived.length > 0 && !q ? (
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
        haptic="light"
        onPress={() => router.push("/chat/new" as Href)}
        className="absolute bottom-5 right-5"
      />
    </Screen>
  );
}
