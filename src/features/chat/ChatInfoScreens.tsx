// Chat info, Medlemmer and Inviter til chat (PDF p9–p10), pages since
// Phase 12 H4c (/chat/[id]/info, /members, /invite): things you browse and
// manage, not short choices. Report stays a sheet; shared photos open the
// photo viewer. BLOCKED_CONTRACT_GAP: no membership, role, invite-link,
// mute, leave or report contract exists; members are fixture people with
// display roles and actions confirm in product voice.
import { Image } from "expo-image";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { LeaveSheet, ReportSheet } from "@/components/actions/ActionSheets";
import { Button } from "@/components/Button";
import { SearchField } from "@/components/pickers/Pickers";
import { showToast, showToastAfterSheet } from "@/components/Toast";
import {
  Avatar,
  EmptyState,
  Icon,
  ListRow,
  Page,
  PhotoViewer,
  Text,
  Pressable as UIPressable,
} from "@/components/ui";
import { confirmToast } from "@/copy";
import {
  CHAT_ACCESS_LABEL,
  CHAT_TYPE_LABEL,
  chatById,
  experienceById,
  experiences,
  groups,
  people,
  placeById,
  type MockChat,
  type MockPerson,
} from "@/fixtures";
import { interestById } from "@/fixtures/catalog/interests";
import { libImage, libThumb, smallImage } from "@/fixtures/images";
import { chatInviteSlug } from "@/lib/entityRoutes";
import { leaveChat } from "@/lib/joinedChats";

const ROLES = ["Vert · Admin", "Deltar", "Venn", "Kun i chatten"];
/** What a chat is about: its experience's, place's or group's interest. */
function chatInterest(chat: MockChat): string | undefined {
  const id =
    (chat.pinnedExperienceId
      ? experienceById(chat.pinnedExperienceId)?.interestId
      : undefined) ??
    (chat.placeId ? placeById(chat.placeId)?.interestId : undefined) ??
    groups.find((g) => g.chatId === chat.id)?.interestId;
  return id ? interestById(id)?.label : undefined;
}

/** Stand-in members (MOCK): the experience's host first, then people who
 *  like what the chat is about, then everyone else in fixture order. */
export const membersOf = (chat: MockChat) => {
  const hostId = chat.pinnedExperienceId
    ? experienceById(chat.pinnedExperienceId)?.hostId
    : undefined;
  const label = chatInterest(chat);
  const rank = (p: MockPerson) =>
    p.id === hostId ? 0 : label && p.interests.includes(label) ? 1 : 2;
  const pool = [...people].sort((a, b) => rank(a) - rank(b));
  return pool
    .slice(0, Math.min(pool.length, Math.max(2, chat.members ?? 2)))
    .map((p, i) => ({
      person: p,
      role: ROLES[Math.min(i, ROLES.length - 1)] ?? "Kun i chatten",
    }));
};

// Sample photos standing in for images shared in the chat (bundled art).
const SHARED = experiences.flatMap((e) => e.photos).slice(0, 4);

/** The chat for the route's id, or a page saying it is gone. */
function useRouteChat(): MockChat | null {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  return chatById(id) ?? null;
}

function Missing({ title }: { title: string }) {
  return (
    <Page title={title}>
      <EmptyState
        fill={false}
        icon="chatbubbles-outline"
        title="Samtalen finnes ikke"
        actionLabel="Til chattene"
        onAction={() => router.navigate("/chat")}
      />
    </Page>
  );
}

