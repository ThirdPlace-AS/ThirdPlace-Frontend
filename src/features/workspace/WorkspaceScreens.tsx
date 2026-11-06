import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import {
  Icon,
  Screen,
  Pressable as UIPressable,
  Text,
  Badge,
} from "@/components/ui";
import { byStart } from "@/features/workspace/calendarOrder";
import { Chip } from "@/components/Chip";
import { RouteHeader } from "@/components/RouteHeader";
import { businesses, experiences, profile } from "@/fixtures";

// Business workspace, per the design (PDF p13–p15): the business
// profile hub (Dashbord, Marketplace, linked personal account, "Kom i gang"),
// Analyse, Kalender and Lokasjoner. BLOCKED_CONTRACT_GAP: no business
// account, analytics, scheduling, location billing or subscription contract —
// every number is an example and is badged as such.
const BIZ = businesses[0];

export function WorkspaceHub() {
  return (
    <Screen edges={["top"]}>
      <RouteHeader title={BIZ?.name ?? "Bedrift"} />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-12">
        <View className="flex-row items-center gap-1.5">
          <Icon
            name={BIZ?.verified ? "checkmark-circle" : "time-outline"}
            size="sm"
            tone={BIZ?.verified ? "success" : "muted"}
          />
          <Text variant="label" weight="semibold">
            {BIZ?.verified ? "Verifisert bedrift" : "Ikke verifisert"}
          </Text>
        </View>
        <HubCard
          icon="trending-up-outline"
          title="Dashbord"
          hint="Visninger, chat, anmeldelser"
          onPress={() => router.push("/workspace/analytics")}
        />
        <HubCard
          icon="calendar-outline"
          title="Kalender"
          hint="Kommende opplevelser"
          onPress={() => router.push("/workspace/calendar")}
        />
        <HubCard
          icon="location-outline"
          title="Lokasjoner"
          hint="Steder bedriften driver"
          onPress={() => router.push("/workspace/locations")}
        />
        <HubCard
          icon="wallet-outline"
          title="Utbetalinger"
          hint="Utbetalingsmetode og -plan"
          onPress={() => router.push("/payouts")}
        />
        <HubCard
          icon="people-outline"
          title="Marketplace"
          hint="Samarbeid med skapere og bedrifter"
          onPress={() => router.push("/marketplace")}
        />
        <View className="flex-row items-center gap-3 rounded-lg bg-surfaceMuted p-4">
          <Icon name="person-circle-outline" size="xl" tone="ink" />
          <View className="flex-1">
            <Text variant="label" weight="semibold">
              {profile.name}
            </Text>
            <Text variant="caption" tone="muted">
              Personlig konto
            </Text>
          </View>
          <UIPressable
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            onPress={() => router.navigate("/profile")}
            contentClassName="rounded-full border border-line bg-surface px-3 py-1.5"
            pressedScale={0.99}
          >
            <Text variant="caption" weight="semibold">
              Bytt til
            </Text>
          </UIPressable>
        </View>
        <View className="gap-1 rounded-lg border border-line bg-surface p-4">
          <Text variant="label" weight="semibold">
            Kom i gang: 1 av 2 steg gjenstår
          </Text>
          {/* One line per step, each with its own state (a single ✓ in
              front of both read as both done). */}
          {[
            {
              label: "Verifiser bedriften",
              done: !!BIZ?.verified,
              href: "/business-onboarding" as Href,
            },
            {
              label: "Start abonnement",
              done: false,
              href: "/payments" as Href,
            },
          ].map((step) => (
            // Open steps lead on to where they are done (R30).
            <UIPressable
              key={step.label}
              accessibilityRole={step.done ? "text" : "button"}
              accessibilityLabel={`${step.label}: ${step.done ? "fullført" : "gjenstår"}`}
              disabled={step.done}
              dimWhenDisabled={false}
              onPress={() => router.push(step.href)}
              contentClassName="flex-row items-center gap-2 py-1"
              pressedScale={0.99}
            >
              <Icon
                name={step.done ? "checkmark-circle" : "ellipse-outline"}
                size="sm"
                tone={step.done ? "success" : "muted"}
              />
              <Text
                variant="caption"
                tone={step.done ? "muted" : "ink"}
                className="flex-1"
              >
                {step.label}
              </Text>
              {step.done ? null : (
                <Icon name="chevron-forward" size="sm" tone="muted" />
              )}
            </UIPressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function HubCard({
  icon,
  title,
  hint,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <UIPressable
      accessibilityRole="button"
      onPress={onPress}
      contentClassName="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-4"
      pressedScale={0.99}
    >
      <View className="h-11 w-11 items-center justify-center rounded-md bg-surfaceMuted">
        <Icon name={icon} size="md" tone="ink" />
      </View>
      <View className="flex-1">
        <Text variant="body" weight="semibold">
          {title}
        </Text>
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      </View>
      <Icon name="chevron-forward" size="md" tone="muted" />
    </UIPressable>
  );
}

const RANGES = ["Uke", "Måned", "Total"] as const;
const STATS: Record<(typeof RANGES)[number], [string, string][]> = {
  Uke: [
    ["812", "Visninger"],
    ["74", "Følgere"],
    ["31", "Ble med i chat"],
    ["4,7", "Vurdering"],
  ],
  Måned: [
    ["3 420", "Visninger"],
    ["312", "Følgere"],
    ["145", "Ble med i chat"],
    ["4,7", "Vurdering"],
  ],
  Total: [
    ["18 900", "Visninger"],
    ["1 204", "Følgere"],
    ["690", "Ble med i chat"],
    ["4,6", "Vurdering"],
  ],
};
// Example bar heights per range (the chart follows the Uke/Måned/Total
// switch like the tiles above; all numbers are examples).
const BARS: Record<(typeof RANGES)[number], number[]> = {
  Uke: [48, 62, 55, 70, 66, 81, 74],
  Måned: [42, 55, 48, 62, 58, 70, 66, 74, 69, 80, 77, 88],
  Total: [20, 28, 35, 33, 46, 52, 58, 63, 71, 76, 84, 92],
};

export function WorkspaceAnalytics() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("Måned");
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Analyse" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <View className="flex-row items-center gap-2">
          {RANGES.map((r) => (
            <Chip
              key={r}
              label={r}
              selected={range === r}
              onPress={() => setRange(r)}
            />
          ))}
        </View>
        <View className="flex-row flex-wrap gap-3">
          {STATS[range].map(([v, l]) => (
            <View
              key={l}
              className="w-[48%] gap-0.5 rounded-lg bg-surfaceMuted p-4"
            >
              <Text variant="h1" accessibilityRole="text">
                {v}
              </Text>
              <Text variant="caption" tone="muted">
                {l}
              </Text>
            </View>
          ))}
        </View>
        <Text variant="micro" weight="semibold" tone="muted">
          Visninger siste periode
        </Text>
        <View
          className="flex-row items-end gap-1.5 rounded-lg border border-line bg-surface p-3"
          style={{ height: 160 }}
        >
          {BARS[range].map((h, i) => (
            <View
              key={i}
              className={`flex-1 rounded-t ${
                i === BARS[range].length - 1 ? "bg-ink" : "bg-success"
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

export function WorkspaceCalendar() {
  const upcoming = byStart(experiences.filter((e) => e.status !== "cancelled"));
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Kalender" />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-12">
        <Text variant="micro" weight="semibold" tone="muted">
          Kommende
        </Text>
        {upcoming.map((e) => (
          <View
            key={e.id}
            className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
          >
            <View className="flex-1">
              <Text variant="caption" tone="muted">
                {e.when}
              </Text>
              <Text variant="body" weight="semibold">
                {e.title}
              </Text>
              <Text variant="caption" tone="muted">
                {e.capacity} plasser
              </Text>
            </View>
            <Pressable
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Rediger ${e.title}`}
              onPress={() =>
                router.navigate({
                  pathname: "/add",
                  params: { edit: e.id, at: String(Date.now()) },
                })
              }
            >
              <Text variant="label" weight="semibold" className="underline">
                Rediger
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

export function WorkspaceLocations() {
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Lokasjoner" />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-12">
        <Text variant="caption" tone="muted">
          {businesses.length} lokasjoner
        </Text>
        {businesses.map((b) => (
          <View
            key={b.id}
            className="gap-1 rounded-lg border border-line bg-surface p-4"
          >
            <View className="flex-row items-start justify-between gap-3">
              <Text variant="body" weight="semibold" className="flex-1">
                {b.name}
              </Text>
              <Badge
                kind="status"
                label={b.verified ? "✓ Verifisert" : "Venter på verifisering"}
                tone={b.verified ? "success" : "warning"}
              />
            </View>
            <Text variant="caption" tone="muted">
              {b.address}
            </Text>
          </View>
        ))}
        <View
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          className="items-center rounded-lg border border-dashed border-line py-4 opacity-50"
        >
          <Text variant="caption" weight="semibold" tone="muted">
            + Legg til lokasjon
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
