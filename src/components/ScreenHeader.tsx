import { router } from "expo-router";
import { Text, View } from "react-native";

import { IconButton } from "@/components/ui";

// Title block with an optional circular back button, matching the screens.
export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}) {
  return (
    <View className="gap-3">
      {showBack ? (
        <IconButton
          icon="chevron-back"
          label="Tilbake"
          variant="outline"
          onPress={() => router.back()}
        />
      ) : null}
      <View className="gap-1.5">
        <Text className="text-2xl font-bold text-ink">{title}</Text>
        {subtitle ? (
          <Text className="text-base text-muted">{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}
