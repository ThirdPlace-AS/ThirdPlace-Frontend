// Documented interop boundary: this is the standard PanResponder gesture
// pattern. The refs (drag-start values, measured track width, dragging flag,
// the report timer) are READ only inside PanResponder event callbacks, timers
// and effects and WRITTEN only from events (grant/move/release/layout) — never
// during render. The react-hooks/refs heuristic can't see that the closures
// passed to PanResponder.create don't run at render time, so it is disabled for
// this file. react-hooks/immutability is likewise disabled: the thumb shared
// values are intentionally driven from BOTH the sync effect (prop → spring) and
// the gesture callbacks (finger-follow), guarded by the `dragging` ref so the
// two never fight — a valid Reanimated pattern the rule can't model.
/* eslint-disable react-hooks/refs, react-hooks/immutability */
import { memo, useEffect, useRef, useState } from "react";
import { type LayoutChangeEvent, PanResponder, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { motion, useThemeColors, elevation } from "@/theme";

const THUMB = 28; // thumb diameter (px)
// Horizontal travel (dp) before a touch counts as a drag (as in SteppedSlider):
// a vertical scroll that starts on the slider moves no thumb.
const DRAG_SLOP = 4;

function snap(value: number, min: number, max: number, step: number): number {
  const stepped = Math.round((value - min) / step) * step + min;
  return Math.min(max, Math.max(min, stepped));
}

/** Which thumb a touch at `x` on the track moves (all in px along the track):
 *  the nearer one, or "either" while the thumbs overlap, when the first move
 *  decides (right: the top thumb, left: the bottom one). */
export function thumbFor(
  x: number,
  lowX: number,
  highX: number,
): "low" | "high" | "either" {
  if (highX - lowX < THUMB) {
    if (x < lowX - THUMB / 2) return "low";
    if (x > highX + THUMB / 2) return "high";
    return "either";
  }
  return Math.abs(x - lowX) <= Math.abs(x - highX) ? "low" : "high";
}

/** Passes values on at most every `everyMs`: the first at once, a later one
 *  when the wait is over (the latest by then wins), and whatever is waiting
 *  on `flush()`. `cancel()` drops it. */
export function createReporter(
  send: (low: number, high: number) => void,
  everyMs: number,
) {
  let pending: { low: number; high: number } | null = null;
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const stopTimer = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };
  const flush = () => {
    stopTimer();
    const next = pending;
    if (next === null) return;
    pending = null;
    last = Date.now();
    send(next.low, next.high);
  };
  return {
    push(low: number, high: number) {
      pending = { low, high };
      const wait = last + everyMs - Date.now();
      if (wait <= 0) flush();
      else if (timer === null) timer = setTimeout(flush, wait);
    },
    flush,
    cancel() {
      stopTimer();
      pending = null;
    },
  };
}

// Thumb geometry; colours come from the theme inside the component.
const thumbShape = {
  position: "absolute" as const,
  width: THUMB,
  height: THUMB,
  borderRadius: THUMB / 2,
  borderWidth: 1,
  ...elevation.e1,
};

