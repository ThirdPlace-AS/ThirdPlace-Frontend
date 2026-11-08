import { router } from "expo-router";
import { ScrollView, Share, View } from "react-native";

import { Screen, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { RouteHeader } from "@/components/RouteHeader";
import { showToast } from "@/components/Toast";
import { confirmToast } from "@/copy";

// Inviter venner, per the design (PDF p22): a personal code, copy/share and
// the invite activity. p22's reward ladder and its activity count are hidden:
// the spec keeps referral rewards off until a policy enables them (founder
// 2026-11-07, Phase 15). Nothing is tracked (BLOCKED_CONTRACT_GAP).
const ACTIVITY = [
  { label: "Sendt", value: 0 },
  { label: "Registrerte", value: 0 },
];

export default function InviteScreen() {
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Inviter venner" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <Text variant="caption" tone="muted">
          Del ThirdPlace med vennene dine.
        </Text>
        <Text variant="title" accessibilityRole="header">
          Din kode
        </Text>
        <View className="items-center rounded-lg border border-line bg-surface py-5">
          <Text variant="h1" className="tracking-widest">
            OLA-TP2026
          </Text>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label="Kopier lenke"
              variant="secondary"
              onPress={() => showToast(confirmToast.linkCopied)}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Del via …"
              variant="ember"
              onPress={() =>
                void Share.share({
                  message: "Bli med på ThirdPlace: thirdplace.app/i/OLA-TP2026",
                })
              }
            />
          </View>
        </View>

        <Button
          label="Inviter kontakter"
          variant="secondary"
          onPress={() => router.push("/invite-contacts")}
        />

        <Text variant="title" accessibilityRole="header">
          Aktivitet
        </Text>
        <View className="flex-row gap-2">
          {ACTIVITY.map((a) => (
            <View
              key={a.label}
              className="flex-1 items-center gap-0.5 rounded-md border border-line bg-surface py-3"
            >
              <Text variant="h2" weight="bold" accessibilityRole="text">
                {a.value}
              </Text>
              <Text variant="caption" tone="muted">
                {a.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
