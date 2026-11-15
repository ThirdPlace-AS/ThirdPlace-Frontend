import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from "input-otp-native";
import { useCallback } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui";

// Six-box one-time-code entry (PDF p2: "Sjekk innboksen", "Bekreft
// identiteten"). input-otp-native (DESIGN_SYSTEM.md §4, P5) drives the boxes
// from one hidden TextInput, so paste, SMS/one-time-code autofill and
// backspace behave natively; the boxes are ours.
//
// `value` seeds the field once (the library keeps its own state); every
// change goes out through `onChange`.
export function CodeInput({
  value,
  onChange,
  length = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}) {
  // Pasted or autofilled text keeps only its digits, so "123 456" from an
  // SMS still fills all six boxes.
  const paste = useCallback(
    (t: string) => t.replace(/\D/g, "").slice(0, length),
    [length],
  );
  return (
    <OTPInput
      maxLength={length}
      defaultValue={value}
      onChange={onChange}
      pattern={REGEXP_ONLY_DIGITS}
      pasteTransformer={paste}
      // A tap focuses the field; it does not wipe what was typed.
      clearTextOnFocus={false}
      keyboardType="number-pad"
      autoFocus
      accessibilityLabel={`Kode, ${length} siffer`}
      render={({ slots }) => (
        <View className="flex-row gap-2">
          {slots.map((slot, i) => (
            <Slot key={i} {...slot} />
          ))}
        </View>
      )}
    />
  );
}

function Slot({ char, isActive }: SlotProps) {
  return (
    <View
      className={`h-14 flex-1 items-center justify-center rounded-sm border-2 bg-surface ${
        char ? "border-ink" : isActive ? "border-ink/40" : "border-line"
      }`}
    >
      <Text variant="h2" accessibilityRole="text">
        {char ?? ""}
      </Text>
    </View>
  );
}
