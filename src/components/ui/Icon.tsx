// Icon (docs/design/DESIGN_SYSTEM.md §3 "Icons") — the single entry point for
// glyphs: Ionicons, plus ThirdPlace SVG glyphs ("tp-…", see ./glyphs) for the
// concepts Ionicons has no honest glyph for. Sizes and colours come from tokens only.
// Decorative by default (hidden from screen readers); the surrounding control
// carries the label.
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import { iconSize, useThemeColors, type IconSize } from "@/theme";

import { glyphs, isGlyph, type GlyphName } from "./glyphs";

export type IoniconName = ComponentProps<typeof Ionicons>["name"];
export type IconName = IoniconName | GlyphName;

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
  if (isGlyph(name)) {
    const Glyph = glyphs[name];
    return <Glyph size={iconSize[size]} color={String(color ?? c[tone])} />;
  }
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
