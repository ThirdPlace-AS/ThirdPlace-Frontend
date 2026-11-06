import { router, type Href } from "expo-router";
import { Pressable, View } from "react-native";

import {
  Icon,
  type IconName,
  Pressable as UIPressable,
  Text,
} from "@/components/ui";
import { DemoNote } from "@/components/DemoNote";
import { businesses, profile } from "@/fixtures";

// Account switcher (DEMO), per the design (PDF p27): opened with a long press
// on the Profil tab. Lists the linked accounts — the personal Utforsker
// profile and the business workspace — plus "Administrer kontoer".
// BLOCKED_CONTRACT_GAP: no linked-account or session model; switching only
// navigates between demo screens.
export default function AccountSwitch() {
  const biz = businesses[0];
  const rows: {
    title: string;
    hint: string;
    icon: IconName;
    onPress: () => void;
    active?: boolean;
  }[] = [
    {
      title: profile.name,
      hint: "Utforsker",
      icon: "person-circle-outline",
      active: true,
      onPress: () => router.back(),
    },
    {
      title: biz?.name ?? "Bedrift",
      hint: "Dashbord",
      icon: "tp-business",
      onPress: () => router.replace("/workspace" as Href),
    },
  ];
  return (
    <View className="flex-1 justify-end p-gutter pb-28">
      {/* Tap-to-close backdrop is a SIBLING behind the card, never its
          ancestor (no nested buttons — invalid DOM on web). */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Lukk"
        onPress={() => router.back()}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        className="bg-black/50"
      />
      <View
        className="gap-2 self-end rounded-lg bg-surface p-3"
        style={{ width: 280 }}
      >
        {rows.map((r) => (
          <UIPressable
            key={r.title}
            accessibilityRole="button"
            onPress={r.onPress}
            contentClassName="flex-row items-center gap-3 rounded-md p-2.5"
          >
            <Icon name={r.icon} size="xl" tone="ink" />
            <View className="flex-1">
              <Text variant="label" weight="semibold">
                {r.title}
              </Text>
              <Text variant="caption" tone="muted">
                {r.hint}
              </Text>
            </View>
            {r.active ? (
              <Text variant="caption" weight="semibold" tone="success">
                ✓ Aktiv
              </Text>
            ) : null}
          </UIPressable>
        ))}
        <UIPressable
          accessibilityRole="button"
          onPress={() => router.replace("/settings")}
          contentClassName="items-center rounded-md bg-surfaceMuted py-2.5"
        >
          <Text variant="label" weight="semibold">
            Administrer kontoer
          </Text>
        </UIPressable>
        <DemoNote>Kontobytte er bare navigasjon i demoen.</DemoNote>
      </View>
    </View>
  );
}
