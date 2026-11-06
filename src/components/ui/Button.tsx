// Button (docs/design/DESIGN_SYSTEM.md §4). The one text button.
// Variants: ink (primary/confirm, PDF), ember (acquisition CTAs only:
// "Opprett konto", "Kom i gang"), secondary (grey), outline, ghost, danger.
// Loading keeps the width (label stays in layout, hidden) and blocks presses.
import { ActivityIndicator, View } from "react-native";

import { useThemeColors } from "@/theme";

import { Icon, type IconName, type IconTone } from "./Icon";
import { Pressable, type PressHaptic } from "./Pressable";
import { Text, type TextTone } from "./Text";

export type ButtonVariant =
  | "ink"
  | "ember"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

// Literal class names so Tailwind generates them.
const BG: Record<ButtonVariant, string> = {
  ink: "bg-ink",
  ember: "bg-ember",
  secondary: "bg-surfaceMuted",
  outline: "border border-line bg-surface",
  ghost: "bg-transparent",
  danger: "bg-danger",
};
const FG: Record<ButtonVariant, TextTone & IconTone> = {
  ink: "onInk",
  ember: "onEmber",
  secondary: "ink",
  outline: "ink",
  ghost: "ink",
  danger: "onEmber",
};
const HEIGHT: Record<ButtonSize, number> = { sm: 40, md: 52, lg: 60 };
const PAD: Record<ButtonSize, string> = {
  sm: "px-lg",
  md: "px-xl",
  lg: "px-xl",
};

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** "md" = 12 px corners (default, as the PDF CTAs), "full" = pill. */
  rounded?: "md" | "full";
  icon?: IconName;
  disabled?: boolean;
  /** Shows a spinner, keeps the width, ignores presses. */
  loading?: boolean;
  /** Stretch to the container width (default true, as before). */
  fullWidth?: boolean;
  haptic?: PressHaptic;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

export function Button({
  label,
  onPress,
  variant = "ink",
  size = "md",
  rounded = "md",
  icon,
  disabled = false,
  loading = false,
  fullWidth = true,
  haptic = "none",
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const c = useThemeColors();
  // Disabled reads as "not yet", not as a broken colour: filled buttons turn
  // muted grey with a muted label at full opacity (a 40 % ink fill looked
  // like white text on mid-grey).
  const off = disabled && !loading;
  const fg = off ? "muted" : FG[variant];
  const bg = off
    ? variant === "outline"
      ? BG.outline
      : variant === "ghost"
        ? BG.ghost
        : "bg-surfaceMuted"
    : BG[variant];
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: loading }}
      disabled={disabled}
      // Busy: ignore presses without the disabled dim (the spinner says busy).
      onPress={loading ? undefined : onPress}
      haptic={haptic}
      dimWhenDisabled={false}
      className={fullWidth ? "w-full" : "self-start"}
      contentClassName={`flex-row items-center justify-center gap-sm ${PAD[size]} ${
        rounded === "full" ? "rounded-full" : "rounded-md"
      } ${bg}`}
      contentStyle={{ minHeight: HEIGHT[size] }}
    >
      <View
        className="flex-row items-center gap-sm"
        style={loading ? { opacity: 0 } : undefined}
      >
        {icon ? <Icon name={icon} size="md" tone={fg} /> : null}
        <Text
          variant={size === "sm" ? "label" : "body"}
          weight="semibold"
          tone={fg}
        >
          {label}
        </Text>
      </View>
      {loading ? (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator color={c[fg]} />
        </View>
      ) : null}
    </Pressable>
  );
}
