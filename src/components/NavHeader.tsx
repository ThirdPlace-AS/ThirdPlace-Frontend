import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme";

// Inline nav header with a back control for pushed routes (the root Stack hides
// its own header). `right` renders an optional trailing control.
export function NavHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-2 px-gutter py-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tilbake"
        onPress={() => router.back()}
        className="-ml-2 h-10 w-10 items-center justify-center rounded-full"
      >
        <Ionicons name="chevron-back" size={24} color={colors.ink} />
      </Pressable>
      <Text className="flex-1 text-xl font-bold text-ink" numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}