export function ChatInfoScreen() {
  const chat = useRouteChat();
  const [report, setReport] = useState(false);
  const [leave, setLeave] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  if (!chat) return <Missing title="Chat-info" />;
  const exp = chat.pinnedExperienceId
    ? experienceById(chat.pinnedExperienceId)
    : undefined;
  const members = membersOf(chat);
  const act = (label: string) => {
    if (label === "Inviter") router.push(`/chat/${chat.id}/invite` as Href);
    else if (label === "Rapporter") setReport(true);
    else if (label === "Forlat") setLeave(true);
    else showToast(confirmToast.muted);
  };
  return (
    <Page title={chat.name}>
      <Text variant="caption" tone="muted">
        {CHAT_TYPE_LABEL[chat.type]} · {CHAT_ACCESS_LABEL[chat.access]}
      </Text>
      {exp ? (
        <ListRow
          variant="card"
          icon="pricetag-outline"
          title={exp.title}
          subtitle={`Tilknyttet opplevelse · ${exp.when}`}
          onPress={() => router.push(`/experience/${exp.id}` as Href)}
        />
      ) : null}
      <View className="flex-row items-center justify-between">
        <Text variant="label" weight="semibold">
          Medlemmer
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/chat/${chat.id}/members` as Href)}
          hitSlop={8}
        >
          <Text variant="label" weight="semibold" className="underline">
            {`Se alle (${chat.members ?? members.length})`}
          </Text>
        </Pressable>
      </View>
      {members.slice(0, 3).map((m) => (
        <MemberRow key={m.person.id} {...m} />
      ))}
      <Text variant="label" weight="semibold">
        Delte bilder
      </Text>
      <View className="flex-row gap-2">
        {SHARED.map((src, i) => (
          <Pressable
            key={i}
            accessibilityRole="imagebutton"
            accessibilityLabel={`Delt bilde ${i + 1}`}
            onPress={() => setViewer(i)}
            className="flex-1"
          >
            <Image
              source={smallImage(src)}
              contentFit="cover"
              style={{ aspectRatio: 1, width: "100%", borderRadius: 10 }}
            />
          </Pressable>
        ))}
      </View>
      <View className="flex-row gap-2">
        {[
          { icon: "notifications-off-outline" as const, label: "Demp" },
          // A direct message has two people: nobody to invite.
          ...(chat.type === "dm"
            ? []
            : [{ icon: "person-add-outline" as const, label: "Inviter" }]),
          { icon: "exit-outline" as const, label: "Forlat" },
          { icon: "flag-outline" as const, label: "Rapporter" },
        ].map((a) => (
          <UIPressable
            key={a.label}
            accessibilityRole="button"
            onPress={() => act(a.label)}
            className="flex-1"
            contentClassName="items-center gap-1 rounded-md border border-line bg-surface py-3"
            pressedScale={0.99}
          >
            <Icon name={a.icon} size="md" tone="ink" />
            <Text variant="caption" weight="medium">
              {a.label}
            </Text>
          </UIPressable>
        ))}
      </View>

      {report ? <ReportSheet onClose={() => setReport(false)} /> : null}
      {leave ? (
        <LeaveSheet
          title="Forlate chatten?"
          onClose={() => setLeave(false)}
          onConfirm={() => {
            leaveChat(chat.id);
            router.navigate("/chat");
            showToastAfterSheet({
              title: "Du har forlatt chatten",
              icon: "exit-outline",
            });
          }}
        />
      ) : null}
      <PhotoViewer
        photos={SHARED}
        index={viewer}
        onClose={() => setViewer(null)}
        label="Delte bilder"
      />
    </Page>
  );
}

export function ChatMembersScreen() {
  const chat = useRouteChat();
  const [q, setQ] = useState("");
  if (!chat) return <Missing title="Medlemmer" />;
  const all = membersOf(chat);
  const list = all.filter((m) =>
    m.person.name.toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <Page title="Medlemmer">
      <Text variant="caption" tone="muted">
        {chat.members ?? all.length} i chatten
      </Text>
      <SearchField
        autoFocus={false}
        value={q}
        onChange={setQ}
        placeholder="Søk medlemmer …"
      />
      {list.map((m) => (
        <MemberRow key={m.person.id} {...m} />
      ))}
      {list.length === 0 ? (
        <Text variant="label" tone="muted" weight="regular">
          Ingen treff på «{q.trim()}».
        </Text>
      ) : null}
    </Page>
  );
}

export function ChatInviteScreen() {
  const chat = useRouteChat();
  const [q, setQ] = useState("");
  const [done, setDone] = useState<string[]>([]);
  if (!chat) return <Missing title="Inviter til chat" />;
  const slug = chatInviteSlug(chat.name);
  return (
    <Page title="Inviter til chat">
      <SearchField
        autoFocus={false}
        value={q}
        onChange={setQ}
        placeholder="Søk brukere …"
      />
      <Text variant="title" accessibilityRole="header">
        Del invitasjonslenke
      </Text>
      <View className="gap-0.5 rounded-md border border-line bg-surface p-3">
        <Text variant="label" weight="regular" tone="ember">
          thirdplace.app/join/{slug}
        </Text>
        <UIPressable
          accessibilityRole="button"
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          onPress={() => showToast(confirmToast.linkCopied)}
          className="self-start"
        >
          <Text variant="caption" weight="semibold" tone="ember">
            Kopier lenke
          </Text>
        </UIPressable>
      </View>
      <View className="items-center gap-2 rounded-md border border-line bg-surface p-4">
        <Icon name="qr-code-outline" size="3xl" tone="muted" />
        <Text variant="caption" tone="muted">
          QR-kode
        </Text>
      </View>
      <Text variant="title" accessibilityRole="header">
        Foreslåtte
      </Text>
      {people
        .filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase()))
        .slice(0, 4)
        .map((p) => (
          <View
            key={p.id}
            className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
          >
            <Image
              source={libThumb(p.avatar)}
              style={{ height: 36, width: 36, borderRadius: 18 }}
            />
            <Text variant="label" weight="semibold" className="flex-1">
              {p.name}
            </Text>
            <Button
              label={done.includes(p.id) ? "Invitert" : "Inviter"}
              variant={done.includes(p.id) ? "secondary" : "ink"}
              onPress={() => setDone((d) => [...d, p.id])}
            />
          </View>
        ))}
    </Page>
  );
}

function MemberRow({
  person,
  role,
}: {
  person: (typeof people)[number];
  role: string;
}) {
  return (
    <ListRow
      variant="card"
      title={person.name}
      subtitle={role}
      leading={
        <Avatar
          name={person.name}
          source={libImage(person.avatar)}
          size="sm"
          decorative
        />
      }
    />
  );
}
