// Speed pass (0356): a change in Filtre renders its own section and the footer,
// not the whole sheet. Every change used to render all of it again (about 80
// chips, rows and sliders), which held the JS thread for 200–360 ms per change
// on the emulator.
import { describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MapFilterSheet } from "@/components/map/MapFilterSheet";
import {
  DEFAULT_FILTERS,
  PRICE_CEIL,
} from "@/components/map/services/mapFilters";

// Counts how often Filtre renders a checkbox row (time of day, languages,
// Åpent nå / Ledige plasser).
const mockRenders = { rows: 0 };
jest.mock("@/components/CheckboxRow", () => {
  const actual = jest.requireActual<typeof import("@/components/CheckboxRow")>(
    "@/components/CheckboxRow",
  );
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    ...actual,
    CheckboxRow: (p: Parameters<typeof actual.CheckboxRow>[0]) => {
      mockRenders.rows += 1;
      return createElement(actual.CheckboxRow, p);
    },
  };
});

type Handlers = {
  onLayout: (e: unknown) => void;
  onResponderGrant: (e: unknown) => void;
  onResponderMove: (e: unknown) => void;
  onResponderRelease: (e: unknown) => void;
};
const touch = (x: number, t: number, prevX = x, locationX?: number) => ({
  nativeEvent: { locationX, touches: [], changedTouches: [] },
  touchHistory: {
    numberActiveTouches: 1,
    indexOfSingleActiveTouch: 0,
    mostRecentTimeStamp: t,
    touchBank: [
      {
        touchActive: true,
        startPageX: 0,
        startPageY: 0,
        startTimeStamp: 0,
        currentPageX: x,
        currentPageY: 0,
        currentTimeStamp: t,
        previousPageX: prevX,
        previousPageY: 0,
        previousTimeStamp: t - 1,
      },
    ],
  },
});

function renderSheet() {
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <MapFilterSheet
        visible
        filters={DEFAULT_FILTERS}
        mode="forYou"
        savedIds={[]}
        onClose={jest.fn()}
        onApply={jest.fn()}
      />
    </SafeAreaProvider>,
  );
  act(() => {
    jest.runOnlyPendingTimers();
  });
}

describe("Filtre renders only what changed", () => {
  it("a price change renders no checkbox row again", () => {
    jest.useFakeTimers();
    renderSheet();
    let node = screen.UNSAFE_getAllByProps({
      accessibilityLabel: "Makspris",
    })[0]!;
    while (typeof node.props.onResponderMove !== "function")
      node = node.parent!;
    const track = node.props as unknown as Handlers;
    act(() => track.onLayout({ nativeEvent: { layout: { width: 528 } } }));
    const before = mockRenders.rows;
    expect(before).toBeGreaterThan(0);

    act(() => track.onResponderGrant(touch(486, 1, 486, 486)));
    for (let x = 485, t = 2; x >= 426; x -= 1, t += 1) {
      act(() => track.onResponderMove(touch(x, t, x + 1)));
    }
    act(() => track.onResponderRelease(touch(426, 70)));

    const expected =
      Math.round((PRICE_CEIL - (60 / 500) * PRICE_CEIL) / 10) * 10;
    expect(screen.getByText(`kr ${expected}`)).toBeTruthy();
    expect(mockRenders.rows).toBe(before);
    jest.useRealTimers();
  });

  it("ticking Åpent nå renders its own rows, not the others", () => {
    jest.useFakeTimers();
    renderSheet();
    const before = mockRenders.rows;
    fireEvent.press(screen.getByText("Åpent nå"));
    // Åpent nå and Ledige plasser share a section.
    expect(mockRenders.rows - before).toBeLessThanOrEqual(2);
    expect(mockRenders.rows - before).toBeGreaterThan(0);
    jest.useRealTimers();
  });
});
