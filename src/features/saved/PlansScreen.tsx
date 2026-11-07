import { type Href, router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, View } from "react-native";

import { RateSheet, SpotOfferSheet } from "@/components/actions/ActionSheets";
import { Pressable as UIPressable, Screen, Text } from "@/components/ui";
import { Chip } from "@/components/Chip";
import { AddToCalendarLink } from "@/components/AddToCalendarLink";
import { CountdownChip, planCountdown } from "@/components/CountdownChip";
import { RouteHeader } from "@/components/RouteHeader";
import { EmptyState } from "@/components/states/StateView";
import { MonthGrid } from "@/components/MonthGrid";
import { isoDay } from "@/lib/dates";
import { myRatingLabel, saveMyRating, useMyRatings } from "@/lib/myRatings";
import {
  chatForExperience,
  experienceById,
  profile,
  sessionsFor,
  type MockExperience,
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
// The next time of a plan (the one its countdown and calendar link use).
function nextStart(exp: MockExperience, now: Date): Date | undefined {
  return sessionsFor(exp, now).find((s) => s.start.getTime() > now.getTime())
    ?.start;
}

export default function PlansScreen() {
  const [tab, setTab] = useState<MockPlanState>("upcoming");
  // Phase 18 (screen benchmark: Google Calendar, Apple Calendar): upcoming
  // plans as a month with a dot on each day; tapping a day narrows the list.
  const [view, setView] = useState<"list" | "month">("list");
  const [month, setMonth] = useState(() => new Date());
  const [day, setDay] = useState<string | null>(null);
  const [now] = useState(() => new Date());
  const upcomingDays = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of profile.plans) {
      if (p.state !== "upcoming") continue;
      const exp = experienceById(p.experienceId);
      const start = exp ? nextStart(exp, now) : undefined;
      if (!start) continue;
      const key = isoDay(start);
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    return m;
  }, [now]);
  const monthView = tab === "upcoming" && view === "month";
  const rows = profile.plans.filter((p) => {
    if (p.state !== tab) return false;
    if (!monthView || day === null) return true;
    const exp = experienceById(p.experienceId);
    const start = exp ? nextStart(exp, now) : undefined;
    return start ? isoDay(start) === day : false;
  });
  // Lifecycle sheets (PDF p24–p25), per plan state.
  const [sheet, setSheet] = useState<{
    kind: "rate" | "offer";
    title: string;
    id: string;
  } | null>(null);
  // Phase 18: a sent "Hvordan var det?" stays on its plan row.
  const myRatings = useMyRatings();

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
            {tab === "upcoming" ? (
              <View className="flex-row gap-2" accessibilityRole="radiogroup">
                <Chip
                  label="Liste"
                  size="sm"
                  role="radio"
                  icon="list-outline"
                  selected={view === "list"}
                  onPress={() => {
                    setView("list");
                    setDay(null);
                  }}
                />
                <Chip
                  label="Kalender"
                  size="sm"
                  role="radio"
                  icon="calendar-outline"
                  selected={view === "month"}
                  onPress={() => setView("month")}
                />
              </View>
            ) : null}
            {monthView ? (
              <MonthGrid
                month={month}
                marked={upcomingDays}
                selected={day}
                today={now}
                onSelect={setDay}
                onMonthChange={(delta) =>
                  setMonth(
                    (m) => new Date(m.getFullYear(), m.getMonth() + delta, 1),
                  )
                }
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            illustration={<Illustration name="emptyPlans" />}
            title="Ingen planer her"
            message={
              monthView && day
                ? "Ingen planer denne dagen."
                : "Opplevelser du blir med på dukker opp her."
            }
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
                <View className="flex-row flex-wrap items-center gap-x-5">
                  {myRatings[exp.id] ? (
                    <Text
                      variant="caption"
                      weight="medium"
                      accessibilityLabel={`Din vurdering: ${myRatings[exp.id]!.stars} av 5 stjerner`}
                    >
                      Din vurdering: {myRatingLabel(myRatings[exp.id]!)}
                    </Text>
                  ) : (
                    <PlanAction
                      label="Vurder opplevelsen"
                      onPress={() =>
                        setSheet({ kind: "rate", title: exp.title, id: exp.id })
                      }
                    />
                  )}
                  <HelpAction id={exp.id} />
                </View>
              ) : item.state === "waitlisted" ? (
                <PlanAction
                  label="Se venteliste-tilbud"
                  onPress={() =>
                    setSheet({ kind: "offer", title: exp.title, id: exp.id })
                  }
                />
              ) : null}
              {item.state === "cancelled" ? <HelpAction id={exp.id} /> : null}
              {/* PDF p25 "Del regningen" is hidden: split payments are a V1
                  non-goal in the spec (founder 2026-11-07, Phase 15). */}
              {/* Approved addition (2026-11-06): a plan links to the example
                  chat pinned to its experience, where one exists. A link only:
                  joining does not grant chat membership (spec §12). */}
              {item.state === "upcoming"
                ? (() => {
                    const chat = chatForExperience(exp.id);
                    const now = new Date();
                    const next = sessionsFor(exp, now).find(
                      (s) => s.start.getTime() > now.getTime(),
                    );
                    return (
                      <View className="flex-row flex-wrap gap-x-5">
                        {chat ? (
                          <PlanAction
                            label="Til samtalen"
                            onPress={() =>
                              router.push(`/chat/${chat.id}` as Href)
                            }
                          />
                        ) : null}
                        {/* Phase 16: the plan's next time in the phone's
                            calendar app. */}
                        <AddToCalendarLink
                          exp={exp}
                          session={next}
                          tone="ember"
                        />
                        <HelpAction id={exp.id} />
                      </View>
                    );
                  })()
                : null}
            </View>
          );
        }}
      />
      {sheet?.kind === "rate" ? (
        <RateSheet
          title={sheet.title}
          onClose={() => setSheet(null)}
          onSent={(r) => saveMyRating(sheet.id, r)}
        />
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

// Phase 18: help that starts from the plan (Uber, Amazon), with the
// experience filled in on the support form.
function HelpAction({ id }: { id: string }) {
  return (
    <PlanAction
      label="Få hjelp"
      onPress={() =>
        router.push({ pathname: "/settings/support", params: { about: id } })
      }
    />
  );
}
