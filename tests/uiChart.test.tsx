// Chart (src/components/ui/Chart.tsx, P8): one summary label for screen
// readers, bars from the theme (success, the last one ink), drawn once the
// card has a width, and no grow-in under reduced motion.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { BarChart } from "react-native-gifted-charts";

import { Chart } from "@/components/ui";
import { colors } from "@/theme";

jest.mock("react-native-gifted-charts", () => ({
  BarChart: jest.fn(() => null),
}));
let mockReduced = false;
jest.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => mockReduced,
}));

const barChart = BarChart as unknown as jest.Mock;
type BarProps = {
  data: { value: number; frontColor: string }[];
  parentWidth: number;
  height: number;
  maxValue: number;
  isAnimated: boolean;
};
const lastProps = () => barChart.mock.calls.at(-1)![0] as BarProps;

function layout(width: number) {
  fireEvent(screen.getByLabelText("Visninger: stolpediagram"), "layout", {
    nativeEvent: { layout: { width, height: 160, x: 0, y: 0 } },
  });
}

describe("Chart", () => {
  it("is one image with the summary label and waits for a width", () => {
    barChart.mockClear();
    render(
      <Chart
        values={[10, 50, 90]}
        accessibilityLabel="Visninger: stolpediagram"
      />,
    );
    const card = screen.getByLabelText("Visninger: stolpediagram");
    expect(card.props.accessibilityRole).toBe("image");
    expect(barChart).not.toHaveBeenCalled();
  });

  it("draws relative bars in theme colours, the last one ink", () => {
    mockReduced = false;
    barChart.mockClear();
    render(
      <Chart
        values={[10, 50, 90]}
        accessibilityLabel="Visninger: stolpediagram"
      />,
    );
    layout(324);
    const p = lastProps();
    expect(p.maxValue).toBe(100);
    expect(p.parentWidth).toBe(300); // minus 12 px padding each side
    expect(p.height).toBe(136);
    expect(p.data.map((d) => d.value)).toEqual([10, 50, 90]);
    expect(p.data.map((d) => d.frontColor)).toEqual([
      colors.success,
      colors.success,
      colors.ink,
    ]);
    expect(p.isAnimated).toBe(true);
  });

  it("keeps every bar green without highlightLast and skips the grow-in when reduced", () => {
    mockReduced = true;
    barChart.mockClear();
    render(
      <Chart
        values={[40, 60]}
        highlightLast={false}
        accessibilityLabel="Visninger: stolpediagram"
      />,
    );
    layout(200);
    const p = lastProps();
    expect(p.data.every((d) => d.frontColor === colors.success)).toBe(true);
    expect(p.isAnimated).toBe(false);
  });
});
