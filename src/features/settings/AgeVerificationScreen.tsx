import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Icon, Screen, Text, Pressable as UIPressable } from "@/components/ui";
import { RouteHeader } from "@/components/RouteHeader";

// Aldersverifisering, per the design (PDF p22): methods BankID /
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
    icon: "shield-checkmark-outline",
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
    <Screen edges={["top"]}>
      <RouteHeader title="Aldersverifisering" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <Text variant="caption" tone="muted">
          Noen opplevelser krever verifisert alder. Bekreft alderen din for
          tilgang.
        </Text>

        <Text variant="title" accessibilityRole="header">
          Verifiseringsmetode
        </Text>
        {METHODS.map((m) => (
          <UIPressable
            key={m.key}
            accessibilityRole="button"
            accessibilityState={{ selected: chosen === m.label }}
            onPress={() => setChosen(m.label)}
            contentClassName={`flex-row items-center gap-3 rounded-lg border bg-surface p-4 ${
              chosen === m.label ? "border-ink" : "border-line"
            }`}
            pressedScale={0.99}
          >
            <Icon name={m.icon} size="md" tone="ink" />
            <View className="flex-1">
              <Text variant="body" weight="semibold">
                {m.label}
              </Text>
              <Text variant="caption" tone="muted">
                {m.hint}
              </Text>
            </View>
            <Icon name="chevron-forward" size="sm" tone="muted" />
          </UIPressable>
        ))}

        <Text variant="title" accessibilityRole="header">
          Fordeler
        </Text>
        {BENEFITS.map((b) => (
          <View key={b} className="flex-row items-center gap-2">
            <Icon name="checkmark" size="sm" tone="success" />
            <Text variant="label" weight="regular">
              {b}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
