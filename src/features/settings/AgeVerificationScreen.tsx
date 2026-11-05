import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";
import { colors } from "@/theme";

// Aldersverifisering (DEMO), per the design (PDF p22): methods BankID /
// ID-dokument / Vipps and what verification unlocks. The 18+ launch gate
// itself is the birthday step in onboarding (TP-D-001); this screen is the
// stronger, optional check. BLOCKED_CONTRACT_GAP: no identity provider is
// wired — choosing a method verifies nothing.
const METHODS: {
  key: string;
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: "bankid",
    label: "BankID",
    hint: "Automatisk via BankID (Norge)",
    icon: "card-outline",
  },
  {
    key: "id",
    label: "ID-dokument",
    hint: "Last opp pass eller førerkort",
    icon: "camera-outline",
  },
  {
    key: "vipps",
    label: "Vipps",
    hint: "Bekreft via Vipps-appen",
    icon: "phone-portrait-outline",
  },
];
const BENEFITS = [
  "Tilgang til 18+ opplevelser",
  "Verifisert-merke på profilen",
  "Høyere tillit hos verter",
];

export default function AgeVerificationScreen() {
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Aldersverifisering" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <Text className="text-sm text-muted">
          Noen opplevelser krever verifisert alder. Bekreft alderen din for full
          tilgang.
        </Text>
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          Verifiseringsmetode
        </Text>
        {METHODS.map((m) => (
          <Pressable
            key={m.key}
            accessibilityRole="button"
            onPress={() => setChosen(m.label)}
            className={`flex-row items-center gap-3 rounded-lg border bg-surface p-4 active:opacity-80 ${
              chosen === m.label ? "border-ink" : "border-line"
            }`}
          >
            <Ionicons name={m.icon} size={20} color={colors.ink} />
            <View className="flex-1">
              <Text className="text-base font-semibold text-ink">
                {m.label}
              </Text>
              <Text className="text-xs text-muted">{m.hint}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>
        ))}
        {chosen ? (
          <DemoNote>{`${chosen} er ikke koblet til i demoen — ingenting ble verifisert.`}</DemoNote>
        ) : null}
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          Fordeler
        </Text>
        {BENEFITS.map((b) => (
          <View key={b} className="flex-row items-center gap-2">
            <Ionicons name="checkmark" size={16} color={colors.success} />
            <Text className="text-sm text-ink">{b}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
