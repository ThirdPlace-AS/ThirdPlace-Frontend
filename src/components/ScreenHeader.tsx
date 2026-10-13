import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";

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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tilbake"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface"
        >
          <Text className="text-lg text-ink">←</Text>
        </Pressable>
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
