import { router, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { StatusBarStyle } from "@/components/ui/StatusBarStyle";
import { LogoMark } from "@/components/Logo";
import { useThemeColors } from "@/theme";
import { Text } from "@/components/ui";

// Splash (PDF p1): Ember screen with the mark, "ThirdPlace" and "Finn folk og
// steder i byen din" (founder copy, 2026-11-06), then on to Welcome. Nothing
// loads here (no session check, no backend; the root layout already waits for
// the fonts), so it no longer holds 1.2 s: it hands over on the first frame
// once the root navigator is ready (navigating earlier throws). The native
// splash is the same ember, so the hand-over does not flash.
export default function Splash() {
  const colors = useThemeColors();
  const navKey = useRootNavigationState()?.key;
  useEffect(() => {
    if (!navKey) return;
    const frame = requestAnimationFrame(() => router.replace("/welcome"));
    return () => cancelAnimationFrame(frame);
  }, [navKey]);

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
        Finn folk og steder i byen din
      </Text>
    </View>
  );
}
