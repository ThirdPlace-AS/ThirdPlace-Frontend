import { type Href, router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, View } from "react-native";

import { RateSheet, SpotOfferSheet } from "@/components/actions/ActionSheets";
import { Pressable as UIPressable, Screen, Text } from "@/components/ui";
import { Chip } from "@/components/Chip";
import { CountdownChip, planCountdown } from "@/components/CountdownChip";
import { RouteHeader } from "@/components/RouteHeader";
import { EmptyState } from "@/components/states/StateView";
import {
  chatForExperience,
  experienceById,
  profile,
  type MockPlanState,
} from "@/fixtures";
import { Illustration } from "@/components/illustrations/Illustration";
import { gutterPx } from "@/theme";

const TABS: { key: MockPlanState; label: string }[] = [
  { key: "upcoming", label: "Kommende" },
  { key: "waitlisted", label: "Venteliste" },
  { key: "past", label: "Tidligere" },
  { key: "cancelled", label: "Avlyst" },
];

// Mine planer — REQUIRED_V1 (master spec §11, REG §4): upcoming, past,
// cancelled and waitlisted plans. No PDF page of its own; it follows the
// Lagret layout (p14). BLOCKED_CONTRACT_GAP: there is no attendance or join
// lifecycle — the plans are fixture examples.
export default function PlansScreen() {
  const [tab, setTab] = useState<MockPlanState>("upcoming");
  const rows = profile.plans.filter((p) => p.state === tab);
  // Lifecycle sheets (PDF p24–p25), per plan state.
  const [sheet, setSheet] = useState<{
    kind: "rate" | "offer";
    title: string;
  } | null>(null);

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Mine planer" />
      <FlatList
        data={rows}
        keyExtractor={(p) => `${p.state}-${p.experienceId}`}
        contentContainerClassName="gap-2 px-gutter pb-10 pt-4 flex-grow"
        ListHeaderComponent={
          <View className="gap-3 pb-2">
            {/* One scrolling row (like the map chips) instead of a wrap that
                left "Avlyst" alone on a second line. */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              accessibilityRole="radiogroup"
              // -mx-gutter generates nothing for the custom token; bleed explicitly.
              style={{ marginHorizontal: -gutterPx }}
              contentContainerClassName="gap-2 px-gutter"
            >
              {TABS.map((t) => (
                <Chip
                  key={t.key}
                  label={t.label}
                  size="sm"
                  role="radio"
                  selected={tab === t.key}
                  onPress={() => setTab(t.key)}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            illustration={<Illustration name="emptyPlans" />}
            title="Ingen planer her"
            message="Opplevelser du blir med på dukker opp her."
            actionLabel="Utforsk kartet"
            onAction={() => router.navigate("/map")}
          />
        }
        renderItem={({ item }) => {
          const exp = experienceById(item.experienceId);
          if (!exp) return null;
          // Upcoming plans count down (Phase 16): "I morgen", "Om 4 dager".
          const countdown =
            item.state === "upcoming" ? planCountdown(exp) : null;
          return (
            <View className="gap-0.5 rounded-lg border border-line bg-surface p-3.5">
              {/* Title + meta open the experience page; the plan
                  actions below stay separate buttons. */}
              <UIPressable
                accessibilityRole="link"
                accessibilityLabel={`${exp.title}, ${exp.when}${
                  countdown ? `, ${countdown.toLowerCase()}` : ""
                }`}
                onPress={() => router.push(`/experience/${exp.id}` as Href)}
                pressedScale={0.99}
                contentClassName="gap-0.5"
              >
                <View className="flex-row items-start gap-2">
                  <Text variant="body" weight="semibold" className="flex-1">
                    {exp.title}
                  </Text>
                  {countdown ? <CountdownChip exp={exp} /> : null}
                </View>
                <Text variant="caption" tone="muted">
                  {exp.when} · {item.note}
                </Text>
              </UIPressable>
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
              ) : null}
              {/* PDF p25 "Del regningen" is hidden: split payments are a V1
                  non-goal in the spec (founder 2026-11-07, Phase 15). */}
              {/* Approved addition (2026-11-06): a plan links to the example
                  chat pinned to its experience, where one exists. A link only:
                  joining does not grant chat membership (spec §12). */}
              {item.state === "upcoming"
                ? (() => {
                    const chat = chatForExperience(exp.id);
                    return chat ? (
                      <PlanAction
                        label="Til samtalen"
                        onPress={() => router.push(`/chat/${chat.id}` as Href)}
                      />
                    ) : null;
                  })()
                : null}
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
    </Screen>
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
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
    >
      <Text variant="label" weight="semibold" tone="ember" className="pt-1">
        {label}
      </Text>
    </Pressable>
  );
}
