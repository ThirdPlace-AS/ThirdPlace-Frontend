import { memo, useMemo } from "react";
import { View } from "react-native";

import { useThemeColors } from "@/theme";

const BARS = 28;

/** Whether bar `i` falls inside the picked range (lit). */
function bucketInRange(
  i: number,
  min: number,
  span: number,
  low: number,
  high: number,
): boolean {
  const bucketLo = min + (i / BARS) * span;
  const bucketHi = min + ((i + 1) / BARS) * span;
  return bucketHi >= low && bucketLo <= high;
}

type Props = {
  values: number[];
  min: number;
  max: number;
  low: number;
  high: number;
};

/** Same bars, lit the same way: nothing to draw again. */
export function sameLitBars(a: Props, b: Props): boolean {
  if (a.values !== b.values || a.min !== b.min || a.max !== b.max) return false;
  const span = a.max - a.min || 1;
  for (let i = 0; i < BARS; i += 1) {
    if (
      bucketInRange(i, a.min, span, a.low, a.high) !==
      bucketInRange(i, b.min, span, b.low, b.high)
    )
      return false;
  }
  return true;
}

// A bucketed price histogram drawn with plain Views (no svg dep). Bars whose
// bucket falls inside [low, high] render ember; the rest render as the line
// colour — the same recolour-on-drag behaviour as the "Filtre" video. Pure
// presentation over the MOCK priceNok distribution.
//
// Speed pass (0356): the price labels follow every 10 kr step of a drag, so the
// histogram counts its buckets once and renders again only when the run of lit
// bars changes (about every sixth step), not at every step.
export const PriceHistogram = memo(function PriceHistogram({
  values,
  min,
  max,
  low,
  high,
}: Props) {
  const colors = useThemeColors();
  const span = max - min || 1;
  const { counts, peak } = useMemo(() => {
    const c = new Array(BARS).fill(0) as number[];
    for (const v of values) {
      const i = Math.min(
        BARS - 1,
        Math.max(0, Math.floor(((v - min) / (max - min || 1)) * BARS)),
      );
      c[i] = (c[i] ?? 0) + 1;
    }
    return { counts: c, peak: Math.max(1, ...c) };
  }, [values, min, max]);

  return (
    <View className="h-14 flex-row items-end gap-[2px]">
      {counts.map((c, i) => {
        const inRange = bucketInRange(i, min, span, low, high);
        const h = c === 0 ? 2 : 6 + (c / peak) * 44;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: h,
              borderRadius: 2,
              backgroundColor: inRange ? colors.ember : colors.line,
            }}
          />
        );
      })}
    </View>
  );
}, sameLitBars);
