// Icon (docs/design/DESIGN_SYSTEM.md §3 "Icons") — the single entry point for
// glyphs. Ionicons today; ThirdPlace-specific SVG glyphs slot in here later
// without touching call sites. Sizes and colours come from tokens only.
// Decorative by default (hidden from screen readers); the surrounding control
// carries the label.
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import { iconSize, useThemeColors, type IconSize } from "@/theme";

export type IconName = ComponentProps<typeof Ionicons>["name"];

export type IconTone =
  | "ink"
  | "muted"
  | "onInk"
  | "ember"
  | "onEmber"
  | "success"
  | "danger"
  | "warning"
  | "onMedia";

export type IconProps = {
  name: IconName;
  size?: IconSize;
  tone?: IconTone;
  /** Escape hatch for animated/interpolated colours only. */
  color?: string;
};

export function Icon({ name, size = "lg", tone = "ink", color }: IconProps) {
  const c = useThemeColors();
  return (
    <Ionicons
      name={name}
      size={iconSize[size]}
      color={color ?? c[tone]}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}
