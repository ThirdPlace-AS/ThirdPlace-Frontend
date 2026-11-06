import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Avatar,
  Icon,
  IconButton,
  ListRow,
  Overlay,
  Text,
} from "@/components/ui";
import { ReportSheet } from "@/components/actions/ActionSheets";
import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { SearchField } from "@/components/pickers/Pickers";
import { Sheet } from "@/components/Sheet";
import {
  CHAT_ACCESS_LABEL,
  CHAT_TYPE_LABEL,
  experienceById,
  experiences,
  people,
  type MockChat,
} from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { media } from "@/theme";

// Chat info, Medlemmer and Inviter til chat (DEMO), per the design (PDF
// p9–p10). BLOCKED_CONTRACT_GAP: no membership, role, invite-link, mute,
// leave or report contract exists — members are fixture people with display
// roles, and every action says it does nothing.
const ROLES = ["Vert · Admin", "Deltar", "Venn", "Kun i chatten"];
const membersOf = (chat: MockChat) =>
  people
    .slice(0, Math.min(people.length, Math.max(2, chat.members ?? 2)))
    .map((p, i) => ({
      person: p,
      role: ROLES[Math.min(i, ROLES.length - 1)] ?? "Kun i chatten",
    }));

type Panel = "info" | "members" | "invite" | null;

// Sample photos standing in for images shared in the chat (bundled art).
const SHARED = experiences.flatMap((e) => e.photos).slice(0, 4);

export function ChatInfoSheets({
  chat,
  panel,
  onPanel,
}: {
  chat: MockChat;
  panel: Panel;
  onPanel: (p: Panel) => void;
}) {
  const close = () => onPanel(null);
  // Close the info sheet first, then open the next once its Modal has
  // dismissed (iOS refuses to present while another is dismissing).
  const swap = (p: Panel) => {
    onPanel(null);
    setTimeout(() => onPanel(p), 350);
  };
  return (
    <>
      <InfoSheet
        chat={chat}
        visible={panel === "info"}
        onClose={close}
        onMembers={() => swap("members")}
        onInvite={() => swap("invite")}
      />
      <MembersSheet chat={chat} visible={panel === "members"} onClose={close} />
      <InviteSheet chat={chat} visible={panel === "invite"} onClose={close} />
    </>
  );
}

