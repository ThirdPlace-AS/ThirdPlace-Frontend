import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Badge, Screen, ScrollRow, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { RouteHeader } from "@/components/RouteHeader";
import { EmptyState } from "@/components/states/StateView";

// Utbetalinger (PDF p21) — STRUCTURE ONLY. Shows the payout method slot, the
// payout schedule and an empty history. It never asks for or shows bank or
// account numbers and moves no money (prohibited + BLOCKED_CONTRACT_GAP).
// p21's payout schedule (Automatisk / Ukentlig / Månedlig) is hidden: the
// payout contract defines no schedule and payout timing is a legal review
// item (founder 2026-11-07, Phase 15).
export function PayoutsScreen() {
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Utbetalinger" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <Text variant="caption" tone="muted">
          Sett opp hvordan du mottar penger fra opplevelser.
        </Text>

        <Section>Utbetalingsmetode</Section>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          disabled
          className="items-center rounded-lg border border-dashed border-line py-4 opacity-50"
        >
          <Text variant="label" weight="semibold">
            + Legg til bankkonto
          </Text>
        </Pressable>
        <Section>Valuta</Section>
        <View className="rounded-md border border-line bg-surface px-4 py-3.5">
          <Text variant="label" weight="regular">
            NOK · norske kroner
          </Text>
        </View>
        <Section>Utbetalingshistorikk</Section>
        <EmptyState
          icon="wallet-outline"
          title="Ingen utbetalinger ennå"
          message="Når du arrangerer betalte opplevelser, vises utbetalingene her."
        />
      </ScrollView>
    </Screen>
  );
}

// Innleveringer (PDF p12): places the user has submitted for review, with
// Alle / Ventende / Godkjent / Avvist. Examples only — no submission or
// moderation contract exists.
type Sub = {
  name: string;
  status: "Ventende" | "Godkjent" | "Avvist";
  meta: string;
};
const SUBS: Sub[] = [
  { name: "Skjult hage, Kampen", status: "Godkjent", meta: "Sendt 12. juli" },
  {
    name: "Utsiktspunkt, Ekeberg",
    status: "Ventende",
    meta: "Under gjennomgang",
  },
  {
    name: "Gatefotogalleri, Tøyen",
    status: "Avvist",
    meta: "Finnes allerede. Se stedet.",
  },
];
const TABS = ["Alle", "Ventende", "Godkjent", "Avvist"] as const;

export function SubmissionsScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Alle");
  const list = tab === "Alle" ? SUBS : SUBS.filter((s) => s.status === tab);
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Innleveringer" />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-12">
        <Text variant="caption" tone="muted">
          Steder du har foreslått til ThirdPlace.
        </Text>
        <ScrollRow radio>
          {TABS.map((t) => (
            <Chip
              key={t}
              role="radio"
              label={t}
              selected={tab === t}
              onPress={() => setTab(t)}
            />
          ))}
        </ScrollRow>
        {list.map((s) => (
          <View
            key={s.name}
            className="gap-1 rounded-lg border border-line bg-surface p-4"
          >
            <Text variant="body" weight="semibold">
              {s.name}
            </Text>
            <Badge
              kind="status"
              label={s.status}
              tone={
                s.status === "Godkjent"
                  ? "success"
                  : s.status === "Avvist"
                    ? "danger"
                    : "warning"
              }
            />
            <Text variant="caption" tone="muted">
              {s.meta}
            </Text>
          </View>
        ))}
        <Text variant="caption" tone="muted">
          Avviste innleveringer kan sendes på nytt med oppdatert informasjon.
        </Text>

        <Button
          label="Send inn nytt sted"
          variant="ink"
          onPress={() => router.navigate("/add")}
        />
      </ScrollView>
    </Screen>
  );
}

function Section({ children }: { children: string }) {
  return (
    <Text variant="title" accessibilityRole="header">
      {children}
    </Text>
  );
}
