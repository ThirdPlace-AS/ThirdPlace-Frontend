// Speed pass (0356): Filtre's price slider. The whole track takes the touch, so
// the top thumb, which rests partly inside Android's back-gesture zone, can be
// dragged from further in. While a thumb is dragged, `onSlide` hears every step
// (the price labels and the histogram follow it) and `onChange` commits at most
// every `reportEveryMs`, always with the last step when the finger lifts or the
// sheet takes the touch: every commit re-renders Filtre and recounts.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  RangeSlider,
  createReporter,
  thumbFor,
} from "@/components/RangeSlider";
import { MapFilterSheet } from "@/components/map/MapFilterSheet";
import {
  DEFAULT_FILTERS,
  PRICE_CEIL,
} from "@/components/map/services/mapFilters";

type Bank = { x: number; t: number; prevX: number };
const history = ({ x, t, prevX }: Bank) => ({
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
});
const touch = (x: number, t: number, prevX = x, locationX?: number) => ({
  nativeEvent: { locationX, touches: [], changedTouches: [] },
  touchHistory: history({ x, t, prevX }),
});

type Handlers = {
  onLayout: (e: unknown) => void;
  onResponderGrant: (e: unknown) => void;
  onResponderMove: (e: unknown) => void;
  onResponderRelease: (e: unknown) => void;
  onResponderTerminate: (e: unknown) => void;
};
type Slide = { low: number; high: number } | null;

/** Renders the slider (0 to 1000) on a 528 px row: the thumbs travel 500 px. */
function slider(props: {
  low: number;
  high: number;
  step: number;
  minGap?: number;
  reportEveryMs?: number;
}) {
  const onChange = jest.fn<(low: number, high: number) => void>();
  const onSlide = jest.fn<(value: Slide) => void>();
  const ui = render(
    <RangeSlider
      min={0}
      max={1000}
      step={props.step}
      minGap={props.minGap ?? props.step}
      low={props.low}
      high={props.high}
      reportEveryMs={props.reportEveryMs}
      onChange={onChange}
      onSlide={onSlide}
    />,
  );
  const track = ui.UNSAFE_root.findAll(
    (n) => typeof n.props.onResponderMove === "function",
  )[0]!.props as unknown as Handlers;
  act(() => track.onLayout({ nativeEvent: { layout: { width: 528 } } }));
  return { ui, track, onChange, onSlide };
}

/** Touch down at `from` (px from the row's left edge), one-pixel moves to
 *  `to` with `msPerPx` of time per move. */
function press(h: Handlers, from: number, to: number, msPerPx = 0) {
  let t = 1;
  act(() => h.onResponderGrant(touch(from, t, from, from)));
  let prev = from;
  const dir = to > from ? 1 : -1;
  for (let x = from + dir; dir > 0 ? x <= to : x >= to; x += dir) {
    t += 1;
    act(() => h.onResponderMove(touch(x, t, prev)));
    if (msPerPx > 0) act(() => jest.advanceTimersByTime(msPerPx));
    prev = x;
  }
  return { at: prev, t: t + 1 };
}
function lift(h: Handlers, end: { at: number; t: number }, how = "release") {
  act(() =>
    how === "release"
      ? h.onResponderRelease(touch(end.at, end.t, end.at))
      : h.onResponderTerminate(touch(end.at, end.t, end.at)),
  );
}
function drag(h: Handlers, from: number, to: number, msPerPx = 0) {
  lift(h, press(h, from, to, msPerPx));
}

afterEach(() => {
  jest.useRealTimers();
});

describe("which thumb a touch moves", () => {
  it("moves the nearer thumb", () => {
    expect(thumbFor(100, 0, 500)).toBe("low");
    expect(thumbFor(460, 0, 500)).toBe("high");
  });

  it("lets the first move decide while the thumbs overlap", () => {
    expect(thumbFor(245, 240, 250)).toBe("either");
    expect(thumbFor(200, 240, 250)).toBe("low");
    expect(thumbFor(290, 240, 250)).toBe("high");
  });
});

