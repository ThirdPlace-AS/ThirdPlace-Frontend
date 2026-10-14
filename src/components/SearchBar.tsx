import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { TextInput, View } from "react-native";

import { colors } from "@/theme";

// Visual search field. `onChangeText` drives local UI state only (no network
// search — that needs an approved contract). `right` renders a trailing control
// inside the field (e.g. a filter button).
export function SearchBar({
  placeholder = "Søk",
  value,
  onChangeText,
  right,
}: {
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  right?: ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5">
      <Ionicons name="search" size={18} color={colors.muted} />
      <TextInput
        className="flex-1 text-base text-ink"
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
      {right}
    </View>
  );
}
