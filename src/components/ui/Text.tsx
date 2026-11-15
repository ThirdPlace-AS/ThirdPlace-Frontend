// Text primitive (docs/design/DESIGN_SYSTEM.md §3 "Typography").
// Use `variant` for size/line-height and `tone` for colour instead of raw
// `text-sm`/`text-[11px]`/`font-bold` classes. Weight picks the font family
// (custom fonts need one family per weight on Android).
import { useContext } from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { useTextScale } from "@/lib/a11yPrefs";
import { fontSizes } from "@/theme";
import { fontFamilyFor, type FontWeight } from "@/theme/fonts";

import {
  TextClassContext,
  textVariants,
  type TextTone,
  type TextVariant,
} from "./base/text";

export type { TextTone, TextVariant };

const DEFAULT_WEIGHT: Record<TextVariant, FontWeight> = {
  display: "bold",
  h1: "bold",
  h2: "semibold",
  title: "semibold",
  body: "regular",
  label: "medium",
  caption: "regular",
  micro: "medium",
};

// Size and line height per variant (tokens.js fontSize), for "Større tekst"
// (Tilgjengelighet, Phase 15): the class sets the normal size, a style scales
// it. The phone's own font size still applies on top (allowFontScaling).
const px = (v: string | undefined) => parseFloat(v ?? "0");
function scaled(variant: TextVariant, scale: number) {
  const [size, meta] = fontSizes[variant] ?? ["16px", {}];
  return {
    fontSize: px(size) * scale,
    lineHeight: px(meta.lineHeight) * scale || undefined,
  };
}

/** Headings get the header role by default so screen readers can jump between them. */
const HEADING: ReadonlySet<TextVariant> = new Set(["display", "h1", "h2"]);

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  weight?: FontWeight;
  tone?: TextTone;
  className?: string;
};

export function Text({
  variant = "body",
  weight,
  tone,
  className,
  style,
  accessibilityRole,
  ...rest
}: TextProps) {
  const fontFamily = fontFamilyFor(weight ?? DEFAULT_WEIGHT[variant]);
  const scale = useTextScale();
  // An explicit tone wins; else the colour a parent component set (base
  // TextClassContext); else ink.
  const contextTone = useContext(TextClassContext);
  return (
    <RNText
      accessibilityRole={
        accessibilityRole ?? (HEADING.has(variant) ? "header" : undefined)
      }
      className={`${textVariants({ variant, tone: tone ?? contextTone })}${
        className ? ` ${className}` : ""
      }`}
      style={[
        scale === 1
          ? { fontFamily }
          : { fontFamily, ...scaled(variant, scale) },
        style,
      ]}
      {...rest}
    />
  );
}
