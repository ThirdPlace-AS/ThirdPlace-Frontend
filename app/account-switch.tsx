import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { DemoNote } from "@/components/DemoNote";
import { businesses, profile } from "@/fixtures";
import { colors } from "@/theme";

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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Lukk"
      onPress={() => router.back()}
      className="flex-1 justify-end bg-black/50 p-gutter pb-28"
    >
      <View
        className="gap-2 self-end rounded-2xl bg-surface p-3"
        style={{ width: 280 }}
      >
        {rows.map((r) => (
          <Pressable
            key={r.title}
            accessibilityRole="button"
            onPress={r.onPress}
            className="flex-row items-center gap-3 rounded-xl p-2.5 active:bg-surfaceMuted"
          >
            <Ionicons name={r.icon} size={28} color={colors.ink} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ink">{r.title}</Text>
              <Text className="text-xs text-muted">{r.hint}</Text>
            </View>
            {r.active ? (
              <Text className="text-xs font-semibold text-success">
                ✓ Aktiv
              </Text>
            ) : null}
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/settings")}
          className="items-center rounded-xl bg-surfaceMuted py-2.5"
        >
          <Text className="text-sm font-semibold text-ink">
            Administrer kontoer
          </Text>
        </Pressable>
        <DemoNote>Kontobytte er bare navigasjon i demoen.</DemoNote>
      </View>
    </Pressable>
  );
}
