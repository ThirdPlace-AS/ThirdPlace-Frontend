import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Icon, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { Sheet } from "@/components/Sheet";

// Shared action sheets (DEMO), per the design (PDF p23): Del, Rapporter,
// Blokkere, Forlate opplevelsen, Bli med på ventelisten. BLOCKED_CONTRACT_GAP:
// no share link, moderation, block, attendance or waitlist contract exists —
// every confirm says plainly that nothing happened. Mount each sheet only
// while open so its local state never leaks between uses.

type Base = { onClose: () => void };

// Del (p23): the item, then DM / Kopier / Mer.
export function ShareSheet({
  title,
  slug,
  onClose,
}: Base & { title: string; slug: string }) {
  const [done, setDone] = useState<string | null>(null);
  const actions: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: "DM", icon: "chatbubble-outline" },
    { label: "Kopier", icon: "copy-outline" },
    { label: "Mer", icon: "share-outline" },
  ];
  return (
    <Sheet visible onClose={onClose} title="Del">
      <View className="gap-4">
        <View className="gap-0.5 rounded-md border border-line bg-surface p-3">
          <Text variant="label" weight="semibold">
            {title}
          </Text>
          <Text variant="caption" tone="muted">
            thirdplace.app/{slug}
          </Text>
        </View>
        <View className="flex-row gap-6">
          {actions.map((a) => (
            <Pressable
              key={a.label}
              accessibilityRole="button"
              onPress={() => setDone(a.label)}
              className="items-center gap-1"
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-surfaceMuted">
                <Icon name={a.icon} size="md" tone="ink" />
              </View>
              <Text variant="caption">{a.label}</Text>
            </Pressable>
          ))}
        </View>
        {done ? (
          <DemoNote>Ingenting ble delt — lenken er et eksempel.</DemoNote>
        ) : null}
      </View>
    </Sheet>
  );
}

const REASONS = [
  "Upassende innhold",
  "Spam eller svindel",
  "Trakassering",
  "Falsk informasjon",
  "Annet",
];

// Rapporter (p23): anonymous reason picker.
export function ReportSheet({ onClose }: Base) {
  const [reason, setReason] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  return (
    <Sheet visible onClose={onClose} title="Rapporter">
      <View className="gap-3">
        <Text variant="caption" tone="muted">
          Hva er galt? Rapporten er anonym.
        </Text>
        {REASONS.map((r) => (
          <Pressable
            key={r}
            accessibilityRole="radio"
            accessibilityState={{ selected: reason === r }}
            onPress={() => setReason(r)}
            className="flex-row items-center justify-between rounded-md border border-line bg-surface px-4 py-3.5"
          >
            <Text variant="label">{r}</Text>
            <View
              className={`h-5 w-5 rounded-full border-2 ${
                reason === r ? "border-ink bg-ink" : "border-line"
              }`}
            />
          </Pressable>
        ))}
        {sent ? (
          <DemoNote>
            Rapporten ble ikke sendt — moderering er ikke aktiv.
          </DemoNote>
        ) : null}
        <Button
          label="Send rapport"
          variant="ink"
          disabled={!reason}
          onPress={() => setSent(true)}
        />
      </View>
    </Sheet>
  );
}

