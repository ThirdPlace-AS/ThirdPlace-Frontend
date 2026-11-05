import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import {
  Header,
  Icon,
  IconButton,
  Screen,
  SearchBar,
  Accordion,
} from "@/components/ui";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { UserSearch } from "@/components/pickers/Pickers";
import { NotificationsSheet } from "@/components/NotificationsSheet";
import { Sheet } from "@/components/Sheet";
import {
  CHAT_ACCESS_LABEL,
  chats,
  type MockChat,
  type MockChatAccess,
} from "@/fixtures";

// Chat tab, laid out per the design (PDF p9): search, "Aktive samtaler", then
// collapsible Opplevelser / Steder groups, a pencil FAB for "Ny chat" (p10) and
// a link to "Arkiverte chatter" (read-only, p10). DEMO ONLY: no realtime or
// messaging backend; chat types / access modes are display labels
// (BLOCKED_CONTRACT_GAP).
export default function ChatScreen() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [newOpen, setNewOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [archOpen, setArchOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      chats.filter(
        (c) =>
          c.status === "active" &&
          (!q ||
            c.name.toLowerCase().includes(q) ||
            c.last.toLowerCase().includes(q)),
      ),
    [q],
  );
  const archived = chats.filter((c) => c.status === "archived");
  const groups = [
    {
      key: "experience",
      label: "Opplevelser",
      icon: "sparkles-outline" as const,
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
              onPress={() => setNotifOpen(true)}
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
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
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

        {visible.length === 0 ? (
          <Text className="py-8 text-center text-sm text-muted font-normal">
            Ingen samtaler matcher «{query}».
          </Text>
        ) : null}

        {archived.length > 0 && !q ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setArchOpen(true)}
            className="flex-row items-center gap-3 px-1 py-2 active:opacity-70"
          >
            <Icon name="archive-outline" size="md" tone="muted" />
            <Text className="flex-1 text-sm text-muted font-normal">
              Arkiverte chatter ({archived.length})
            </Text>
            <Icon name="chevron-forward" size="sm" tone="muted" />
          </Pressable>
        ) : null}
      </ScrollView>

      <IconButton
        icon="create-outline"
        label="Ny chat"
        variant="ink"
        size="xl"
        haptic="light"
        onPress={() => setNewOpen(true)}
        className="absolute bottom-5 right-5"
      />

      <NewChatSheet visible={newOpen} onClose={() => setNewOpen(false)} />
      <Sheet
        visible={archOpen}
        onClose={() => setArchOpen(false)}
        title="Arkiverte chatter"
      >
        <View className="gap-2">
          <Text className="text-sm text-muted font-normal">
            Kun lesbart — du kan ikke sende nye meldinger.
          </Text>
          {archived.map((c) => (
            <ChatRow
              key={c.id}
              chat={{
                ...c,
                last: `${c.archivedNote ?? "Arkivert"} · ${c.last}`,
              }}
              onPress={() => {
                setArchOpen(false);
                openChat(c);
              }}
            />
          ))}
        </View>
      </Sheet>
      <NotificationsSheet
        visible={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </Screen>
  );
}

function ChatRow({ chat, onPress }: { chat: MockChat; onPress: () => void }) {
  const icon =
    chat.type === "experience"
      ? "musical-notes-outline"
      : chat.type === "place" || chat.type === "business"
        ? "cafe-outline"
        : null;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-md bg-surface px-3 py-3 active:opacity-80"
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-surfaceMuted">
        {icon ? (
          <Icon name={icon} size="md" tone="ink" />
        ) : (
          <Text className="text-sm font-semibold text-ink">
            {chat.initials}
          </Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {chat.name}
        </Text>
        <Text className="text-sm text-muted font-normal" numberOfLines={1}>
          {chat.last}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text className="text-xs text-muted font-normal">{chat.time}</Text>
        {chat.unread > 0 ? (
          <View className="h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1.5">
            <Text className="text-xs font-semibold text-onEmber">
              {chat.unread}
            </Text>
          </View>
        ) : (
          <View className="h-5" />
        )}
      </View>
    </Pressable>
  );
}

// "Ny chat" (PDF p10): Navn, Type (Åpen / Lukket / Kun invitasjon). DEMO —
// "Opprett chat" creates nothing; a DemoNote says so.
function NewChatSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [access, setAccess] = useState<MockChatAccess>("open");
  const [members, setMembers] = useState<string[]>([]);
  const [search, setSearch] = useState(false);
  return (
    <Sheet visible={visible} onClose={onClose} title="Ny chat">
      <View className="gap-4">
        <Input
          label="Navn"
          placeholder="F.eks. «Løpegjengen på Løkka»"
          value={name}
          onChangeText={setName}
          maxLength={50}
        />
        <View className="gap-2">
          <Text className="text-sm font-semibold text-ink">Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {(Object.keys(CHAT_ACCESS_LABEL) as MockChatAccess[]).map((a) => (
              <Chip
                key={a}
                label={CHAT_ACCESS_LABEL[a]}
                selected={access === a}
                onPress={() => setAccess(a)}
              />
            ))}
          </View>
        </View>
        <View className="gap-2">
          <Text className="text-sm font-semibold text-ink">Medlemmer</Text>
          {members.length ? (
            <Text className="text-sm text-ink font-normal">
              {members.join(", ")}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => setSearch(true)}
            className="flex-row items-center gap-2 self-start rounded-full border border-line bg-surface px-3 py-2"
          >
            <Icon name="person-add-outline" size="sm" tone="ink" />
            <Text className="text-sm font-medium text-ink">Legg til</Text>
          </Pressable>
        </View>
        {search ? (
          <UserSearch
            onPick={(p) =>
              setMembers((m) => (m.includes(p.name) ? m : [...m, p.name]))
            }
            onClose={() => setSearch(false)}
          />
        ) : null}
        <DemoNote>Ingen chat opprettes, og ingen blir invitert.</DemoNote>
        <Button
          label="Opprett chat"
          variant="ink"
          disabled={name.trim().length === 0}
          onPress={onClose}
        />
      </View>
    </Sheet>
  );
}
