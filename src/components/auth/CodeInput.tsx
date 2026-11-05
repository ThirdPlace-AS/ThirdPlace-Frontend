import { useRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

// Six-box one-time-code entry (PDF p2: "Sjekk innboksen", "Bekreft
// identiteten"). One hidden TextInput drives the boxes so paste, autofill
// (textContentType oneTimeCode) and backspace behave natively.
export function CodeInput({
  value,
  onChange,
  length = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}) {
  const ref = useRef<TextInput>(null);
  return (
    <Pressable
      accessibilityRole="none"
      onPress={() => ref.current?.focus()}
      className="flex-row gap-2"
    >
      {Array.from({ length }, (_, i) => {
        const ch = value[i];
        const active = i === Math.min(value.length, length - 1);
        return (
          <View
            key={i}
            className={`h-14 flex-1 items-center justify-center rounded-xl border-2 bg-surface ${
              ch ? "border-ink" : active ? "border-ink/40" : "border-line"
            }`}
          >
            <Text className="text-xl font-semibold text-ink">{ch ?? ""}</Text>
          </View>
        );
      })}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus
        accessibilityLabel={`Kode, ${length} siffer`}
        className="absolute h-px w-px opacity-0"
      />
    </Pressable>
  );
}
