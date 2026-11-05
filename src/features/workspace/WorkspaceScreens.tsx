import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/ui";
import { Chip } from "@/components/Chip";
import { DemoBadge } from "@/components/DemoBadge";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";
import { businesses, experiences, profile } from "@/fixtures";
import { useThemeColors } from "@/theme";

// Business workspace (DEMO), per the design (PDF p13–p15): the business
// profile hub (Dashbord, Marketplace, linked personal account, "Kom i gang"),
// Analyse, Kalender and Lokasjoner. BLOCKED_CONTRACT_GAP: no business
// account, analytics, scheduling, location billing or subscription contract —
// every number is an example and is badged as such.
const BIZ = businesses[0];

export function WorkspaceHub() {
  const colors = useThemeColors();
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title={BIZ?.name ?? "Bedrift"} />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-12">
        <View className="flex-row items-center gap-1.5">
          <Ionicons
            name={BIZ?.verified ? "checkmark-circle" : "time-outline"}
            size={16}
            color={BIZ?.verified ? colors.success : colors.muted}
          />
          <Text className="text-sm font-semibold text-ink">
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
            <Text className="text-sm font-semibold text-ink">
              {profile.name}
            </Text>
            <Text className="text-xs text-muted font-normal">
              Personlig konto
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate("/profile")}
            className="rounded-full border border-line bg-surface px-3 py-1.5"
          >
            <Text className="text-xs font-semibold text-ink">Bytt til</Text>
          </Pressable>
        </View>
        <View className="gap-1 rounded-lg border border-line bg-surface p-4">
          <Text className="text-sm font-semibold text-ink">
            Kom i gang: 1 av 2 steg gjenstår
          </Text>
          <Text className="text-xs text-muted font-normal">
            ✓ Verifiser bedriften · Start abonnement
          </Text>
        </View>
        <DemoNote>
          Bedriftsarbeidsflaten er et eksempel — ingen bedriftskonto finnes.
        </DemoNote>
      </ScrollView>
    </SafeAreaView>
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
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-4 active:opacity-80"
    >
      <View className="h-11 w-11 items-center justify-center rounded-md bg-surfaceMuted">
        <Icon name={icon} size="md" tone="ink" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink">{title}</Text>
        <Text className="text-xs text-muted font-normal">{hint}</Text>
      </View>
      <Icon name="chevron-forward" size="md" tone="muted" />
    </Pressable>
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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
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
              <Text className="text-2xl font-bold text-ink">{v}</Text>
              <Text className="text-xs text-muted font-normal">{l}</Text>
            </View>
          ))}
        </View>
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
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
          Tallene er eksempler — ingen analyse eller sporing er aktiv.
        </DemoNote>
      </ScrollView>
    </SafeAreaView>
  );
}

export function WorkspaceCalendar() {
  const upcoming = experiences.filter((e) => e.status !== "cancelled");
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Kalender" />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-12">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          Kommende
        </Text>
        {upcoming.map((e) => (
          <View
            key={e.id}
            className="flex-row items-center gap-3 rounded-md border-l-4 border-l-ember bg-surface p-3"
          >
            <View className="flex-1">
              <Text className="text-xs text-muted font-normal">{e.when}</Text>
              <Text className="text-base font-semibold text-ink">
                {e.title}
              </Text>
              <Text className="text-xs text-muted font-normal">
                {e.capacity} plasser
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate("/add")}
            >
              <Text className="text-sm font-semibold text-emberText">
                Rediger
              </Text>
            </Pressable>
          </View>
        ))}
        <DemoNote>
          Eksempelopplevelser — kalenderen er ikke koblet til en bedrift.
        </DemoNote>
      </ScrollView>
    </SafeAreaView>
  );
}

export function WorkspaceLocations() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Lokasjoner" />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-12">
        <Text className="text-sm text-muted font-normal">
          {businesses.length} lokasjoner
        </Text>
        {businesses.map((b) => (
          <View
            key={b.id}
            className="gap-1 rounded-lg border border-line bg-surface p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-ink">{b.name}</Text>
              <View
                className={`rounded-full px-2.5 py-1 ${
                  b.verified ? "bg-success/15" : "bg-warning/20"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    b.verified ? "text-successText" : "text-ink"
                  }`}
                >
                  {b.verified ? "✓ Verifisert" : "Venter på verifisering"}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-muted font-normal">{b.address}</Text>
          </View>
        ))}
        <View className="items-center rounded-lg border border-dashed border-line py-4">
          <Text className="text-sm font-semibold text-muted">
            + Legg til lokasjon (ikke aktiv)
          </Text>
        </View>
        <DemoNote>
          Lokasjoner og priser er ikke aktive — ingenting faktureres.
        </DemoNote>
      </ScrollView>
    </SafeAreaView>
  );
}
