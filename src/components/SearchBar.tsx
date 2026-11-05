import type { ReactNode } from "react";
import { TextInput, View } from "react-native";

import { Icon } from "@/components/ui";
import { useThemeColors } from "@/theme";

// Visual search field. `onChangeText` drives local UI state only (no network
// search — that needs an approved contract). `right` renders a trailing control
// inside the field (e.g. a filter button).
export function SearchBar({
  placeholder = "Søk",
  value,
  onChangeText,
  right,
  onFocus,
  onSubmit,
  autoFocus = false,
  editable = true,
}: {
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  right?: ReactNode;
  onFocus?: () => void;
  onSubmit?: (t: string) => void;
  autoFocus?: boolean;
  editable?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5">
      <Icon name="search" size="md" tone="muted" />
      <TextInput
        className="flex-1 text-base text-ink font-normal"
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onSubmitEditing={(e) => onSubmit?.(e.nativeEvent.text)}
        autoFocus={autoFocus}
        editable={editable}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
      {right}
    </View>
  );
}