describe("commits during a drag", () => {
  it("passes the first value on at once and the latest after the wait", () => {
    jest.useFakeTimers();
    const send = jest.fn();
    const r = createReporter(send, 100);
    r.push(0, 900);
    r.push(0, 890);
    r.push(0, 880);
    expect(send.mock.calls).toEqual([[0, 900]]);
    jest.advanceTimersByTime(100);
    expect(send.mock.calls).toEqual([
      [0, 900],
      [0, 880],
    ]);
    r.flush();
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("sends what is waiting on flush and drops it on cancel", () => {
    jest.useFakeTimers();
    const send = jest.fn();
    const r = createReporter(send, 100);
    r.push(0, 900);
    r.push(0, 800);
    r.flush();
    expect(send.mock.calls).toEqual([
      [0, 900],
      [0, 800],
    ]);
    r.push(0, 700);
    r.cancel();
    jest.advanceTimersByTime(200);
    expect(send).toHaveBeenCalledTimes(2);
  });
});

describe("the range slider", () => {
  it("moves the top thumb from a touch further in on the track", () => {
    const { track, onChange } = slider({ low: 0, high: 1000, step: 100 });
    // The top thumb's centre is at 514 px; the touch goes down at 450.
    drag(track, 450, 250);
    expect(onChange).toHaveBeenLastCalledWith(0, 600);
    expect(onChange.mock.calls.every(([low]) => low === 0)).toBe(true);
  });

  it("moves the bottom thumb from a touch near it", () => {
    const { track, onChange } = slider({ low: 0, high: 1000, step: 100 });
    drag(track, 40, 140);
    expect(onChange).toHaveBeenLastCalledWith(200, 1000);
    expect(onChange.mock.calls.every(([, high]) => high === 1000)).toBe(true);
  });

  it("lets the first move pick the thumb while the thumbs overlap", () => {
    const right = slider({ low: 500, high: 520, step: 10 });
    drag(right.track, 269, 319);
    expect(right.onChange).toHaveBeenLastCalledWith(500, 620);
    right.ui.unmount();
    const left = slider({ low: 500, high: 520, step: 10 });
    drag(left.track, 269, 219);
    expect(left.onChange).toHaveBeenLastCalledWith(400, 520);
  });

  it("commits every step it reaches when no wait is set", () => {
    const { track, onChange } = slider({ low: 0, high: 1000, step: 10 });
    // 50 px down from the top thumb: ten 10-step moves, 990 to 900.
    drag(track, 486, 436);
    expect(onChange.mock.calls.map(([, high]) => high)).toEqual([
      990, 980, 970, 960, 950, 940, 930, 920, 910, 900,
    ]);
  });

  it("commits at most every reportEveryMs during a drag, the last step on release", () => {
    jest.useFakeTimers();
    const { track, onChange, onSlide } = slider({
      low: 0,
      high: 1000,
      step: 10,
      reportEveryMs: 100,
    });
    // 240 px at 5 ms a pixel: a new step every 25 ms for 1.2 s.
    drag(track, 486, 246, 5);
    const highs = onChange.mock.calls.map(([, high]) => high);
    expect(highs.length).toBeGreaterThanOrEqual(10);
    expect(highs.length).toBeLessThanOrEqual(15);
    expect(new Set(highs).size).toBe(highs.length);
    expect(highs[highs.length - 1]).toBe(520);
    // The followers heard all 48 steps, then the end of the drag.
    expect(onSlide).toHaveBeenCalledTimes(49);
    expect(onSlide).toHaveBeenLastCalledWith(null);
  });

  it("commits the last step when the sheet takes the touch", () => {
    jest.useFakeTimers();
    const { track, onChange, onSlide } = slider({
      low: 0,
      high: 1000,
      step: 10,
      reportEveryMs: 100,
    });
    lift(track, press(track, 486, 436), "terminate");
    expect(onChange.mock.calls).toEqual([
      [0, 990],
      [0, 900],
    ]);
    expect(onSlide).toHaveBeenLastCalledWith(null);
  });

  it("changes nothing on a tap or a vertical scroll", () => {
    const { track, onChange, onSlide } = slider({
      low: 0,
      high: 1000,
      step: 10,
    });
    drag(track, 300, 300);
    lift(track, press(track, 300, 302), "terminate");
    expect(onChange).not.toHaveBeenCalled();
    expect(onSlide).not.toHaveBeenCalled();
  });

  it("keeps the screen reader's adjust actions on each thumb", () => {
    const { ui, onChange } = slider({ low: 0, high: 1000, step: 10 });
    const top = ui.UNSAFE_root.findAll(
      (n) => n.props.accessibilityLabel === "Makspris",
    )[0]!;
    act(() =>
      top.props.onAccessibilityAction({
        nativeEvent: { actionName: "decrement" },
      }),
    );
    expect(onChange).toHaveBeenLastCalledWith(0, 990);
  });
});

describe("Filtre's price", () => {
  it("shows the price as it is dragged and recounts only when a commit is due", () => {
    jest.useFakeTimers();
    const count = jest.fn((_draft: unknown) => 7);
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
          count={count}
          onClose={jest.fn()}
          onApply={jest.fn()}
        />
      </SafeAreaProvider>,
    );
    act(() => {
      jest.runOnlyPendingTimers();
    });
    // The price track is the touch target around the "Makspris" thumb.
    let node = screen.UNSAFE_getAllByProps({
      accessibilityLabel: "Makspris",
    })[0]!;
    while (typeof node.props.onResponderMove !== "function")
      node = node.parent!;
    const track = node.props as unknown as Handlers;
    act(() => track.onLayout({ nativeEvent: { layout: { width: 528 } } }));
    expect(screen.getByText(`kr ${PRICE_CEIL} +`)).toBeTruthy();
    const before = count.mock.calls.length;

    // 60 px down from the top: twenty-odd 10 kr steps, no time passing; the
    // labels catch up 80 ms later, the count only when a commit is due.
    const end = press(track, 486, 426);
    act(() => jest.advanceTimersByTime(80));
    const expected =
      Math.round((PRICE_CEIL - (60 / 500) * PRICE_CEIL) / 10) * 10;
    expect(screen.getByText(`kr ${expected}`)).toBeTruthy();
    // Only the first step was committed so far.
    expect(count.mock.calls.length - before).toBe(1);

    lift(track, end);
    expect(count.mock.calls.length - before).toBe(2);
    expect(count).toHaveBeenLastCalledWith(
      expect.objectContaining({ priceMin: 0, priceMax: expected }),
    );
    expect(screen.getByText(`kr ${expected}`)).toBeTruthy();
  });
});
