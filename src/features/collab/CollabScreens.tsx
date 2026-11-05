import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { listingById, listings } from "@/fixtures";
import { colors } from "@/theme";

// Collaboration flow (DEMO), per the design (PDF p16–p18): Nytt samarbeid →
// Innkommende tilbud (Godta / Avslå / Mottilbud) → Samarbeid (parter,
// vilkår, tidslinje) → Kontrakt → Signer kontrakt. BLOCKED_CONTRACT_GAP: no
// offer, negotiation, contract, signature, revenue-split or payout model —
// every step says plainly that nothing was sent, agreed or signed.
const TYPES = ["Co-hosting", "Sponsing", "Brand"];
const HOSTING = ["Likeverdig 50/50", "Primær / sekundær"];
const SPLITS = ["50 / 50", "60 / 40", "70 / 30"];

export function NewCollabScreen() {
  const { listing: listingId } = useLocalSearchParams<{ listing?: string }>();
  const listing = listingById(listingId ?? "") ?? listings[0];
  const [type, setType] = useState("Co-hosting");
  const [hosting, setHosting] = useState(HOSTING[0] ?? "");
  const [split, setSplit] = useState("70 / 30");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Nytt samarbeid" />
      <ScrollView
        contentContainerClassName="gap-4 px-gutter py-4 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-sm text-muted">
          Foreslå et samarbeid basert på en listing.
        </Text>
        <Label>Knyttet listing</Label>
        <View className="gap-0.5 rounded-md border border-line bg-surface p-3">
          <Text className="text-sm font-semibold text-ink">
            {listing?.title}
          </Text>
          <Text className="text-xs text-muted">
            {listing?.owner} · {listing?.type}
          </Text>
        </View>
        <Label>Samarbeidstype</Label>
        <ChipRow options={TYPES} value={type} onChange={setType} />
        <Label>Hosting-type</Label>
        <ChipRow options={HOSTING} value={hosting} onChange={setHosting} />
        <Label>Inntektsdeling (du / partner)</Label>
        <ChipRow options={SPLITS} value={split} onChange={setSplit} />
        <Input
          label="Melding"
          placeholder="Fortell kort hva du foreslår …"
          value={msg}
          onChangeText={setMsg}
          multiline
          maxLength={400}
        />
        {sent ? (
          <DemoNote>
            Ingen forespørsel ble sendt, og ingen avtale er laget.
          </DemoNote>
        ) : null}
        <Button
          label="Send forespørsel →"
          variant="ink"
          disabled={msg.trim().length === 0}
          onPress={() => setSent(true)}
        />
        <Button
          label="Se et eksempel på samarbeid"
          variant="secondary"
          onPress={() => router.push("/collab" as Href)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const TIMELINE: { label: string; meta: string; done: boolean }[] = [
  { label: "Foreslått", meta: "12. juli", done: true },
  { label: "Godtatt", meta: "14. juli", done: true },
  { label: "Kontrakt signert", meta: "Venter", done: false },
  { label: "Opplevelse gjennomført", meta: "Planlagt 1. aug", done: false },
];

export function CollabDetailScreen() {
  const [panel, setPanel] = useState<"offer" | "contract" | null>(null);
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Jazz-samarbeid" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <DemoNote>Et eksempel på et samarbeid — ingen avtale finnes.</DemoNote>
        <Label>Parter</Label>
        <View className="flex-row gap-3">
          <Party name="Maria Movik" role="Skaper · Primærvert" />
          <Party name="Oslo Kaffebar" role="Venue · Co-vert" />
        </View>
        <View className="overflow-hidden rounded-md border border-line bg-surface">
          {[
            ["Type", "Co-hosting (primær/sekundær)"],
            ["Opplevelse", "Jazzkveld"],
            ["Startdato", "1. august"],
            ["Inntektsdeling", "70 % / 30 %"],
            ["Betaling", "Gratis mot eksponering"],
          ].map(([k, v]) => (
            <View
              key={k}
              className="flex-row justify-between border-b border-line px-3.5 py-3"
            >
              <Text className="text-sm text-muted">{k}</Text>
              <Text className="text-sm font-medium text-ink">{v}</Text>
            </View>
          ))}
        </View>
        <Label>Tidslinje</Label>
        {TIMELINE.map((t) => (
          <View key={t.label} className="flex-row items-center gap-3">
            <View
              className={`h-4 w-4 rounded-full ${t.done ? "bg-success" : "bg-line"}`}
            />
            <Text
              className={`flex-1 text-sm ${t.done ? "font-semibold text-ink" : "text-muted"}`}
            >
              {t.label}
            </Text>
            <Text className="text-xs text-muted">{t.meta}</Text>
          </View>
        ))}
        <View className="flex-row gap-3 pt-2">
          <View className="flex-1">
            <Button
              label="Innkommende tilbud"
              variant="secondary"
              onPress={() => setPanel("offer")}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Kontrakt"
              variant="ink"
              onPress={() => setPanel("contract")}
            />
          </View>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label="Betalingsstatus"
              variant="secondary"
              onPress={() => router.push("/collab/payment-status" as Href)}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Historikk"
              variant="secondary"
              onPress={() => router.push("/collab/history" as Href)}
            />
          </View>
        </View>
      </ScrollView>
      {panel === "offer" ? <OfferSheet onClose={() => setPanel(null)} /> : null}
      {panel === "contract" ? (
        <ContractSheet onClose={() => setPanel(null)} />
      ) : null}
    </SafeAreaView>
  );
}

// Innkommende tilbud + Mottilbud (p17).
function OfferSheet({ onClose }: { onClose: () => void }) {
  const [counter, setCounter] = useState(false);
  const [split, setSplit] = useState("50 / 50");
  const [done, setDone] = useState<string | null>(null);
  return (
    <Sheet
      visible
      onClose={onClose}
      title={counter ? "Mottilbud" : "Innkommende tilbud"}
    >
      <View className="gap-3">
        <View className="gap-0.5 rounded-md border border-line bg-surface p-3">
          <Text className="text-sm font-semibold text-ink">Maria Movik</Text>
          <Text className="text-xs text-muted">
            Co-hosting · Primær/sekundær · 70 % / 30 %
          </Text>
        </View>
        {counter ? (
          <>
            <Label>Din inntektsdeling</Label>
            <ChipRow options={SPLITS} value={split} onChange={setSplit} />
            <Button
              label="Send mottilbud →"
              variant="ink"
              onPress={() => setDone("Mottilbudet")}
            />
          </>
        ) : (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Avslå"
                variant="secondary"
                onPress={() => setDone("Avslaget")}
              />
            </View>
            <View className="flex-1">
              <Button
                label="Godta tilbud"
                variant="ink"
                onPress={() => setDone("Godkjenningen")}
              />
            </View>
          </View>
        )}
        {!counter ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setCounter(true)}
          >
            <Text className="text-center text-sm font-semibold text-ember">
              Send mottilbud
            </Text>
          </Pressable>
        ) : null}
        {done ? <DemoNote>{`${done} ble ikke sendt.`}</DemoNote> : null}
      </View>
    </Sheet>
  );
}

