// SearchBar (docs/design/DESIGN_SYSTEM.md §4) — the one search field. Pill
// shape (PDF p5/p9/p26), leading magnifier, built-in clear button when there
// is text, optional trailing control. Local filtering only — no network search
// (that needs an approved contract).
import type { ReactNode } from "react";
import { Pressable, TextInput, View } from "react-native";

import { fontFamilyFor } from "@/theme/fonts";
import { useThemeColors } from "@/theme";

import { Icon } from "./Icon";

export function SearchBar({
  placeholder = "Søk",
  value,
  onChangeText,
  right,
  onFocus,
  onSubmit,
  autoFocus = false,
  editable = true,
  size = "md",
  accessibilityLabel,
}: {
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  /** Trailing control inside the field (e.g. a filter button). */
  right?: ReactNode;
  onFocus?: () => void;
  onSubmit?: (t: string) => void;
  autoFocus?: boolean;
  editable?: boolean;
  /** "sm" for pickers inside sheets. */
  size?: "sm" | "md";
  accessibilityLabel?: string;
}) {
  const c = useThemeColors();
  const hasText = !!value && value.length > 0 && !!onChangeText;
  return (
    <View
      className="flex-row items-center gap-sm rounded-full border border-line bg-surface px-gutter"
      style={{ minHeight: size === "sm" ? 44 : 48 }}
    >
      <Icon name="search" size={size === "sm" ? "sm" : "md"} tone="muted" />
      <TextInput
        className="flex-1 text-ink"
        style={{
          fontFamily: fontFamilyFor("regular"),
          fontSize: size === "sm" ? 15 : 16,
          paddingVertical: 10,
        }}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onSubmitEditing={(e) => onSubmit?.(e.nativeEvent.text)}
        autoFocus={autoFocus}
        editable={editable}
        returnKeyType="search"
        accessibilityLabel={accessibilityLabel ?? placeholder}
      />
      {hasText ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tøm søk"
          hitSlop={10}
          onPress={() => onChangeText?.("")}
        >
          <Icon name="close-circle" size="md" tone="muted" />
        </Pressable>
      ) : null}
      {right}
    </View>
  );
}
