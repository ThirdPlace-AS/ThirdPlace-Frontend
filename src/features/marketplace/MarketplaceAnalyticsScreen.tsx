// Marketplace-analyse (PDF p18), for your own listings: Uke / Måned / Total,
// six figures, the shape of requests over the period, your most viewed
// listings and the average rating you have given partners. Every figure is
// computed from the fixture lists (marketplaceStats.ts), so it agrees with
// Mine listings and Samarbeidshistorikk. BLOCKED_CONTRACT_GAP: no analytics
// backend; the numbers are MOCK, like the workspace Analyse page.
import { router, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { ChipGroup, ListRow, Page, Pressable, Text } from "@/components/ui";
import { requestBars, STATS_RANGES, type StatsRange } from "@/fixtures";
import { formatDecimal, formatRating } from "@/lib/format";

import {
  averageCollabRating,
  marketplaceStats,
  topListings,
} from "./marketplaceStats";

const CHART_TITLE: Record<StatsRange, string> = {
  Uke: "Forespørsler siste 7 dager",
  Måned: "Forespørsler siste 30 dager",
  Total: "Forespørsler over tid",
};

export default function MarketplaceAnalyticsScreen() {
  const [range, setRange] = useState<StatsRange>("Måned");
  const s = marketplaceStats(range);
  const rating = averageCollabRating();
  const tiles: [string, string][] = [
    [String(s.views), "Listing-visninger"],
    [String(s.requests), "Forespørsler"],
    [`${formatDecimal(s.conversion)} %`, "Konverteringsrate"],
    [`${s.replyHours} t`, "Snitt svartid"],
    [String(s.started), "Samarbeid initiert"],
    [String(s.completed), "Fullførte"],
  ];
  const bars = requestBars[range];

  return (
    <Page title="Marketplace-analyse">
      <ChipGroup
        label="Periode"
        options={STATS_RANGES}
        value={range}
        onChange={(r) => setRange(r as StatsRange)}
      />

      <View className="flex-row flex-wrap gap-3">
        {tiles.map(([value, label]) => (
          <View
            key={label}
            accessible
            accessibilityLabel={`${label}: ${value}`}
            className="w-[48%] gap-0.5 rounded-lg bg-surfaceMuted p-4"
          >
            <Text variant="h1">{value}</Text>
            <Text variant="caption" tone="muted">
              {label}
            </Text>
          </View>
        ))}
      </View>

      <View className="gap-2">
        <Text variant="title" accessibilityRole="header">
          {CHART_TITLE[range]}
        </Text>
        <View
          accessible
          accessibilityLabel={`${CHART_TITLE[range]}: stolpediagram`}
          className="flex-row items-end gap-1.5 rounded-lg border border-line bg-surface p-3"
          style={{ height: 150 }}
        >
          {bars.map((h, i) => (
            <View
              key={i}
              className={`flex-1 rounded-t ${
                i === bars.length - 1 ? "bg-ink" : "bg-success"
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text variant="title" accessibilityRole="header">
          Topplistinger
        </Text>
        <View className="overflow-hidden rounded-lg border border-line">
          {topListings(range).map(({ listing, views, requests }) => (
            <ListRow
              key={listing.id}
              title={listing.title}
              subtitle={`${views} visn. · ${requests} foresp.`}
              onPress={() => router.push(`/marketplace/${listing.id}` as Href)}
            />
          ))}
        </View>
      </View>

      {rating.count > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Gjennomsnittlig samarbeidsrating ${formatRating(rating.score)} av 5. Se samarbeidshistorikk`}
          onPress={() => router.push("/collab/history" as Href)}
          contentClassName="flex-row items-center justify-between rounded-lg border border-line bg-surface p-4"
          pressedScale={0.99}
        >
          <Text variant="label" weight="regular" className="flex-1 pr-3">
            Gjennomsnittlig samarbeidsrating
          </Text>
          <Text variant="h1">{formatRating(rating.score)}</Text>
        </Pressable>
      ) : null}
    </Page>
  );
}
