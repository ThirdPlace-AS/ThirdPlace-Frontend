import { memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

import { colors } from "@/theme";

// Icon + label pill for the "Opplevelsestype" / "Passer for" grids. Selected =
// ink ring (outlined, not filled) to match the "Filtre" video. Unselected = line
// border. Kept distinct from the solid-fill <Chip> used elsewhere.
// Memoized so unaffected chips don't re-render when a sibling section changes.
export const TypeChip = memo(function TypeChip({
  label,
  icon,
  selected = false,
  onPress,
}: {
  label: string;
  icon: string; // Ionicons glyph name (validated at call sites via fixtures)
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      className={`flex-row items-center gap-2 rounded-full border bg-surface px-4 py-2.5 ${
        selected ? "border-2 border-ink" : "border border-line"
      }`}
    >
      <Ionicons
        name={icon as keyof typeof Ionicons.glyphMap}
        size={18}
        color={selected ? colors.ink : colors.muted}
      />
      <Text
        className={`text-sm ${selected ? "font-semibold text-ink" : "text-ink"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
});
