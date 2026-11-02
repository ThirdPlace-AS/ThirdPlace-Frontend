import { Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import { colors } from "@/theme";

// ThirdPlace brand mark — a location pin ("a place on the map"), drawn as a
// crisp vector so it stays sharp at every size. Provisional palette (Ember
// #D80000), not founder-approved — see docs/design/.
//
// Variants:
//  - "tile"     Ember rounded-square app-tile + white pin (default; nav, splash)
//  - "mark"     Ember pin on transparent background (inline, on light surfaces)
//  - "mono"     single-colour pin (pass `color`) for monochrome contexts
// The glyph geometry lives in a 100×100 viewBox and is shared by all variants.

type LogoVariant = "tile" | "mark" | "mono";

// Teardrop pin: rounded head centred at (50,41), tip at (50,76).
const PIN =
  "M50 18 C37 18 27 28 27 41 C27 58 50 76 50 76 C50 76 73 58 73 41 C73 28 63 18 50 18 Z";
const PIN_HEAD = { cx: 50, cy: 40, r: 8 };

export function LogoMark({
  size = 44,
  variant = "tile",
  color,
}: {
  size?: number;
  variant?: LogoVariant;
  /** Only used by the "mono" variant. Defaults to ink. */
  color?: string;
}) {
  if (variant === "mono") {
    const tone = color ?? colors.ink;
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path d={PIN} fill={tone} />
        <Circle cx={PIN_HEAD.cx} cy={PIN_HEAD.cy} r={PIN_HEAD.r} fill="#FFFFFF" />
      </Svg>
    );
  }

  if (variant === "mark") {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path d={PIN} fill={colors.ember} />
        <Circle
          cx={PIN_HEAD.cx}
          cy={PIN_HEAD.cy}
          r={PIN_HEAD.r}
          fill={colors.onEmber}
        />
      </Svg>
    );
  }

  // "tile" — Ember rounded square with a white pin and an Ember centre dot.
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={2} y={2} width={96} height={96} rx={24} fill={colors.ember} />
      <Path d={PIN} fill={colors.onEmber} />
      <Circle
        cx={PIN_HEAD.cx}
        cy={PIN_HEAD.cy}
        r={PIN_HEAD.r}
        fill={colors.ember}
      />
    </Svg>
  );
}

// Full lockup: mark + wordmark. Kept API-compatible with the previous Logo
// (size, showWordmark) so existing call sites keep working.
export function Logo({
  size = 44,
  showWordmark = true,
  variant = "tile",
  color,
}: {
  size?: number;
  showWordmark?: boolean;
  variant?: LogoVariant;
  color?: string;
}) {
  return (
    <View className="items-center gap-2">
      <LogoMark size={size} variant={variant} color={color} />
      {showWordmark ? (
        <Text
          className="text-base font-semibold text-ink"
          style={{ letterSpacing: -0.3 }}
        >
          ThirdPlace
        </Text>
      ) : null}
    </View>
  );
}

// Horizontal lockup for headers / nav: mark beside the wordmark.
export function LogoLockup({
  size = 28,
  variant = "mark",
  color,
}: {
  size?: number;
  variant?: LogoVariant;
  color?: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <LogoMark size={size} variant={variant} color={color} />
      <Text
        className="text-lg font-bold text-ink"
        style={{ letterSpacing: -0.4 }}
      >
        ThirdPlace
      </Text>
    </View>
  );
}
