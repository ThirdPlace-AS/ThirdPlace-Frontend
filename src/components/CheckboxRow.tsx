import { memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { Icon, Text } from "@/components/ui";

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
          <Icon
            name={icon as keyof typeof Ionicons.glyphMap}
            size="md"
            tone="ink"
          />
        ) : null}
        <View className="flex-1">
          <Text variant="body">{label}</Text>
          {hint ? (
            <Text variant="caption" tone="muted">
              {hint}
            </Text>
          ) : null}
        </View>
      </View>
      <View
        className={`h-6 w-6 items-center justify-center rounded-xs border ${
          checked ? "border-ember bg-ember" : "border-line bg-surface"
        }`}
      >
        {checked ? <Icon name="checkmark" size="sm" tone="onEmber" /> : null}
      </View>
    </Pressable>
  );
});
