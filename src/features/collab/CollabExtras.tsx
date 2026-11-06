import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Icon, Screen, Text } from "@/components/ui";
import { RateSheet } from "@/components/actions/ActionSheets";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";

// Collaboration extras (DEMO), per the design (PDF p17–p18): Betalingsstatus,
// Samarbeidshistorikk, Vurder samarbeid and the Marketplace venteliste.
// STRUCTURE ONLY for money: no amounts, payouts or invoices are shown or
// moved; history and ratings are fixture examples (BLOCKED_CONTRACT_GAP).

const PAY_STEPS: { label: string; done: boolean }[] = [
  { label: "Avtale signert", done: true },
  { label: "Opplevelse gjennomført", done: false },
  { label: "Oppgjør klart", done: false },
  { label: "Utbetalt", done: false },
];

export function PaymentStatusScreen() {
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Betalingsstatus" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <Text variant="caption" tone="muted">
          Jazz-samarbeid · Oslo Kaffebar
        </Text>
        {PAY_STEPS.map((s) => (
          <View key={s.label} className="flex-row items-center gap-3">
            <View
              className={`h-5 w-5 items-center justify-center rounded-full ${
                s.done ? "bg-success" : "bg-line"
              }`}
            >
              {s.done ? <Icon name="checkmark" size="sm" tone="onInk" /> : null}
            </View>
            <Text
              variant="label"
              weight={s.done ? "semibold" : "regular"}
              tone={s.done ? "ink" : "muted"}
            >
              {s.label}
            </Text>
          </View>
        ))}
        <DemoNote>
          Oppsettet er et eksempel. Ingen beløp regnes ut eller betales ut.
        </DemoNote>
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
            {h.rated ? (
              <Text variant="caption" weight="semibold" tone="success">
                ✓ Vurdert
              </Text>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => setRate(h.partner)}
              >
                <Text variant="label" weight="semibold" tone="ember">
                  Vurder samarbeid →
                </Text>
              </Pressable>
            )}
          </View>
        ))}
        <DemoNote>
          Historikken er et eksempel. Ingen samarbeid er gjennomført.
        </DemoNote>
      </ScrollView>
      {rate ? (
        <RateSheet
          title={rate}
          heading="Vurder samarbeid"
          chips={TRAITS}
          chipsLabel="Hva fungerte?"
          onClose={() => setRate(null)}
        />
      ) : null}
    </Screen>
  );
}

const TRAITS = ["Kommunikasjon", "Pålitelighet", "Profesjonalitet", "Resultat"];
