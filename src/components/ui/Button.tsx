// Button (docs/design/DESIGN_SYSTEM.md §4). The one text button.
// Variants: ink (primary/confirm, PDF), ember (main brand CTA: Airbnb's pink
// gradient #E61E4D → #E31C5F → #D70466 with white text, founder 2026-11-06),
// secondary (grey), outline, ghost, danger.
// Loading keeps the width (label stays in layout, hidden) and blocks presses.
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { brandGradient, useThemeColors } from "@/theme";

import {
  buttonHeight,
  buttonTone,
  buttonClass,
  type ButtonSize,
  type ButtonVariant,
} from "./base/button";
import { TextClassContext } from "./base/text";
import { Icon, type IconName } from "./Icon";
import { Pressable } from "./Pressable";
import { Text } from "./Text";

export type { ButtonSize, ButtonVariant };

const TOUCH_SLOP: Record<ButtonSize, number | undefined> = {
  sm: Math.ceil((48 - buttonHeight.sm) / 2),
  md: undefined,
  lg: undefined,
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
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const c = useThemeColors();
  // Disabled reads as "not yet", not as a broken colour: filled buttons turn
  // muted grey with a muted label at full opacity (a 40 % ink fill looked
  // like white text on mid-grey).
  const off = disabled && !loading;
  const fg = off ? "muted" : buttonTone[variant];
  const fill =
    off && variant !== "outline" && variant !== "ghost" ? "muted" : variant;
  const gradient = variant === "ember" && !off;
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
      dimWhenDisabled={false}
      // A small button still takes a 48 dp touch (review 2026-11-18 CMP-04).
      hitSlop={TOUCH_SLOP[size]}
      className={fullWidth ? "w-full" : "self-start"}
      contentClassName={buttonClass({ size, rounded, fill })}
      contentStyle={{ minHeight: buttonHeight[size] }}
    >
      {gradient ? (
        <LinearGradient
          colors={brandGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      <View
        className="flex-row items-center gap-2"
        style={loading ? { opacity: 0 } : undefined}
      >
        {icon ? <Icon name={icon} size="md" tone={fg} /> : null}
        <TextClassContext.Provider value={fg}>
          <Text variant={size === "sm" ? "label" : "body"} weight="medium">
            {label}
          </Text>
        </TextClassContext.Provider>
      </View>
      {loading ? (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator color={c[fg]} />
        </View>
      ) : null}
    </Pressable>
  );
}
