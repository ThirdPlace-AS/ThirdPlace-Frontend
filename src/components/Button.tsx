import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme";

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
const iconColor: Record<Variant, string | undefined> = {
  ember: colors.onEmber,
  ink: colors.onInk,
  secondary: colors.ink,
};

export function Button({
  label,
  onPress,
  variant = "ink",
  disabled = false,
  size = "md",
  rounded = "md",
  icon,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  size?: "md" | "lg";
  rounded?: "md" | "full";
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const pad = size === "lg" ? "px-6 py-5" : "px-5 py-4";
  const radius = rounded === "full" ? "rounded-full" : "rounded-md";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`w-full flex-row items-center justify-center gap-2 ${radius} ${pad} ${bg[variant]} ${
        disabled ? "opacity-40" : "active:opacity-80"
      }`}
    >
      {icon ? (
        <View>
          <Ionicons name={icon} size={18} color={iconColor[variant]} />
        </View>
      ) : null}
      <Text className={`text-base font-semibold ${fg[variant]}`}>{label}</Text>
    </Pressable>
  );
}
