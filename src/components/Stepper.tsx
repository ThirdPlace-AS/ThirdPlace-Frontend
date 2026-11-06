import { View } from "react-native";

import { IconButton, Text } from "@/components/ui";

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
        <IconButton
          icon="remove"
          label={`Færre ${label}`}
          variant="filled"
          size="sm"
          disabled={atMin}
          onPress={dec}
        />
        <Text variant="body" className="w-6 text-center">
          {value}
        </Text>
        <IconButton
          icon="add"
          label={`Flere ${label}`}
          variant="filled"
          size="sm"
          disabled={atMax}
          onPress={inc}
        />
      </View>
    </View>
  );
}
