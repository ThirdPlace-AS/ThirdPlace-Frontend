// Chart (docs/design/DESIGN_SYSTEM.md §4 "Charts") — one themed bar chart on
// react-native-gifted-charts. Bars are relative heights (0–100): the stats
// screens show a shape, not values, so there are no axes, rules or labels.
// Colours come from the theme (success, the last bar ink), the grow-in is off
// under reduced motion, and screen readers hear one summary label.
import { memo, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { BarChart } from "react-native-gifted-charts";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useThemeColors } from "@/theme";

const PAD = 12; // p-3
const BAR_RADIUS = 4; // radius xs

export type ChartProps = {
  /** Bar heights relative to the tallest possible bar, 0–100. */
  values: readonly number[];
  /** What the chart shows, read as one label (e.g. "Visninger: stolpediagram"). */
  accessibilityLabel: string;
  /** Height of the card, padding included. */
  height?: number;
  /** Draw the last bar in ink (the current period). Default true. */
  highlightLast?: boolean;
};

export const Chart = memo(function Chart({
  values,
  accessibilityLabel,
  height = 160,
  highlightLast = true,
}: ChartProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width) - PAD * 2;
    if (w > 0 && w !== width) setWidth(w);
  };

  const data = values.map((value, i) => ({
    value,
    frontColor:
      highlightLast && i === values.length - 1 ? colors.ink : colors.success,
  }));

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      onLayout={onLayout}
      className="overflow-hidden rounded-md border border-line bg-surface p-3"
      style={{ height }}
    >
      {width > 0 ? (
        <BarChart
          data={data}
          maxValue={100}
          height={height - PAD * 2}
          parentWidth={width}
          adjustToWidth
          initialSpacing={0}
          endSpacing={0}
          hideAxesAndRules
          hideYAxisText
          yAxisLabelWidth={0}
          xAxisLabelsHeight={0}
          disableScroll
          disablePress
          barBorderTopLeftRadius={BAR_RADIUS}
          barBorderTopRightRadius={BAR_RADIUS}
          isAnimated={!reduced}
        />
      ) : null}
    </View>
  );
});
