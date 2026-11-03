import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme";

// Back + title header for pushed (non-tab) route screens. Detail is still a
// sheet; this is just the route chrome.
export function RouteHeader({ title }: { title: string }) {
  return (
    <View className="flex-row items-center gap-3 border-b border-line px-gutter pb-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tilbake"
        hitSlop={8}
        onPress={() => router.back()}
        className="h-9 w-9 items-center justify-center rounded-full active:bg-surfaceMuted"
      >
        <Ionicons name="chevron-back" size={24} color={colors.ink} />
      </Pressable>
      <Text className="text-xl font-bold text-ink">{title}</Text>
    </View>
  );
}
