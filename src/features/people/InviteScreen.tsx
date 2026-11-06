import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Share, View } from "react-native";

import { Icon, Screen, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { RouteHeader } from "@/components/RouteHeader";
import { showToast } from "@/components/Toast";
import { confirmToast } from "@/copy";

// Inviter venner + Belønninger, per the design (PDF p22): a personal code,
// copy/share, the invite activity and the milestone ladder with progress.
// Master spec forbids inventing entitlements, so milestones name no perk;
// nothing is earned, granted or tracked (BLOCKED_CONTRACT_GAP).
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
    hint: "0 av 3 har registrert seg",
    icon: "flash-outline",
  },
  {
    label: "5 venner",
    hint: "0 av 5 har registrert seg",
    icon: "star-outline",
  },
  {
    label: "10 venner",
    hint: "0 av 10 har registrert seg",
    icon: "trophy-outline",
  },
];

export default function InviteScreen() {
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Inviter venner" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <Text variant="caption" tone="muted">
          Del ThirdPlace med vennene dine.
        </Text>
        <Text variant="micro" weight="semibold" tone="muted">
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

        <Text variant="micro" weight="semibold" tone="muted">
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

        <Text variant="micro" weight="semibold" tone="muted">
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
              <Text variant="label" weight="semibold">
                {r.label}
              </Text>
              <Text variant="caption" tone="muted">
                {r.hint}
              </Text>
            </View>
            <Icon name="lock-closed-outline" size="sm" tone="muted" />
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
