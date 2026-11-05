import { router } from "expo-router";
import { Text, View } from "react-native";

import { IconButton } from "@/components/ui";

// Back + title header for pushed (non-tab) route screens. Detail is still a
// sheet; this is just the route chrome.
export function RouteHeader({ title }: { title: string }) {
  return (
    <View className="flex-row items-center gap-3 border-b border-line px-gutter pb-3">
      <IconButton
        icon="chevron-back"
        label="Tilbake"
        size="sm"
        onPress={() => router.back()}
      />
      <Text className="text-xl font-bold text-ink">{title}</Text>
    </View>
  );
}