// Blokkere (p23).
export function BlockSheet({ name, onClose }: Base & { name: string }) {
  const [done, setDone] = useState(false);
  const first = name.split(" ")[0];
  return (
    <Sheet visible onClose={onClose} title={`Blokkere ${first}?`}>
      <View className="gap-3">
        <Text variant="caption" tone="muted">
          {first} kan ikke lenger se profilen din, sende meldinger eller finne
          deg i søk. Dere fjernes fra felles chatter.
        </Text>
        {done ? <DemoNote>Ingen blokkering er lagret.</DemoNote> : null}
        <Button
          label="Blokker"
          variant="secondary"
          onPress={() => setDone(true)}
        />
        <Button label="Avbryt" variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}

// Forlate opplevelsen (p23).
export function LeaveSheet({
  onClose,
  onConfirm,
}: Base & { onConfirm: () => void }) {
  return (
    <Sheet visible onClose={onClose} title="Forlate opplevelsen?">
      <View className="gap-3">
        <Text variant="caption" tone="muted">
          Plassen din tilbys først på ventelisten.
        </Text>
        <DemoNote>Ingen påmelding endres og ingen refusjon skjer.</DemoNote>
        <Button
          label="Forlat"
          variant="secondary"
          onPress={() => {
            onConfirm();
            onClose();
          }}
        />
        <Button label="Bli værende" variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}

// Bli med på ventelisten (p23).
export function WaitlistSheet({
  ahead,
  onClose,
  onConfirm,
}: Base & { ahead: number; onConfirm: () => void }) {
  return (
    <Sheet visible onClose={onClose} title="Bli med på ventelisten?">
      <View className="gap-3">
        <View className="flex-row items-center gap-3 rounded-md bg-surfaceMuted p-4">
          <Text variant="h1" accessibilityRole="text">
            #{ahead + 1}
          </Text>
          <View>
            <Text variant="label" weight="semibold">
              Din plass i køen
            </Text>
            <Text variant="caption" tone="muted">
              {ahead} personer foran deg
            </Text>
          </View>
        </View>
        <DemoNote>
          Køplassen er et eksempel — ingen venteliste er aktiv.
        </DemoNote>
        <Button
          label="Sett meg på ventelisten"
          variant="ink"
          onPress={() => {
            onConfirm();
            onClose();
          }}
        />
        <Button label="Avbryt" variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}

// Betal (PDF p23) — STRUCTURE ONLY. Shows the ticket line, but there is no
// processing step and no success screen: no card is used, nothing is
// charged, and "Bli med uten betaling" only flips the local demo state,
// saying so (master spec: no invented payment rules).
export function PaySheet({
  title,
  when,
  priceNok,
  onClose,
  onJoined,
}: Base & {
  title: string;
  when: string;
  priceNok: number;
  onJoined: () => void;
}) {
  return (
    <Sheet visible onClose={onClose} title="Bli med">
      <View className="gap-3">
        <View className="gap-0.5 rounded-md border border-line bg-surface p-3">
          <Text variant="label" weight="semibold">
            {title}
          </Text>
          <Text variant="caption" tone="muted">
            {when}
          </Text>
        </View>
        <View className="flex-row justify-between px-1">
          <Text variant="caption" tone="muted">
            Billett (eksempelpris)
          </Text>
          <Text variant="label" weight="semibold">
            {priceNok} kr
          </Text>
        </View>
        <DemoNote>
          Betaling er ikke aktiv — ingen kort brukes, ingenting belastes og
          ingen plass reserveres.
        </DemoNote>
        <Button
          label="Bli med uten betaling (demo)"
          variant="ink"
          onPress={() => {
            onJoined();
            onClose();
          }}
        />
        <Button label="Avbryt" variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}

// Avlyse opplevelsen (host, PDF p24–p25): reason + confirm. DEMO — no one is
// notified and no refund happens; the confirm only flips local state.
export function CancelSheet({
  title,
  going,
  onClose,
  onConfirm,
}: Base & { title: string; going: number; onConfirm: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <Sheet visible onClose={onClose} title={`Avlyse ${title}?`}>
      <View className="gap-3">
        <Text variant="caption" tone="muted">
          {going} er påmeldt. Du kan skrive en årsak (valgfritt).
        </Text>
        <Input
          label="Årsak (vises for deltakerne)"
          placeholder="F.eks. sykdom i bandet …"
          value={reason}
          onChangeText={setReason}
          multiline
          maxLength={200}
        />
        <DemoNote>
          Ingen blir varslet, og ingen refusjon skjer i demoen.
        </DemoNote>
        <Button
          label="Avlys"
          variant="secondary"
          onPress={() => {
            onConfirm();
            onClose();
          }}
        />
        <Button label="Behold opplevelsen" variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}

// "En plass åpnet seg!" (PDF p24): a waitlist offer with a response window.
export function SpotOfferSheet({ title, onClose }: Base & { title: string }) {
  const [choice, setChoice] = useState<string | null>(null);
  return (
    <Sheet visible onClose={onClose} title="En plass åpnet seg!">
      <View className="gap-3">
        <View className="gap-0.5 rounded-md border border-line bg-surface p-3">
          <Text variant="label" weight="semibold">
            {title}
          </Text>
        </View>
        <Text variant="caption" tone="muted">
          Vil du ta plassen?
        </Text>
        {choice ? (
          <DemoNote>{`«${choice}» gjør ingenting — ingen venteliste er aktiv.`}</DemoNote>
        ) : null}
        <Button
          label="Ta plassen"
          variant="ember"
          onPress={() => setChoice("Ta plassen")}
        />
        <Button
          label="Gi den videre"
          variant="secondary"
          onPress={() => setChoice("Gi den videre")}
        />
      </View>
    </Sheet>
  );
}

const PRAISE = ["Stemningen", "Verten", "Stedet", "Folkene"];

// "Hvordan var det?" (PDF p25): post-experience rating prompt.
export function RateSheet({
  title,
  onClose,
  heading = "Hvordan var det?",
  chips = PRAISE,
  chipsLabel = "Hva var bra?",
}: Base & {
  title: string;
  heading?: string;
  chips?: string[];
  chipsLabel?: string;
}) {
  const [stars, setStars] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  return (
    <Sheet visible onClose={onClose} title={heading}>
      <View className="gap-3">
        <Text variant="caption" tone="muted">
          {title}
        </Text>
        <View className="flex-row gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={`${n} av 5 stjerner`}
              onPress={() => setStars(n)}
            >
              <Icon
                name={n <= stars ? "star" : "star-outline"}
                size="xl"
                tone={n <= stars ? "ember" : "muted"}
              />
            </Pressable>
          ))}
        </View>
        <Text variant="label" weight="semibold">
          {chipsLabel}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {chips.map((p) => (
            <Chip
              key={p}
              label={p}
              selected={liked.includes(p)}
              onPress={() =>
                setLiked((s) =>
                  s.includes(p) ? s.filter((x) => x !== p) : [...s, p],
                )
              }
            />
          ))}
        </View>
        {sent ? <DemoNote>Vurderingen ble ikke lagret.</DemoNote> : null}
        <Button
          label="Send vurdering"
          variant="ink"
          disabled={stars === 0}
          onPress={() => setSent(true)}
        />
        <Button label="Hopp over" variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}

// "Del regningen" (PDF p25) — STRUCTURE ONLY: how a shared bill would split
// between participants. No amounts are collected or requested.
export function SplitBillSheet({
  title,
  names,
  onClose,
}: Base & { title: string; names: string[] }) {
  const [mode, setMode] = useState("Likt");
  const [reminded, setReminded] = useState(false);
  return (
    <Sheet visible onClose={onClose} title="Del regningen">
      <View className="gap-3">
        <Text variant="caption" tone="muted">
          {title}
        </Text>
        <View className="flex-row gap-2">
          {["Likt", "Egendefinert"].map((m) => (
            <Chip
              key={m}
              label={m}
              selected={mode === m}
              onPress={() => setMode(m)}
            />
          ))}
        </View>
        {names.map((n) => (
          <View
            key={n}
            className="flex-row items-center justify-between rounded-md border border-line bg-surface px-4 py-3"
          >
            <Text variant="label" weight="semibold">
              {n}
            </Text>
            <Text variant="caption" tone="muted">
              —
            </Text>
          </View>
        ))}
        <DemoNote>
          {reminded
            ? "Ingen påminnelse ble sendt."
            : "Regningsdeling er ikke aktiv — fordeling og beløp er ikke definert."}
        </DemoNote>
        <Button
          label="Send påminnelse"
          variant="ink"
          onPress={() => setReminded(true)}
        />
      </View>
    </Sheet>
  );
}
