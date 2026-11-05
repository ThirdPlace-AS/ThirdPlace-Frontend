import { Text, TextInput, View } from "react-native";

import { colors } from "@/theme";

// Text field. Inert by default (Phase 0 shell). Pass `onChangeText` to make it a
// real, editable field for local demo state (e.g. the Add creation wizard) — no
// backend or canonical behaviour is implied either way.
export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  multiline = false,
  maxLength,
  autoFocus = false,
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  multiline?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
}) {
  const editable = typeof onChangeText === "function";
  return (
    <View className="w-full gap-1.5">
      {label ? <Text className="text-sm text-ink">{label}</Text> : null}
      <TextInput
        className={`w-full rounded-md border border-line bg-surface px-4 text-base text-ink ${
          multiline ? "min-h-24 py-3" : "py-3.5"
        }`}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        autoFocus={autoFocus}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}
