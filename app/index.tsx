import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { StatusBarStyle } from "@/components/ui/StatusBarStyle";
import { LogoMark } from "@/components/Logo";
import { useThemeColors } from "@/theme";
import { Text } from "@/components/ui";

// Splash (PDF p1): Ember screen with the mark, "ThirdPlace" and "Byen din,
// laget for deg", then on to Welcome. No session check exists (no backend), so
// it only holds briefly — shorter when the user prefers reduced motion.
export default function Splash() {
  const colors = useThemeColors();
  const reduced = useReducedMotion();
  useEffect(() => {
    const t = setTimeout(
      () => router.replace("/welcome"),
      reduced ? 300 : 1200,
    );
    return () => clearTimeout(t);
  }, [reduced]);

  return (
    <View
      className="flex-1 items-center justify-center gap-3"
      style={{ backgroundColor: colors.ember }}
    >
      <StatusBarStyle style="light" />
      <View className="rounded-lg bg-white p-2">
        <LogoMark size={56} variant="mark" />
      </View>
      <Text variant="h1" tone="onMedia" style={{ letterSpacing: -0.4 }}>
        ThirdPlace
      </Text>
      <Text
        variant="label"
        weight="regular"
        tone="onMedia"
        className="opacity-80"
      >
        Byen din, laget for deg
      </Text>
    </View>
  );
}
