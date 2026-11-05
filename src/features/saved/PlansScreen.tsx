import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  RateSheet,
  SplitBillSheet,
  SpotOfferSheet,
} from "@/components/actions/ActionSheets";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";
import { EmptyState } from "@/components/states/StateView";
import {
  experienceById,
  people,
  profile,
  type MockPlanState,
} from "@/fixtures";

const TABS: { key: MockPlanState; label: string }[] = [
  { key: "upcoming", label: "Kommende" },
  { key: "waitlisted", label: "Venteliste" },
  { key: "past", label: "Tidligere" },
  { key: "cancelled", label: "Avlyst" },
];

// Mine planer (DEMO) — REQUIRED_V1 (master spec §11, REG §4): upcoming, past,
// cancelled and waitlisted plans. No PDF page of its own; it follows the
// Lagret layout (p14). BLOCKED_CONTRACT_GAP: there is no attendance or join
// lifecycle — the plans are fixture examples.
export default function PlansScreen() {
  const [tab, setTab] = useState<MockPlanState>("upcoming");
  const rows = profile.plans.filter((p) => p.state === tab);
  // Lifecycle sheets (PDF p24–p25), per plan state.
  const [sheet, setSheet] = useState<{
    kind: "rate" | "split" | "offer";
    title: string;
  } | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Mine planer" />
      <FlatList
        data={rows}
        keyExtractor={(p) => `${p.state}-${p.experienceId}`}
        contentContainerClassName="gap-2 px-gutter pb-10 flex-grow"
        ListHeaderComponent={
          <View className="gap-3 pb-2">
            <View className="flex-row flex-wrap gap-2">
              {TABS.map((t) => (
                <Chip
                  key={t.key}
                  label={t.label}
                  selected={tab === t.key}
                  onPress={() => setTab(t.key)}
                />
              ))}
            </View>
            <DemoNote>Eksempelplaner — ingen reelle påmeldinger.</DemoNote>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="Ingen planer her"
            message="Opplevelser du blir med på dukker opp her."
            actionLabel="Utforsk kartet"
            onAction={() => router.navigate("/map")}
          />
        }
        renderItem={({ item }) => {
          const exp = experienceById(item.experienceId);
          if (!exp) return null;
          return (
            <View className="gap-0.5 rounded-2xl border border-line bg-surface p-3.5">
              <Text className="text-base font-semibold text-ink">
                {exp.title}
              </Text>
              <Text className="text-xs text-muted">
                {exp.when} · {item.note}
              </Text>
              {item.state === "past" ? (
                <PlanAction
                  label="Vurder opplevelsen"
                  onPress={() => setSheet({ kind: "rate", title: exp.title })}
                />
              ) : item.state === "waitlisted" ? (
                <PlanAction
                  label="Se venteliste-tilbud"
                  onPress={() => setSheet({ kind: "offer", title: exp.title })}
                />
              ) : item.state === "upcoming" && exp.priceNok ? (
                <PlanAction
                  label="Del regningen"
                  onPress={() => setSheet({ kind: "split", title: exp.title })}
                />
              ) : null}
            </View>
          );
        }}
      />
      {sheet?.kind === "rate" ? (
        <RateSheet title={sheet.title} onClose={() => setSheet(null)} />
      ) : null}
      {sheet?.kind === "offer" ? (
        <SpotOfferSheet title={sheet.title} onClose={() => setSheet(null)} />
      ) : null}
      {sheet?.kind === "split" ? (
        <SplitBillSheet
          title={sheet.title}
          names={["Du", ...people.slice(0, 3).map((p) => p.name)]}
          onClose={() => setSheet(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

function PlanAction({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={6}>
      <Text className="pt-1 text-sm font-semibold text-ember">{label} →</Text>
    </Pressable>
  );
}
