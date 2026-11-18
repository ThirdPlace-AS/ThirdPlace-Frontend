// Input (docs/design/DESIGN_SYSTEM.md §4) — labelled text field with focus,
// error and helper states. Inert unless `onChangeText` is passed (Phase 0
// shell: no backend behaviour is implied either way).
import { useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { fontFamilyFor } from "@/theme/fonts";
import { useThemeColors } from "@/theme";

import { inputClass } from "./base/input";
import { Text } from "./Text";

/** What the field holds; it picks the keyboard and turns off the capital
 *  letter and autocorrect where they only get in the way (review 2026-11-18
 *  CMP-11, O9: "Https://" and a capitalised e-mail). Explicit props win. */
export type InputType =
  | "text"
  | "email"
  | "url"
  | "phone"
  | "password"
  | "newPassword"
  | "number"
  | "handle";

type TypeDefaults = Pick<
  TextInputProps,
  "keyboardType" | "autoCapitalize" | "autoCorrect" | "autoComplete"
>;

const TYPE_DEFAULTS: Record<InputType, TypeDefaults> = {
  text: {},
  email: {
    keyboardType: "email-address",
    autoCapitalize: "none",
    autoCorrect: false,
    autoComplete: "email",
  },
  url: {
    keyboardType: "url",
    autoCapitalize: "none",
    autoCorrect: false,
    autoComplete: "url",
  },
  phone: {
    keyboardType: "phone-pad",
    autoCapitalize: "none",
    autoCorrect: false,
    autoComplete: "tel",
  },
  password: {
    autoCapitalize: "none",
    autoCorrect: false,
    autoComplete: "password",
  },
  newPassword: {
    autoCapitalize: "none",
    autoCorrect: false,
    autoComplete: "password-new",
  },
  number: { keyboardType: "number-pad", autoCorrect: false },
  handle: { autoCapitalize: "none", autoCorrect: false },
};

export type InputProps = {
  type?: InputType;
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
  type = "text",
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
  const typed = TYPE_DEFAULTS[type];
  const [focused, setFocused] = useState(false);
  const editable = typeof onChangeText === "function";
  // Border colour per state: base/input. The 2 px emphasis border is
  // compensated in padding so the text never shifts on focus/error.
  const emphasized = !!error || focused;
  const state = error ? "error" : focused ? "focused" : "idle";
  const bw = emphasized ? 2 : 1;
  return (
    <View className="w-full gap-2">
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
        keyboardType={keyboardType ?? typed.keyboardType}
        autoComplete={autoComplete ?? typed.autoComplete}
        autoCapitalize={autoCapitalize ?? typed.autoCapitalize}
        autoCorrect={typed.autoCorrect}
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
