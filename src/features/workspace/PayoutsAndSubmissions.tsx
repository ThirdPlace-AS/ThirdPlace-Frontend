import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";
import { EmptyState } from "@/components/states/StateView";

// Utbetalinger (PDF p21) — STRUCTURE ONLY. Shows the payout method slot, the
// payout schedule and an empty history. It never asks for or shows bank or
// account numbers and moves no money (prohibited + BLOCKED_CONTRACT_GAP).
// Schedule names only — timing rules are not defined (no payout contract).
const PLANS = ["Automatisk", "Ukentlig", "Månedlig"];

export function PayoutsScreen() {
  const [plan, setPlan] = useState(PLANS[0] ?? "");
  const [tried, setTried] = useState(false);
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Utbetalinger" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <Text className="text-sm text-muted">
          Sett opp hvordan du mottar penger fra opplevelser.
        </Text>
        <Section>Utbetalingsmetode</Section>
        <Pressable
          accessibilityRole="button"
          onPress={() => setTried(true)}
          className="items-center rounded-lg border border-dashed border-line py-4"
        >
          <Text className="text-sm font-semibold text-ink">
            + Legg til bankkonto
          </Text>
        </Pressable>
        {tried ? (
          <DemoNote>
            Utbetalinger er ikke aktive — ingen kontoopplysninger tas imot.
          </DemoNote>
        ) : null}
        <Section>Utbetalingsplan</Section>
        {PLANS.map((p) => (
          <Pressable
            key={p}
            accessibilityRole="radio"
            accessibilityState={{ selected: plan === p }}
            onPress={() => setPlan(p)}
            className="flex-row items-center gap-3 rounded-md border border-line bg-surface px-4 py-3.5"
          >
            <View
              className={`h-5 w-5 rounded-full border-2 ${
                plan === p ? "border-ink bg-ink" : "border-line"
              }`}
            />
            <Text className="text-sm text-ink">{p}</Text>
          </Pressable>
        ))}
        <Section>Valuta</Section>
        <View className="rounded-md border border-line bg-surface px-4 py-3.5">
          <Text className="text-sm text-ink">NOK — Norske kroner</Text>
        </View>
        <Section>Utbetalingshistorikk</Section>
        <EmptyState
          icon="wallet-outline"
          title="Ingen utbetalinger ennå"
          message="Når du arrangerer betalte opplevelser, vises utbetalingene her."
        />
      </ScrollView>
    </SafeAreaView>
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
    meta: "Finnes allerede — se eksisterende sted",
  },
];
const TABS = ["Alle", "Ventende", "Godkjent", "Avvist"] as const;

export function SubmissionsScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Alle");
  const list = tab === "Alle" ? SUBS : SUBS.filter((s) => s.status === tab);
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Innleveringer" />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-12">
        <Text className="text-sm text-muted">
          Steder du har foreslått til ThirdPlace.
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {TABS.map((t) => (
            <Chip
              key={t}
              label={t}
              selected={tab === t}
              onPress={() => setTab(t)}
            />
          ))}
        </View>
        {list.map((s) => (
          <View
            key={s.name}
            className="gap-1 rounded-lg border border-line bg-surface p-4"
          >
            <Text className="text-base font-semibold text-ink">{s.name}</Text>
            <View
              className={`self-start rounded-full px-2.5 py-0.5 ${
                s.status === "Godkjent"
                  ? "bg-success/15"
                  : s.status === "Avvist"
                    ? "bg-surfaceMuted"
                    : "bg-warning/20"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  s.status === "Godkjent"
                    ? "text-success"
                    : s.status === "Avvist"
                      ? "text-danger"
                      : "text-ink"
                }`}
              >
                {s.status}
              </Text>
            </View>
            <Text className="text-xs text-muted">{s.meta}</Text>
          </View>
        ))}
        <Text className="text-xs text-muted">
          Avviste innleveringer kan sendes på nytt med oppdatert informasjon.
        </Text>
        <DemoNote>Eksempelinnleveringer — ingen steder er sendt inn.</DemoNote>
        <Button
          label="Send inn nytt sted"
          variant="ink"
          onPress={() => router.navigate("/add")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
      {children}
    </Text>
  );
}
