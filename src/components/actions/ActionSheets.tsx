import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Share, View } from "react-native";
import { Icon, Text, Pressable as UIPressable } from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Input } from "@/components/Input";
import { Sheet } from "@/components/Sheet";
import { showToastAfterSheet } from "@/components/Toast";
import { blockedToast, confirmToast } from "@/copy";
import { blockPerson } from "@/lib/blocked";

// Shared action sheets, per the design (PDF p23): Del, Rapporter, Blokkere,
// Forlate opplevelsen, Bli med på ventelisten. BLOCKED_CONTRACT_GAP: no share
// link, moderation, block, attendance or waitlist contract exists; each
// confirm closes the sheet with a product confirmation (founder decision
// 2026-11-06). Mount each sheet only while open so its local state never
// leaks between uses.

type Base = { onClose: () => void };

// Del (p23): the item, then DM / Kopier / Mer.
export function ShareSheet({
  title,
  slug,
  onClose,
}: Base & { title: string; slug: string }) {
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
            <UIPressable
              key={a.label}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                if (a.label === "Mer") {
                  // The system share sheet, with the item link.
                  setTimeout(
                    () =>
                      void Share.share({ message: `thirdplace.app/${slug}` }),
                    240,
                  );
                  return;
                }
                showToastAfterSheet(
                  a.label === "Kopier"
                    ? confirmToast.linkCopied
                    : confirmToast.sharedInMessage,
                );
              }}
              contentClassName="items-center gap-1"
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-surfaceMuted">
                <Icon name={a.icon} size="md" tone="ink" />
              </View>
              <Text variant="caption">{a.label}</Text>
            </UIPressable>
          ))}
        </View>
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
  return (
    <Sheet visible onClose={onClose} title="Rapporter">
      <View className="gap-3">
        <Text variant="caption" tone="muted">
          Hva er galt? Rapporten er anonym.
        </Text>
        {REASONS.map((r) => (
          <UIPressable
            key={r}
            accessibilityRole="radio"
            accessibilityState={{ selected: reason === r }}
            onPress={() => setReason(r)}
            contentClassName="flex-row items-center justify-between rounded-md border border-line bg-surface px-4 py-3.5"
            pressedScale={0.99}
          >
            <Text variant="label">{r}</Text>
            <View
              className={`h-5 w-5 rounded-full border-2 ${
                reason === r ? "border-ink bg-ink" : "border-line"
              }`}
            />
          </UIPressable>
        ))}

        <Button
          label="Send rapport"
          variant="ink"
          disabled={!reason}
          onPress={() => {
            onClose();
            showToastAfterSheet(confirmToast.reportSent);
          }}
        />
      </View>
    </Sheet>
  );
}

// Blokkere (p23).
export function BlockSheet({
  name,
  personId,
  onClose,
}: Base & {
  name: string;
  /** Adds the person to Blokkerte brukere (src/lib/blocked.ts). */
  personId?: string;
}) {
  const first = name.split(" ")[0];
  return (
    <Sheet visible onClose={onClose} title={`Blokkere ${first}?`}>
      <View className="gap-3">
        <Text variant="caption" tone="muted">
          {first} kan ikke lenger se profilen din, sende meldinger eller finne
          deg i søk. Dere fjernes fra felles chatter.
        </Text>

        <Button
          label="Blokker"
          variant="secondary"
          onPress={() => {
            if (personId) blockPerson(personId, name);
            onClose();
            showToastAfterSheet(blockedToast(first ?? name));
          }}
        />
        <Button label="Avbryt" variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}

// Forlate opplevelsen (p23).
export function LeaveSheet({
  title = "Forlate opplevelsen?",
  onClose,
  onConfirm,
}: Base & { title?: string; onConfirm: () => void }) {
  return (
    <Sheet visible onClose={onClose} title={title}>
      <View className="gap-3">
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

// Betal (PDF p23): STRUCTURE ONLY. Shows the ticket line, but there is no
// processing step and no success screen: no card is used and nothing is
// charged. "Reserver plass" joins locally (master spec: no invented payment
// rules).
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
            Billett
          </Text>
          <Text variant="label" weight="semibold">
            {priceNok} kr
          </Text>
        </View>

        <Button
          label="Reserver plass"
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

// Avlyse opplevelsen (host, PDF p24–p25): reason + confirm.
// BLOCKED_CONTRACT_GAP: no one is notified and no refund happens; the
// confirm flips local state.
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

        <Button
          label="Ta plassen"
          variant="ember"
          onPress={() => {
            onClose();
            showToastAfterSheet(confirmToast.spotTaken);
          }}
        />
        <Button
          label="Gi den videre"
          variant="secondary"
          onPress={() => {
            onClose();
            showToastAfterSheet(confirmToast.spotPassed);
          }}
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
  onSent,
}: Base & {
  title: string;
  heading?: string;
  chips?: string[];
  chipsLabel?: string;
  /** Lets the caller mark the item as rated locally. */
  onSent?: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
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
        <Button
          label="Send vurdering"
          variant="ink"
          disabled={stars === 0}
          onPress={() => {
            onSent?.();
            onClose();
            showToastAfterSheet(confirmToast.ratingSent);
          }}
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

        <Button
          label="Send påminnelse"
          variant="ink"
          onPress={() => {
            onClose();
            showToastAfterSheet(confirmToast.reminderSent);
          }}
        />
      </View>
    </Sheet>
  );
}
