import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import {
  ChipGroup,
  Icon,
  Screen,
  StickyFooter,
  Text,
  type IconName,
  Pressable as UIPressable,
} from "@/components/ui";
import { Button } from "@/components/Button";
import { haptics } from "@/lib/haptics";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { listingById, listings } from "@/fixtures";

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
  // Defaults agree with each other and with the design example (PDF p16:
  // primær/sekundær co-hosting, 70 / 30).
  const [hosting, setHosting] = useState(HOSTING[1] ?? "");
  const [split, setSplit] = useState("70 / 30");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Nytt samarbeid" />
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          contentContainerClassName="gap-4 px-gutter py-4 pb-12"
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="caption" tone="muted">
            Foreslå et samarbeid basert på en listing.
          </Text>
          <Label>Knyttet listing</Label>
          <View className="gap-0.5 rounded-md border border-line bg-surface p-3">
            <Text variant="label" weight="semibold">
              {listing?.title}
            </Text>
            <Text variant="caption" tone="muted">
              {listing?.owner} · {listing?.type}
            </Text>
          </View>
          <Label>Samarbeidstype</Label>
          <ChipRow options={TYPES} value={type} onChange={setType} />
          <Label>Hosting-type</Label>
          <ChipRow options={HOSTING} value={hosting} onChange={setHosting} />
          <Label>Inntektsdeling (du / partner)</Label>
          <ChipRow options={SPLITS} value={split} onChange={setSplit} />
          <DemoNote>
            Delingen er bare et valg i skjemaet. Ingenting regnes ut.
          </DemoNote>
          <Input
            label="Melding"
            placeholder="Fortell kort hva du foreslår …"
            value={msg}
            onChangeText={setMsg}
            multiline
            maxLength={400}
          />
          <Button
            label="Se et eksempel på samarbeid"
            variant="secondary"
            onPress={() => router.push("/collab" as Href)}
          />
        </ScrollView>
        <StickyFooter safeBottom>
          {sent ? (
            <DemoNote>
              Forespørselen ble ikke sendt, og det finnes ingen avtale.
            </DemoNote>
          ) : null}
          <Button
            label="Send forespørsel →"
            variant="ink"
            disabled={msg.trim().length === 0}
            onPress={() => setSent(true)}
          />
          {msg.trim().length === 0 ? (
            <Text variant="caption" tone="muted" className="text-center">
              Skriv en melding først.
            </Text>
          ) : null}
        </StickyFooter>
      </KeyboardAvoidingView>
    </Screen>
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
    <Screen edges={["top"]}>
      <RouteHeader title="Jazz-samarbeid" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <DemoNote>Dette er et eksempel. Det finnes ingen avtale.</DemoNote>
        <Label>Parter</Label>
        <View className="flex-row gap-3">
          <Party name="Maria Movik" role="Skaper · Primærvert" />
          <Party
            name="Oslo Kaffebar"
            role="Venue · Co-vert"
            icon="tp-business"
          />
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
              <Text variant="caption" tone="muted">
                {k}
              </Text>
              <Text variant="label">{v}</Text>
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
              variant="label"
              weight={t.done ? "semibold" : "regular"}
              tone={t.done ? "ink" : "muted"}
              className="flex-1"
            >
              {t.label}
            </Text>
            <Text variant="caption" tone="muted">
              {t.meta}
            </Text>
          </View>
        ))}
        {/* Primary action full width; "Innkommende tilbud" gets its own row
            (it wrapped to two left-aligned lines in a half-width cell). */}
        <View className="gap-3 pt-2">
          <Button
            label="Kontrakt"
            variant="ink"
            onPress={() => setPanel("contract")}
          />
          <Button
            label="Innkommende tilbud"
            variant="secondary"
            onPress={() => setPanel("offer")}
          />
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
    </Screen>
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
          <Text variant="label" weight="semibold">
            Maria Movik
          </Text>
          <Text variant="caption" tone="muted">
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
            <Text
              variant="label"
              weight="semibold"
              tone="ember"
              className="text-center"
            >
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
          <Text variant="micro" weight="semibold" tone="muted">
            Samarbeidsavtale
          </Text>
          <Text variant="label" weight="regular">
            Mellom Maria Movik og Oslo Kaffebar
          </Text>
          {[
            "1. Samarbeidstype: Co-hosting (primær/sekundær)",
            "2. Opplevelse: Jazzkveld, 1. august",
            "3. Inntektsdeling: 70 % / 30 %",
            "4. Ansvar: lokale + utstyr / innhold og promotering",
            "5. Varighet: engangshendelse",
          ].map((c) => (
            <Text key={c} variant="caption">
              {c}
            </Text>
          ))}
        </View>
        <UIPressable
          accessibilityRole="button"
          onPress={() => {
            if (!signed) haptics.light();
            setSigned(true);
          }}
          contentClassName="items-center rounded-md border-2 border-dashed border-line py-6"
          pressedScale={0.99}
        >
          <Text variant="caption" tone="muted">
            {signed ? "✓ Signert (demo)" : "Trykk for å signere"}
          </Text>
        </UIPressable>
        <DemoNote>
          Kontrakten er et eksempel. Ingen signatur lagres, og ingenting er
          bindende.
        </DemoNote>
        <Button label="Lukk" variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}

function Party({
  name,
  role,
  icon = "person-circle-outline",
}: {
  name: string;
  role: string;
  icon?: IconName;
}) {
  return (
    <View className="flex-1 gap-0.5 rounded-md border border-line bg-surface p-3">
      <Icon name={icon} size="lg" tone="ink" />
      <Text variant="label" weight="semibold">
        {name}
      </Text>
      <Text variant="caption" tone="muted">
        {role}
      </Text>
    </View>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text variant="label" weight="semibold">
      {children}
    </Text>
  );
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
  return <ChipGroup options={options} value={value} onChange={onChange} />;
}
