import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/ui";
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
    icon: keyof typeof Ionicons.glyphMap;
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
      icon: "storefront-outline",
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
          <Pressable
            key={r.title}
            accessibilityRole="button"
            onPress={r.onPress}
            className="flex-row items-center gap-3 rounded-md p-2.5 active:bg-surfaceMuted"
          >
            <Icon name={r.icon} size="xl" tone="ink" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ink">{r.title}</Text>
              <Text className="text-xs text-muted font-normal">{r.hint}</Text>
            </View>
            {r.active ? (
              <Text className="text-xs font-semibold text-successText">
                ✓ Aktiv
              </Text>
            ) : null}
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/settings")}
          className="items-center rounded-md bg-surfaceMuted py-2.5"
        >
          <Text className="text-sm font-semibold text-ink">
            Administrer kontoer
          </Text>
        </Pressable>
        <DemoNote>Kontobytte er bare navigasjon i demoen.</DemoNote>
      </View>
    </View>
  );
}
