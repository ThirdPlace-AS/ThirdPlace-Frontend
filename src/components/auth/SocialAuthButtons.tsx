import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { Icon, Text, Pressable as UIPressable } from "@/components/ui";

// "ELLER" divider + Google / Apple buttons (PDF p1). The verb follows the
// screen: "Fortsett med" on register, "Logg inn med" on login. Tapping
// continues the same way as the main button on that screen
// (BLOCKED_CONTRACT_GAP: no identity provider is wired).
export function SocialAuthButtons({
  verb,
  onContinue,
}: {
  verb: string;
  onContinue: () => void;
}) {
  const providers: {
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { name: "Google", icon: "logo-google" },
    { name: "Apple", icon: "logo-apple" },
  ];
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-line" />
        <Text
          variant="caption"
          weight="semibold"
          tone="muted"
          className="tracking-widest"
        >
          ELLER
        </Text>
        <View className="h-px flex-1 bg-line" />
      </View>
      {providers.map((p) => (
        <UIPressable
          key={p.name}
          accessibilityRole="button"
          onPress={onContinue}
          contentClassName="flex-row items-center justify-center gap-2 rounded-full border border-line bg-surface py-3.5"
          pressedScale={0.99}
        >
          <Icon name={p.icon} size="md" tone="ink" />
          <Text variant="body" weight="medium">
            {verb} {p.name}
          </Text>
        </UIPressable>
      ))}
    </View>
  );
}