// Kontrakt + Signer kontrakt (p17–p18).
function ContractSheet({ onClose }: { onClose: () => void }) {
  const [signed, setSigned] = useState(false);
  return (
    <Sheet visible onClose={onClose} title="Kontrakt">
      <View className="gap-3">
        <View className="gap-2 rounded-md border border-line bg-surface p-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
            Samarbeidsavtale
          </Text>
          <Text className="text-sm text-ink">
            Mellom Maria Movik og Oslo Kaffebar
          </Text>
          {[
            "1. Samarbeidstype: Co-hosting (primær/sekundær)",
            "2. Opplevelse: Jazzkveld, 1. august",
            "3. Inntektsdeling: 70 % / 30 %",
            "4. Ansvar: lokale + utstyr / innhold og promotering",
            "5. Varighet: engangshendelse",
          ].map((c) => (
            <Text key={c} className="text-xs text-ink">
              {c}
            </Text>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSigned(true)}
          className="items-center rounded-md border-2 border-dashed border-line py-6"
        >
          <Text className="text-sm text-muted">
            {signed ? "✓ Signert (demo)" : "Trykk for å signere"}
          </Text>
        </Pressable>
        <DemoNote>
          Kontrakten er et eksempel — ingen signatur lagres, og ingen avtale er
          juridisk bindende.
        </DemoNote>
        <Button label="Lukk" variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}

function Party({ name, role }: { name: string; role: string }) {
  return (
    <View className="flex-1 gap-0.5 rounded-md border border-line bg-surface p-3">
      <Ionicons name="person-circle-outline" size={22} color={colors.ink} />
      <Text className="text-sm font-semibold text-ink">{name}</Text>
      <Text className="text-xs text-muted">{role}</Text>
    </View>
  );
}

function Label({ children }: { children: string }) {
  return <Text className="text-sm font-semibold text-ink">{children}</Text>;
}

function ChipRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((o) => (
        <Chip
          key={o}
          label={o}
          selected={value === o}
          onPress={() => onChange(o)}
        />
      ))}
    </View>
  );
}
