import { Text, TextInput, View } from "react-native";

// Visual-only input (Phase 0 shell). Inert by default — no form state or
// submission is wired (no backend / no canonical behavior).
export function Input({
  label,
  placeholder,
  value,
  secureTextEntry,
  keyboardType,
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
}) {
  return (
    <View className="w-full gap-1.5">
      {label ? <Text className="text-sm text-ink">{label}</Text> : null}
      <TextInput
        className="w-full rounded-md border border-line bg-surface px-4 py-3.5 text-base text-ink"
        placeholder={placeholder}
        placeholderTextColor="#6B6B6B"
        value={value}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={false}
      />
    </View>
  );
}
