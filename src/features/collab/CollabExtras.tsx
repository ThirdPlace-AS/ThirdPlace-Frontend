import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { router, type Href } from "expo-router";
import {
  Badge,
  ChipGroup,
  Icon,
  Screen,
  Text,
  Pressable as UIPressable,
} from "@/components/ui";
import { collabHistory } from "@/fixtures";
import { collabMonth } from "@/features/marketplace/marketplaceStats";
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

// Samarbeidshistorikk (PDF p18): "N fullførte · M avsluttede" from the list,
// Alle / Fullførte / Avsluttede, each collaboration with partner, month and
// status, and "Vurder samarbeid" on a finished one you have not rated. The
// PDF's amounts are left out (money is structure only).
const HISTORY_TABS = ["Alle", "Fullførte", "Avsluttede"] as const;

export function CollabHistoryScreen() {
  const [tab, setTab] = useState<(typeof HISTORY_TABS)[number]>("Alle");
  const [rate, setRate] = useState<string | null>(null);
  // Rated in this session (local only).
  const [ratedHere, setRatedHere] = useState<ReadonlySet<string>>(new Set());
  const done = collabHistory.filter((c) => c.status === "Fullført").length;
  const ended = collabHistory.length - done;
  const rows = collabHistory.filter((c) =>
    tab === "Alle"
      ? true
      : tab === "Fullførte"
        ? c.status === "Fullført"
        : c.status === "Avsluttet",
  );
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Samarbeidshistorikk" />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-12">
        <Text variant="caption" tone="muted">
          {done} fullførte · {ended} avsluttede
        </Text>
        <ChipGroup
          label="Vis"
          options={HISTORY_TABS}
          value={tab}
          onChange={(t) => setTab(t as (typeof HISTORY_TABS)[number])}
        />
        {rows.map((c) => {
          const rated = !!c.rating || ratedHere.has(c.id);
          return (
            <View
              key={c.id}
              className="gap-1.5 rounded-lg border border-line bg-surface p-4"
            >
              <View className="flex-row items-start justify-between gap-3">
                <Text variant="body" weight="semibold" className="flex-1">
                  {c.title}
                </Text>
                <Badge
                  kind="status"
                  tone={c.status === "Fullført" ? "success" : "danger"}
                  label={c.status}
                />
              </View>
              <Text variant="caption" tone="muted">
                med {c.partner} · {collabMonth(c.daysAgo)}
              </Text>
              {c.status !== "Fullført" ? null : rated ? (
                <Text variant="caption" weight="semibold" tone="success">
                  Vurdert
                </Text>
              ) : (
                <Pressable
                  hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                  accessibilityRole="button"
                  onPress={() => setRate(c.id)}
                  className="self-start"
                >
                  <Text variant="label" weight="semibold" tone="ember">
                    Vurder samarbeid
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
      {rate ? (
        <RateSheet
          title={collabHistory.find((c) => c.id === rate)?.partner ?? ""}
          heading="Vurder samarbeid"
          chips={TRAITS}
          chipsLabel="Hva fungerte?"
          onClose={() => setRate(null)}
          onSent={() => setRatedHere((r) => new Set(r).add(rate))}
        />
      ) : null}
    </Screen>
  );
}

const TRAITS = ["Kommunikasjon", "Pålitelighet", "Profesjonalitet", "Resultat"];
