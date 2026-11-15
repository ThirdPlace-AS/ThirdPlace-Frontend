// Input (docs/design/DESIGN_SYSTEM.md §4) — labelled text field with focus,
// error and helper states. Inert unless `onChangeText` is passed (Phase 0
// shell: no backend behaviour is implied either way).
import { useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { fontFamilyFor } from "@/theme/fonts";
import { useThemeColors } from "@/theme";

import { inputClass } from "./base/input";
import { Text } from "./Text";

export type InputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoComplete?: TextInputProps["autoComplete"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  multiline?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  /** Error message: red border + message under the field. */
  error?: string;
  /** Helper text under the field (hidden while an error shows). */
  helper?: string;
};

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoComplete,
  autoCapitalize,
  multiline = false,
  maxLength,
  autoFocus = false,
  error,
  helper,
}: InputProps) {
  const c = useThemeColors();
  const [focused, setFocused] = useState(false);
  const editable = typeof onChangeText === "function";
  // Border colour per state: base/input. The 2 px emphasis border is
  // compensated in padding so the text never shifts on focus/error.
  const emphasized = !!error || focused;
  const state = error ? "error" : focused ? "focused" : "idle";
  const bw = emphasized ? 2 : 1;
  return (
    <View className="w-full gap-1.5">
      {label ? (
        <Text variant="label" weight="medium">
          {label}
        </Text>
      ) : null}
      <TextInput
        className={inputClass({ state })}
        style={[
          {
            fontFamily: fontFamilyFor("regular"),
            fontSize: 16,
            borderWidth: bw,
            paddingHorizontal: 16 - (bw - 1),
            paddingVertical: (multiline ? 12 : 14) - (bw - 1),
          },
          // The design system's 56 px field; multiline grows from 96.
          { minHeight: multiline ? 96 : 56 },
        ]}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={editable}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        maxLength={maxLength}
        autoFocus={autoFocus}
        textAlignVertical={multiline ? "top" : "center"}
        accessibilityLabel={label ?? placeholder}
        accessibilityHint={error ?? helper}
        accessibilityState={{ disabled: !editable }}
      />
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" tone="muted">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