// Dual-handle range slider for "Pris per gjest". PanResponder-based so it works
// on web + native without gesture-handler root wiring. The whole track takes
// the touch, as in SteppedSlider (speed pass 0356): the top thumb rests at the
// right end, partly inside Android's back-gesture zone, so a drag begun on it
// could close Filtre instead; a drag that starts anywhere on the track moves
// the nearer thumb by the finger's travel, without jumping, and a tap changes
// nothing. The thumb position lives in a reanimated shared value so it glides
// under the finger during the drag and springs to the committed (snapped)
// position on release, while the COMMITTED value stays snapped to `step`.
// `onSlide` hears every step a drag reaches (for cheap followers such as the
// price labels) and `null` when the drag ends; `onChange` commits the value,
// during a drag at most every `reportEveryMs` (speed pass 0356: Filtre
// re-renders its whole body and recounts on every commit) and always with the
// last step when the finger lifts or the sheet takes the touch. A screen
// reader's adjust actions commit at once. Reduced-motion-safe: springs
// collapse to instant sets when the OS setting is on. Memoised: while a drag's
// followers re-render at every step, the slider itself (its thumbs are
// Reanimated views) renders again only when its committed value changes.
function RangeSliderBody({
  min,
  max,
  step = 1,
  low,
  high,
  onChange,
  onSlide,
  minGap = step,
  reportEveryMs = 0,
}: {
  min: number;
  max: number;
  step?: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  onSlide?: (value: { low: number; high: number } | null) => void;
  minGap?: number;
  /** During a drag, commit at most this often (fixed at mount; 0 = every step). */
  reportEveryMs?: number;
}) {
  const colors = useThemeColors();
  const thumbBase = {
    ...thumbShape,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.line,
  };
  const [trackW, setTrackW] = useState(0);
  const trackWRef = useRef(0);
  // Where the touch went down on the track, whether it has become a drag, and
  // which thumb it moves (decided on the first move).
  const startX = useRef(0);
  const moved = useRef(false);
  const active = useRef<"low" | "high" | null>(null);
  const startLow = useRef(low);
  const startHigh = useRef(high);
  const dragging = useRef(false);
  // The step a move last reached: a move that stays on the same step reports
  // nothing (speed pass 0347: Filtre recounted the whole list on every finger
  // move).
  const sentLow = useRef(low);
  const sentHigh = useRef(high);

  const reduced = useReducedMotion();
  const lowX = useSharedValue(0);
  const highX = useSharedValue(0);
  const lowScale = useSharedValue(1);
  const highScale = useSharedValue(1);

  const span = max - min || 1;
  const toX = (v: number) => ((v - min) / span) * trackW;

  // Keep the thumbs in sync with props whenever we're NOT mid-drag (keyboard /
  // a11y adjustments, external resets, initial layout).
  useEffect(() => {
    if (dragging.current) return;
    const lx = toX(low);
    const hx = toX(high);
    lowX.value = reduced ? lx : withSpring(lx, motion.spring.snappy);
    highX.value = reduced ? hx : withSpring(hx, motion.spring.snappy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [low, high, trackW, reduced]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width - THUMB;
    trackWRef.current = w;
    setTrackW(w);
  };

  // Latest props for the gesture callbacks. The PanResponder is created ONCE
  // (below): a responder rebuilt on every render — and onChange re-renders the
  // parent during the drag — loses its accumulated gestureState, so g.dx would
  // be only the latest move delta and the thumb would stutter back to the start.
  const latest = useRef({
    low,
    high,
    min,
    max,
    step,
    minGap,
    onChange,
    onSlide,
    reduced,
  });
  latest.current = {
    low,
    high,
    min,
    max,
    step,
    minGap,
    onChange,
    onSlide,
    reduced,
  };
  const xOf = (v: number) => {
    const p = latest.current;
    return ((v - p.min) / (p.max - p.min || 1)) * trackWRef.current;
  };
  const rawFrom = (start: number, dx: number) => {
    const p = latest.current;
    return start + (dx / (trackWRef.current || 1)) * (p.max - p.min || 1);
  };
  const settle = (sv: typeof lowX, x: number) => {
    sv.value = latest.current.reduced ? x : withSpring(x, motion.spring.snappy);
  };

  const press = (s: typeof lowScale) => {
    s.value = latest.current.reduced
      ? 1
      : withSpring(1.2, motion.spring.snappy);
  };
  const release = (s: typeof lowScale) => {
    s.value = latest.current.reduced ? 1 : withSpring(1, motion.spring.snappy);
  };

  // The steps a drag reaches go to onChange through this, at most every
  // reportEveryMs. Made once; it reads the latest onChange when it sends.
  const [reporter] = useState(() =>
    createReporter((lo, hi) => latest.current.onChange(lo, hi), reportEveryMs),
  );
  // A new step during a drag: the followers hear it at once, the commit waits
  // its turn.
  const reach = (lo: number, hi: number) => {
    latest.current.onSlide?.({ low: lo, high: hi });
    reporter.push(lo, hi);
  };
  // A report still waiting when the slider goes away is dropped with it.
  useEffect(() => () => reporter.cancel(), [reporter]);

  // Finger up, or the sheet / the system took the touch: the last step goes
  // out and the moved thumb springs onto it.
  const end = () => {
    reporter.flush();
    const p = latest.current;
    if (moved.current) {
      dragging.current = false;
      p.onSlide?.(null);
      if (active.current === "low") {
        release(lowScale);
        settle(lowX, xOf(Math.min(sentLow.current, p.high - p.minGap)));
      } else if (active.current === "high") {
        release(highScale);
        settle(highX, xOf(Math.max(sentHigh.current, p.low + p.minGap)));
      }
    }
    moved.current = false;
    active.current = null;
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const p = latest.current;
        const w = trackWRef.current || 1;
        startX.current = Math.max(
          0,
          Math.min(w, e.nativeEvent.locationX - THUMB / 2),
        );
        moved.current = false;
        active.current = null;
        startLow.current = p.low;
        startHigh.current = p.high;
        sentLow.current = p.low;
        sentHigh.current = p.high;
      },
      onPanResponderMove: (_e, g) => {
        const p = latest.current;
        if (!moved.current) {
          if (Math.abs(g.dx) < DRAG_SLOP) return;
          moved.current = true;
          dragging.current = true;
          const pick = thumbFor(
            startX.current,
            xOf(startLow.current),
            xOf(startHigh.current),
          );
          active.current =
            pick === "either" ? (g.dx > 0 ? "high" : "low") : pick;
          press(active.current === "low" ? lowScale : highScale);
        }
        if (active.current === "low") {
          const raw = rawFrom(startLow.current, g.dx);
          const committed = Math.min(
            snap(raw, p.min, p.max, p.step),
            p.high - p.minGap,
          );
          if (committed !== sentLow.current) {
            sentLow.current = committed;
            reach(committed, p.high);
          }
          // Follow the finger continuously (clamped), independent of the snap.
          lowX.value = Math.max(0, Math.min(xOf(raw), xOf(p.high - p.minGap)));
        } else {
          const raw = rawFrom(startHigh.current, g.dx);
          const committed = Math.max(
            snap(raw, p.min, p.max, p.step),
            p.low + p.minGap,
          );
          if (committed !== sentHigh.current) {
            sentHigh.current = committed;
            reach(p.low, committed);
          }
          highX.value = Math.max(
            xOf(p.low + p.minGap),
            Math.min(xOf(raw), trackWRef.current),
          );
        }
      },
      onPanResponderRelease: end,
      onPanResponderTerminate: end,
    }),
  ).current;

  const lowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: lowX.value }, { scale: lowScale.value }],
  }));
  const highStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: highX.value }, { scale: highScale.value }],
  }));
  const fillStyle = useAnimatedStyle(() => ({
    left: lowX.value + THUMB / 2,
    width: Math.max(0, highX.value - lowX.value),
  }));

  return (
    <View
      {...pan.panHandlers}
      onLayout={onLayout}
      className="h-7 justify-center"
    >
      <View pointerEvents="none" className="h-1 rounded-full bg-line" />
      {trackW > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.ink,
            },
            fillStyle,
          ]}
        />
      ) : null}
      <Animated.View
        pointerEvents="none"
        accessibilityRole="adjustable"
        accessibilityLabel="Minstepris"
        accessibilityValue={{ min, max, now: low }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(e) => {
          const d = e.nativeEvent.actionName === "increment" ? step : -step;
          onChange(Math.min(Math.max(min, low + d), high - minGap), high);
        }}
        style={[thumbBase, { left: 0 }, lowStyle]}
      />
      <Animated.View
        pointerEvents="none"
        accessibilityRole="adjustable"
        accessibilityLabel="Makspris"
        accessibilityValue={{ min, max, now: high }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(e) => {
          const d = e.nativeEvent.actionName === "increment" ? step : -step;
          onChange(low, Math.max(Math.min(max, high + d), low + minGap));
        }}
        style={[thumbBase, { left: 0 }, highStyle]}
      />
    </View>
  );
}

export const RangeSlider = memo(RangeSliderBody);
