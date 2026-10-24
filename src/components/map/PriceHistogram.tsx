import { View } from "react-native";

import { colors } from "@/theme";

const BARS = 28;

// A bucketed price histogram drawn with plain Views (no svg dep). Bars whose
// bucket falls inside [low, high] render ember; the rest render as the line
// colour — the same recolour-on-drag behaviour as the "Filtre" video. Pure
// presentation over the MOCK priceNok distribution.
export function PriceHistogram({
  values,
  min,
  max,
  low,
  high,
}: {
  values: number[];
  min: number;
  max: number;
  low: number;
  high: number;
}) {
  const span = max - min || 1;
  const counts = new Array(BARS).fill(0) as number[];
  for (const v of values) {
    const i = Math.min(
      BARS - 1,
      Math.max(0, Math.floor(((v - min) / span) * BARS)),
    );
    counts[i] = (counts[i] ?? 0) + 1;
  }
  const peak = Math.max(1, ...counts);

  return (
    <View className="h-14 flex-row items-end gap-[2px]">
      {counts.map((c, i) => {
        const bucketLo = min + (i / BARS) * span;
        const bucketHi = min + ((i + 1) / BARS) * span;
        const inRange = bucketHi >= low && bucketLo <= high;
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
}
