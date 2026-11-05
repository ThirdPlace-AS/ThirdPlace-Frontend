import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/ui";
import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";

// Inviter venner + Belønninger (DEMO), per the design (PDF p22): a personal
// code, copy/share, the invite activity and the reward ladder. Master spec
// forbids inventing entitlements, so the rewards and thresholds are the
// design's illustrative copy behind a DemoNote — nothing is earned, granted
// or tracked (BLOCKED_CONTRACT_GAP).
const ACTIVITY = [
  { label: "Sendt", value: 0 },
  { label: "Registrerte", value: 0 },
  { label: "Belønninger", value: 0 },
];
const REWARDS: {
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    label: "3 venner",
    hint: "Belønning ikke definert ennå",
    icon: "flash-outline",
  },
  {
    label: "5 venner",
    hint: "Belønning ikke definert ennå",
    icon: "star-outline",
  },
  {
    label: "10 venner",
    hint: "Belønning ikke definert ennå",
    icon: "trophy-outline",
  },
];

export default function InviteScreen() {
  const [notice, setNotice] = useState(false);
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Inviter venner" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <Text className="text-sm text-muted font-normal">
          Del ThirdPlace og få belønninger.
        </Text>
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          Din kode
        </Text>
        <View className="items-center rounded-lg border border-line bg-surface py-5">
          <Text className="text-2xl font-bold tracking-widest text-emberText">
            OLA-TP2026
          </Text>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label="Kopier lenke"
              variant="secondary"
              onPress={() => setNotice(true)}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Del via …"
              variant="ember"
              onPress={() => setNotice(true)}
            />
          </View>
        </View>
        {notice ? (
          <DemoNote>Koden er et eksempel — ingenting ble delt.</DemoNote>
        ) : null}
        <Button
          label="Inviter kontakter"
          variant="secondary"
          onPress={() => router.push("/invite-contacts")}
        />

        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          Aktivitet
        </Text>
        <View className="flex-row gap-2">
          {ACTIVITY.map((a) => (
            <View
              key={a.label}
              className="flex-1 items-center gap-0.5 rounded-md border border-line bg-surface py-3"
            >
              <Text className="text-xl font-bold text-ink">{a.value}</Text>
              <Text className="text-xs text-muted font-normal">{a.label}</Text>
            </View>
          ))}
        </View>

        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          Belønninger
        </Text>
        {REWARDS.map((r) => (
          <View
            key={r.label}
            className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3.5"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted">
              <Icon name={r.icon} size="md" tone="muted" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ink">{r.label}</Text>
              <Text className="text-xs text-muted font-normal">{r.hint}</Text>
            </View>
            <Icon name="lock-closed-outline" size="sm" tone="muted" />
          </View>
        ))}
        <DemoNote>
          Belønningene er eksempler fra designet — ingen fordeler er definert
          eller opptjent.
        </DemoNote>
      </ScrollView>
    </SafeAreaView>
  );
}
