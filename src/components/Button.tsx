import { Pressable, Text } from "react-native";

type Variant = "ember" | "ink" | "secondary";

const bg: Record<Variant, string> = {
  ember: "bg-ember",
  ink: "bg-ink",
  secondary: "bg-surfaceMuted",
};
const fg: Record<Variant, string> = {
  ember: "text-onEmber",
  ink: "text-onInk",
  secondary: "text-ink",
};

export function Button({
  label,
  onPress,
  variant = "ink",
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`w-full items-center rounded-md px-5 py-4 ${bg[variant]} ${
        disabled ? "opacity-40" : "active:opacity-80"
      }`}
    >
      <Text className={`text-base font-semibold ${fg[variant]}`}>{label}</Text>
    </Pressable>
  );
}
