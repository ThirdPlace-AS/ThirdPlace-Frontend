import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { Sheet } from "@/components/Sheet";
import { colors } from "@/theme";

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
        <View className="gap-0.5 rounded-xl border border-line bg-surface p-3">
          <Text className="text-sm font-semibold text-ink">{title}</Text>
          <Text className="text-xs text-muted">thirdplace.app/{slug}</Text>
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
                <Ionicons name={a.icon} size={20} color={colors.ink} />
              </View>
              <Text className="text-xs text-ink">{a.label}</Text>
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
        <Text className="text-sm text-muted">
          Hva er galt? Rapporten er anonym.
        </Text>
        {REASONS.map((r) => (
          <Pressable
            key={r}
            accessibilityRole="radio"
            accessibilityState={{ selected: reason === r }}
            onPress={() => setReason(r)}
            className="flex-row items-center justify-between rounded-xl border border-line bg-surface px-4 py-3.5"
          >
            <Text className="text-sm font-medium text-ink">{r}</Text>
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
        <Text className="text-sm text-muted">
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
        <Text className="text-sm text-muted">
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
        <View className="flex-row items-center gap-3 rounded-xl bg-surfaceMuted p-4">
          <Text className="text-2xl font-bold text-ink">#{ahead + 1}</Text>
          <View>
            <Text className="text-sm font-semibold text-ink">
              Din plass i køen
            </Text>
            <Text className="text-xs text-muted">
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

// Betal → Fullfører betaling … → Du er med! (PDF p23–p24). STRUCTURE ONLY:
// no card or bank field is shown or collected and no payment is made — the
// steps only show what the flow looks like, and the final state says so.
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
  const [phase, setPhase] = useState<"summary" | "processing" | "done">(
    "summary",
  );
  useEffect(() => {
    if (phase !== "processing") return;
    const t = setTimeout(() => setPhase("done"), 1200);
    return () => clearTimeout(t);
  }, [phase]);
  return (
    <Sheet
      visible
      onClose={onClose}
      title={
        phase === "summary"
          ? "Bli med"
          : phase === "processing"
            ? "Fullfører betaling …"
            : "Du er med! 🎉"
      }
    >
      <View className="gap-3">
        <View className="gap-0.5 rounded-xl border border-line bg-surface p-3">
          <Text className="text-sm font-semibold text-ink">{title}</Text>
          <Text className="text-xs text-muted">{when}</Text>
        </View>
        {phase === "summary" ? (
          <>
            <View className="flex-row justify-between px-1">
              <Text className="text-sm text-muted">Billett</Text>
              <Text className="text-sm font-semibold text-ink">
                {priceNok} kr
              </Text>
            </View>
            <DemoNote>
              Betaling er ikke aktiv — ingen kort brukes og ingenting belastes.
            </DemoNote>
            <Button
              label={`Betal ${priceNok} kr og bli med`}
              variant="ink"
              onPress={() => setPhase("processing")}
            />
            <Button label="Avbryt" variant="secondary" onPress={onClose} />
          </>
        ) : phase === "processing" ? (
          <Text className="py-4 text-center text-sm text-muted">
            Venter på bekreftelse …
          </Text>
        ) : (
          <>
            <DemoNote>
              Ingen betaling ble gjennomført og ingen plass er reservert.
            </DemoNote>
            <Button
              label="Ferdig"
              variant="ink"
              onPress={() => {
                onJoined();
                onClose();
              }}
            />
          </>
        )}
      </View>
    </Sheet>
  );
}
