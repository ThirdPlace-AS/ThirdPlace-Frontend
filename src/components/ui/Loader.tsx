// Loader (DESIGN_SYSTEM §4 "Loading"): spinner + short label for waits longer
// than 2 s (useLoadPhase → "loader"). Shorter waits use a skeleton instead.
// One polite busy element for screen readers.
import { ActivityIndicator, View } from "react-native";

import { useThemeColors } from "@/theme";

import { Text } from "./Text";

export function Loader({
  label = "Laster …",
  variant = "inline",
}: {
  label?: string;
  /** "inline" sits in the content; "pill" floats on a surface (map). */
  variant?: "inline" | "pill";
}) {
  const c = useThemeColors();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite"
      className={
        variant === "pill"
          ? "flex-row items-center gap-2 self-center rounded-full border border-line bg-surface px-4 py-2"
          : "flex-row items-center justify-center gap-2 py-6"
      }
    >
      <ActivityIndicator color={c.ink} />
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
}