function InfoSheet({
  chat,
  visible,
  onClose,
  onMembers,
  onInvite,
}: {
  chat: MockChat;
  visible: boolean;
  onClose: () => void;
  onMembers: () => void;
  onInvite: () => void;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const [report, setReport] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const exp = chat.pinnedExperienceId
    ? experienceById(chat.pinnedExperienceId)
    : undefined;
  const members = membersOf(chat);
  return (
    <Sheet visible={visible} onClose={onClose} title={chat.name}>
      <View className="gap-4">
        <Text variant="caption" tone="muted">
          {CHAT_TYPE_LABEL[chat.type]} · {CHAT_ACCESS_LABEL[chat.access]}
          {chat.type === "experience" ? " · arkiveres etter kvelden" : ""}
        </Text>
        {exp ? (
          <View className="gap-0.5 rounded-md bg-surfaceMuted p-3">
            <Text variant="caption" weight="semibold" tone="muted">
              Tilknyttet opplevelse
            </Text>
            <Text variant="label" weight="semibold">
              {exp.title} · {exp.when}
            </Text>
          </View>
        ) : null}
        <View className="flex-row items-center justify-between">
          <Text variant="label" weight="semibold">
            Medlemmer
          </Text>
          <Pressable accessibilityRole="button" onPress={onMembers} hitSlop={8}>
            <Text variant="label" weight="semibold" tone="ember">
              Se alle ({chat.members ?? members.length}) →
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
                source={src}
                contentFit="cover"
                style={{ aspectRatio: 1, width: "100%", borderRadius: 10 }}
              />
            </Pressable>
          ))}
        </View>
        <View className="flex-row gap-2">
          {[
            { icon: "notifications-off-outline" as const, label: "Demp" },
            { icon: "person-add-outline" as const, label: "Inviter" },
            { icon: "exit-outline" as const, label: "Forlat" },
            { icon: "flag-outline" as const, label: "Rapporter" },
          ].map((a) => (
            <Pressable
              key={a.label}
              accessibilityRole="button"
              onPress={() =>
                a.label === "Inviter"
                  ? onInvite()
                  : a.label === "Rapporter"
                    ? setReport(true)
                    : setNotice(a.label)
              }
              className="flex-1 items-center gap-1 rounded-md border border-line bg-surface py-3 active:opacity-80"
            >
              <Icon name={a.icon} size="md" tone="ink" />
              <Text variant="caption" weight="medium">
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {notice ? (
          <DemoNote>{`«${notice}» gjør ingenting i demoen.`}</DemoNote>
        ) : null}
        {report ? <ReportSheet onClose={() => setReport(false)} /> : null}
        {viewer !== null ? (
          <ImageViewer
            index={viewer}
            onIndex={setViewer}
            onClose={() => setViewer(null)}
          />
        ) : null}
      </View>
    </Sheet>
  );
}

function MembersSheet({
  chat,
  visible,
  onClose,
}: {
  chat: MockChat;
  visible: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const all = membersOf(chat);
  const list = all.filter((m) =>
    m.person.name.toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <Sheet visible={visible} onClose={onClose} title="Medlemmer">
      <View className="gap-3">
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
        <DemoNote>Medlemmer og roller er eksempler.</DemoNote>
      </View>
    </Sheet>
  );
}

function InviteSheet({
  chat,
  visible,
  onClose,
}: {
  chat: MockChat;
  visible: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [done, setDone] = useState<string[]>([]);
  const slug = chat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <Sheet visible={visible} onClose={onClose} title="Inviter til chat">
      <View className="gap-3">
        <SearchField
          autoFocus={false}
          value={q}
          onChange={setQ}
          placeholder="Søk brukere …"
        />
        <Text variant="micro" weight="semibold" tone="muted">
          Del invitasjonslenke
        </Text>
        <View className="gap-0.5 rounded-md border border-line bg-surface p-3">
          <Text variant="label" weight="regular" tone="ember">
            thirdplace.app/join/{slug}
          </Text>
          <Text variant="caption" weight="semibold" tone="ember">
            Kopier lenke
          </Text>
        </View>
        <View className="items-center gap-2 rounded-md border border-line bg-surface p-4">
          <Icon name="qr-code-outline" size="3xl" tone="muted" />
          <Text variant="caption" tone="muted">
            QR-kode
          </Text>
        </View>
        <Text variant="micro" weight="semibold" tone="muted">
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
                source={libImage(p.avatar)}
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
        <DemoNote>
          Lenken og QR-koden er eksempler — ingen invitasjon sendes.
        </DemoNote>
      </View>
    </Sheet>
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

// Bildeviser (PDF p24): full-screen photo with ‹ › and "N / M". Swipe-free,
// button-driven. Bundled sample art — no media contract.
function ImageViewer({
  index,
  onIndex,
  onClose,
}: {
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const n = SHARED.length;
  return (
    <Overlay
      visible
      onClose={onClose}
      enter="fade"
      statusBarTranslucent
      style={{ backgroundColor: media.black }}
      accessibilityLabel={`Bilde ${index + 1} av ${n}`}
    >
      <View className="flex-1 justify-center">
        <Image
          source={SHARED[index]}
          contentFit="contain"
          style={{ width: "100%", height: "70%" }}
        />
        <View
          className="absolute inset-x-0 flex-row items-center justify-between px-gutter"
          style={{ top: insets.top + 8 }}
        >
          <IconButton
            icon="close"
            label="Lukk"
            variant="mediaSubtle"
            onPress={onClose}
          />
          <Text variant="label" weight="semibold" tone="onMedia">
            {`${index + 1} / ${n}`}
          </Text>
          <View className="w-10" />
        </View>
        <View
          className="absolute inset-x-0 flex-row justify-center gap-10"
          style={{ bottom: insets.bottom + 48 }}
        >
          <IconButton
            icon="chevron-back"
            label="Forrige bilde"
            variant="mediaSubtle"
            size="lg"
            disabled={index === 0}
            onPress={() => onIndex(index - 1)}
          />
          <IconButton
            icon="chevron-forward"
            label="Neste bilde"
            variant="mediaSubtle"
            size="lg"
            disabled={index === n - 1}
            onPress={() => onIndex(index + 1)}
          />
        </View>
      </View>
    </Overlay>
  );
}
