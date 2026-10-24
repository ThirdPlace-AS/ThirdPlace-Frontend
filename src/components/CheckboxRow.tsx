import { memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme";

// A labelled checkbox row (used by the filter sheet's "Tid på dagen", "Språk"
// and "Tilgjengelighetsfunksjoner" sections). Square box, ember check when on.
// Memoized so unaffected rows don't re-render when a sibling section changes.
export const CheckboxRow = memo(function CheckboxRow({
  label,
  hint,
  icon,
  checked,
  onToggle,
  divider = false,
}: {
  label: string;
  hint?: string;
  icon?: string; // optional leading Ionicons glyph
  checked: boolean;
  onToggle: () => void;
  // Draws a hairline under the row to separate dense checkbox lists.
  divider?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={onToggle}
      className={`flex-row items-center justify-between py-3 ${
        divider ? "border-b border-line" : ""
      }`}
    >
      <View className="flex-1 flex-row items-center gap-3 pr-3">
        {icon ? (
          <Ionicons
            name={icon as keyof typeof Ionicons.glyphMap}
            size={20}
            color={colors.ink}
          />
        ) : null}
        <View className="flex-1">
          <Text className="text-base text-ink">{label}</Text>
          {hint ? <Text className="text-xs text-muted">{hint}</Text> : null}
        </View>
      </View>
      <View
        className={`h-6 w-6 items-center justify-center rounded border ${
          checked ? "border-ember bg-ember" : "border-line bg-surface"
        }`}
      >
        {checked ? (
          <Ionicons name="checkmark" size={16} color={colors.onEmber} />
        ) : null}
      </View>
    </Pressable>
  );
});
