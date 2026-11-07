import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { router, type Href } from "expo-router";
import { Icon, Screen, Text, Pressable as UIPressable } from "@/components/ui";
import { RateSheet } from "@/components/actions/ActionSheets";
import { RouteHeader } from "@/components/RouteHeader";

// Collaboration extras, per the design (PDF p17–p18): Betalingsstatus,
// Samarbeidshistorikk, Vurder samarbeid and the Marketplace venteliste.
// STRUCTURE ONLY for money: no amounts, payouts or invoices are shown or
// moved; history and ratings are fixture examples (BLOCKED_CONTRACT_GAP).

const PAY_STEPS: { label: string; done: boolean }[] = [
  // Same collab and state as the Jazz-samarbeid timeline (PDF p16/p18):
  // the contract still waits for your signature.
  { label: "Kontrakt signert", done: false },
  { label: "Opplevelse gjennomført", done: false },
  { label: "Oppgjør klart", done: false },
  { label: "Utbetalt", done: false },
];

// Rows of the PDF's Transaksjon block. Values stay "—": money is structure
// only (no amounts, fees or payout timing are shown as real).
const TRANSACTION_ROWS = [
  "Bruttobeløp",
  "Plattformavgift",
  "Netto til deg",
  "Netto til partner",
];

// Betalingsstatus (PDF p18): status card, the steps as a timeline,
// Transaksjon, Utbetaling and Knyttet til, in the PDF's order.
export function PaymentStatusScreen() {
  const next = PAY_STEPS.find((s) => !s.done);
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Betalingsstatus" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        <Text variant="caption" tone="muted">
          Jazz-samarbeid · Oslo Kaffebar
        </Text>

        <View className="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-4">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-surfaceMuted">
            <Icon name="hourglass-outline" size="md" tone="ink" />
          </View>
          <View className="flex-1">
            <Text variant="body" weight="semibold">
              Venter på kontrakt
            </Text>
            <Text variant="caption" tone="muted">
              {next ? `Neste steg: ${next.label.toLowerCase()}` : "Fullført"}
            </Text>
          </View>
        </View>

        <View>
          <Text variant="title" accessibilityRole="header" className="pb-2">
            Tidslinje
          </Text>
          {PAY_STEPS.map((s, i) => (
            <View key={s.label} className="flex-row gap-3">
              <View className="items-center">
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full ${
                    s.done ? "bg-success" : "border-2 border-line bg-surface"
                  }`}
                >
                  {s.done ? (
                    <Icon name="checkmark" size="sm" tone="onInk" />
                  ) : null}
                </View>
                {i < PAY_STEPS.length - 1 ? (
                  <View className="w-0.5 flex-1 bg-line" />
                ) : null}
              </View>
              <Text
                variant="label"
                weight={s.done ? "semibold" : "regular"}
                tone={s.done ? "ink" : "muted"}
                className="pb-4"
              >
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        <View className="gap-2">
          <Text variant="title" accessibilityRole="header">
            Transaksjon
          </Text>
          <View className="overflow-hidden rounded-lg border border-line bg-surface">
            {TRANSACTION_ROWS.map((label, i) => (
              <View
                key={label}
                className={`flex-row items-center justify-between px-4 py-3 ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <Text variant="label" weight="regular">
                  {label}
                </Text>
                <Text variant="label" tone="muted">
                  —
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text variant="title" accessibilityRole="header">
            Utbetaling
          </Text>
          <View className="gap-0.5 rounded-lg border border-line bg-surface p-4">
            <Text variant="label" weight="semibold">
              Ikke planlagt ennå
            </Text>
            <Text variant="caption" tone="muted">
              Til bankkonto
            </Text>
          </View>
        </View>

        <View className="gap-2">
          <Text variant="title" accessibilityRole="header">
            Knyttet til
          </Text>
          <UIPressable
            accessibilityRole="button"
            onPress={() => router.push("/collab" as Href)}
            contentClassName="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-4"
            pressedScale={0.99}
          >
            <Icon name="musical-notes-outline" size="md" tone="ink" />
            <View className="flex-1">
              <Text variant="label" weight="semibold">
                Jazz-samarbeid
              </Text>
              <Text variant="caption" tone="muted">
                Oslo Kaffebar · Se samarbeidet
              </Text>
            </View>
            <Icon name="chevron-forward" size="md" tone="muted" />
          </UIPressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const HISTORY = [
  { title: "Jazzkveld", partner: "Oslo Kaffebar", when: "Juni", rated: false },
  {
    title: "Latte art-kurs",
    partner: "Grünerløkka Bokcafé",
    when: "Mai",
    rated: true,
  },
];

export function CollabHistoryScreen() {
  const [rate, setRate] = useState<string | null>(null);
  // Rated in this session (local only; the page note says it is an example).
  const [ratedHere, setRatedHere] = useState<ReadonlySet<string>>(new Set());
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Samarbeidshistorikk" />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-12">
        {HISTORY.map((h) => (
          <View
            key={h.title}
            className="gap-1 rounded-lg border border-line bg-surface p-4"
          >
            <Text variant="body" weight="semibold">
              {h.title}
            </Text>
            <Text variant="caption" tone="muted">
              {h.partner} · {h.when}
            </Text>
            {h.rated || ratedHere.has(h.partner) ? (
              <Text variant="caption" weight="semibold" tone="success">
                ✓ Vurdert
              </Text>
            ) : (
              <Pressable
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                accessibilityRole="button"
                onPress={() => setRate(h.partner)}
              >
                <Text variant="label" weight="semibold" tone="ember">
                  Vurder samarbeid
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
      {rate ? (
        <RateSheet
          title={rate}
          heading="Vurder samarbeid"
          chips={TRAITS}
          chipsLabel="Hva fungerte?"
          onClose={() => setRate(null)}
          onSent={() => setRatedHere((s) => new Set(s).add(rate))}
        />
      ) : null}
    </Screen>
  );
}

const TRAITS = ["Kommunikasjon", "Pålitelighet", "Profesjonalitet", "Resultat"];
