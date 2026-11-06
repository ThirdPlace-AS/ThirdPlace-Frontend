import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import {
  Icon,
  Screen,
  Pressable as UIPressable,
  Text,
  Badge,
} from "@/components/ui";
import { Chip } from "@/components/Chip";
import { DemoBadge } from "@/components/DemoBadge";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";
import { businesses, experiences, profile } from "@/fixtures";

// Business workspace (DEMO), per the design (PDF p13–p15): the business
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
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate("/profile")}
            className="rounded-full border border-line bg-surface px-3 py-1.5"
          >
            <Text variant="caption" weight="semibold">
              Bytt til
            </Text>
          </Pressable>
        </View>
        <View className="gap-1 rounded-lg border border-line bg-surface p-4">
          <Text variant="label" weight="semibold">
            Kom i gang: 1 av 2 steg gjenstår
          </Text>
          <Text variant="caption" tone="muted">
            ✓ Verifiser bedriften · Start abonnement
          </Text>
        </View>
        <DemoNote>
          Arbeidsflaten er et eksempel. Det finnes ingen bedriftskonto.
        </DemoNote>
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
    ["31", "Chat-joins"],
    ["4.7", "Rating"],
  ],
  Måned: [
    ["3 420", "Visninger"],
    ["312", "Følgere"],
    ["145", "Chat-joins"],
    ["4.7", "Rating"],
  ],
  Total: [
    ["18 900", "Visninger"],
    ["1 204", "Følgere"],
    ["690", "Chat-joins"],
    ["4.6", "Rating"],
  ],
};
const BARS = [42, 55, 48, 62, 58, 70, 66, 74, 69, 80, 77, 88];

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
          <View className="ml-auto">
            <DemoBadge label="EKSEMPELTALL" />
          </View>
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
          {BARS.map((h, i) => (
            <View
              key={i}
              className={`flex-1 rounded-t ${
                i === BARS.length - 1 ? "bg-ember" : "bg-success"
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </View>
        <DemoNote>
          Tallene er eksempler. Ingen analyse eller sporing er slått på.
        </DemoNote>
      </ScrollView>
    </Screen>
  );
}

export function WorkspaceCalendar() {
  const upcoming = experiences.filter((e) => e.status !== "cancelled");
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
            className="flex-row items-center gap-3 rounded-md border-l-4 border-l-ember bg-surface p-3"
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
              accessibilityRole="button"
              onPress={() => router.navigate("/add")}
            >
              <Text variant="label" weight="semibold" tone="ember">
                Rediger
              </Text>
            </Pressable>
          </View>
        ))}
        <DemoNote>
          Opplevelsene er eksempler. Kalenderen er ikke koblet til en bedrift.
        </DemoNote>
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
            <View className="flex-row items-center justify-between">
              <Text variant="body" weight="semibold">
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
        <View className="items-center rounded-lg border border-dashed border-line py-4">
          <Text variant="caption" weight="semibold" tone="muted">
            + Legg til lokasjon (ikke aktiv)
          </Text>
        </View>
        <DemoNote>
          Lokasjoner og priser er ikke slått på. Ingenting faktureres.
        </DemoNote>
      </ScrollView>
    </Screen>
  );
}
