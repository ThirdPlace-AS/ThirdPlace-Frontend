// Speed-pass review (0360): both Filtre sliders take the touch on their whole
// track, inside a sheet that scrolls. A touch that goes up or down first is
// the sheet scrolling and must not move a thumb, even a little diagonally;
// a mostly sideways drag with some drift still moves it.
import { describe, expect, it, jest } from "@jest/globals";
import { act, render } from "@testing-library/react-native";

import { RangeSlider } from "@/components/RangeSlider";
import { SteppedSlider } from "@/components/SteppedSlider";
import { DRAG_SLOP, dragIntent } from "@/components/sliderGesture";

type Pt = { x: number; y: number };
const history = (cur: Pt, prev: Pt, t: number) => ({
  numberActiveTouches: 1,
  indexOfSingleActiveTouch: 0,
  mostRecentTimeStamp: t,
  touchBank: [
    {
      touchActive: true,
      startPageX: 0,
      startPageY: 0,
      startTimeStamp: 0,
      currentPageX: cur.x,
      currentPageY: cur.y,
      currentTimeStamp: t,
      previousPageX: prev.x,
      previousPageY: prev.y,
      previousTimeStamp: t - 1,
    },
  ],
});
type Handlers = {
  onLayout: (e: unknown) => void;
  onResponderGrant: (e: unknown) => void;
  onResponderMove: (e: unknown) => void;
  onResponderRelease: (e: unknown) => void;
  onResponderTerminate: (e: unknown) => void;
};

/** A touch from `from` with `steps` moves of (sx, sy), then release or
 *  terminate (the sheet's scroll view taking the touch). */
function swipe(
  h: Handlers,
  from: Pt,
  sx: number,
  sy: number,
  steps: number,
  end: "release" | "terminate",
) {
  let t = 1;
  act(() =>
    h.onResponderGrant({
      nativeEvent: { locationX: from.x, touches: [], changedTouches: [] },
      touchHistory: history(from, from, t),
    }),
  );
  let prev = from;
  for (let i = 1; i <= steps; i += 1) {
    const cur = { x: from.x + sx * i, y: from.y + sy * i };
    t += 1;
    act(() =>
      h.onResponderMove({
        nativeEvent: { touches: [], changedTouches: [] },
        touchHistory: history(cur, prev, t),
      }),
    );
    prev = cur;
  }
  const last = {
    nativeEvent: { touches: [], changedTouches: [] },
    touchHistory: history(prev, prev, t + 1),
  };
  act(() =>
    end === "release"
      ? h.onResponderRelease(last)
      : h.onResponderTerminate(last),
  );
}

function trackOf(ui: ReturnType<typeof render>): Handlers {
  const track = ui.UNSAFE_root.findAll(
    (n) => typeof n.props.onResponderMove === "function",
  )[0]!.props as unknown as Handlers;
  act(() => track.onLayout({ nativeEvent: { layout: { width: 528 } } }));
  return track;
}

describe("dragIntent", () => {
  it("waits within the slop, then tells a drag from a scroll", () => {
    expect(dragIntent(DRAG_SLOP - 1, 1)).toBe("wait");
    expect(dragIntent(DRAG_SLOP, 1)).toBe("drag");
    expect(dragIntent(-DRAG_SLOP, 0)).toBe("drag");
    expect(dragIntent(1, DRAG_SLOP)).toBe("scroll");
    expect(dragIntent(DRAG_SLOP, DRAG_SLOP)).toBe("scroll");
    expect(dragIntent(3, -DRAG_SLOP - 2)).toBe("scroll");
  });
});

describe("the price slider in a scrolling sheet", () => {
  it("a diagonal scroll that starts on the track moves no thumb", () => {
    const onChange = jest.fn();
    const ui = render(
      <RangeSlider
        min={0}
        max={1000}
        step={10}
        low={0}
        high={1000}
        onChange={onChange}
      />,
    );
    const track = trackOf(ui);
    // Down 2 px for every 1 px sideways: a scroll, though it ends up 8 px
    // sideways (four 10 kr steps on this track) before the sheet takes it.
    swipe(track, { x: 40, y: 0 }, 1, 2, 8, "terminate");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("a sideways drag with a little drift still moves the thumb", () => {
    const onChange = jest.fn();
    const ui = render(
      <RangeSlider
        min={0}
        max={1000}
        step={10}
        low={0}
        high={1000}
        onChange={onChange}
      />,
    );
    const track = trackOf(ui);
    swipe(track, { x: 40, y: 0 }, 3, 1, 20, "release");
    expect(onChange).toHaveBeenLastCalledWith(120, 1000);
  });
});

describe("Avstand / Varighet in a scrolling sheet", () => {
  const labels = ["1 km", "5 km", "10 km", "25 km", "50 km", "Alle"];

  it("a diagonal scroll neither moves the step nor counts as a tap", () => {
    const onChange = jest.fn();
    const ui = render(
      <SteppedSlider labels={labels} index={5} onChange={onChange} />,
    );
    const track = trackOf(ui);
    // Starts over "10 km" (x 214), goes down more than sideways, ends with
    // the finger lifting (no scroll view took it).
    swipe(track, { x: 214, y: 0 }, -2, 3, 10, "release");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("a tap still jumps to the step under the finger", () => {
    const onChange = jest.fn();
    const ui = render(
      <SteppedSlider labels={labels} index={5} onChange={onChange} />,
    );
    const track = trackOf(ui);
    swipe(track, { x: 214, y: 0 }, 0, 0, 0, "release");
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
