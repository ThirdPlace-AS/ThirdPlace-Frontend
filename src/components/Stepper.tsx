import { Pressable, View } from "react-native";

import { Icon, Text } from "@/components/ui";

// A labelled − value + counter row (used by the filter sheet's "Who?" guests).
// Clamps to [min, max]. Demo-only where used (no backend).
export function Stepper({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 20,
  divider = false,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  // Draws a hairline under the row (used to separate the "Who?" guest rows).
  divider?: boolean;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <View
      className={`flex-row items-center justify-between py-5 ${
        divider ? "border-b border-line" : ""
      }`}
    >
      <View className="flex-1 pr-3">
        <Text variant="body">{label}</Text>
        {hint ? (
          <Text variant="caption" tone="muted">
            {hint}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center gap-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Færre ${label}`}
          disabled={atMin}
          onPress={dec}
          hitSlop={6}
          className={`h-8 w-8 items-center justify-center rounded-full border border-line bg-surfaceMuted ${
            atMin ? "opacity-40" : "active:opacity-70"
          }`}
        >
          <Icon name="remove" size="md" tone="ink" />
        </Pressable>
        <Text variant="body" className="w-6 text-center">
          {value}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Flere ${label}`}
          disabled={atMax}
          onPress={inc}
          hitSlop={6}
          className={`h-8 w-8 items-center justify-center rounded-full border border-line bg-surfaceMuted ${
            atMax ? "opacity-40" : "active:opacity-70"
          }`}
        >
          <Icon name="add" size="md" tone="ink" />
        </Pressable>
      </View>
    </View>
  );
}
