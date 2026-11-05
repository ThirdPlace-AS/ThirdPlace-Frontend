import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { LogoMark } from "@/components/Logo";
import { useThemeColors } from "@/theme";

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
      <StatusBar style="light" />
      <View className="rounded-lg bg-white p-2">
        <LogoMark size={56} variant="mark" />
      </View>
      <Text
        className="text-2xl font-bold text-white"
        style={{ letterSpacing: -0.4 }}
      >
        ThirdPlace
      </Text>
      <Text className="text-sm text-white/80 font-normal">
        Byen din, laget for deg
      </Text>
    </View>
  );
}
