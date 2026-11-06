// Documented interop boundary: this is the standard PanResponder gesture
// pattern. The refs (drag-start values, measured track width, dragging flag) are
// READ only inside PanResponder event callbacks / effects and WRITTEN only from
// events (grant/move/release/layout) — never during render. The react-hooks/refs
// heuristic can't see that the closures passed to PanResponder.create don't run
// at render time, so it is disabled for this file. react-hooks/immutability is
// likewise disabled: the thumb shared values are intentionally driven from BOTH
// the sync effect (prop → spring) and the gesture callbacks (finger-follow),
// guarded by the `dragging` ref so the two never fight — a valid Reanimated
// pattern the rule can't model.
/* eslint-disable react-hooks/refs, react-hooks/immutability */
import { useEffect, useRef, useState } from "react";
import { type LayoutChangeEvent, PanResponder, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { motion, useThemeColors, elevation } from "@/theme";

const THUMB = 28; // thumb diameter (px)

function snap(value: number, min: number, max: number, step: number): number {
  const stepped = Math.round((value - min) / step) * step + min;
  return Math.min(max, Math.max(min, stepped));
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
// on web + native without gesture-handler root wiring. The thumb position lives
// in a reanimated shared value so it glides under the finger during the drag and
// springs to the committed (snapped) position on release — smooth, while the
// COMMITTED value stays snapped to `step`. `onChange` fires live on every move so
// the price labels + histogram track the drag with no lag. Reduced-motion-safe:
// springs collapse to instant sets when the OS setting is on.
export function RangeSlider({
  min,
  max,
  step = 1,
  low,
  high,
  onChange,
  minGap = step,
}: {
  min: number;
  max: number;
  step?: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  minGap?: number;
}) {
  const colors = useThemeColors();
  const thumbBase = {
    ...thumbShape,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.line,
  };
  const [trackW, setTrackW] = useState(0);
  const trackWRef = useRef(0);
  const startLow = useRef(low);
  const startHigh = useRef(high);
  const dragging = useRef(false);

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

  // Latest props for the gesture callbacks. The PanResponders are created ONCE
  // (below): a responder rebuilt on every render — and onChange re-renders the
  // parent on every move — loses its accumulated gestureState, so g.dx would be
  // only the latest move delta and the thumb would stutter back to the start.
  const latest = useRef({
    low,
    high,
    min,
    max,
    step,
    minGap,
    onChange,
    reduced,
  });
  latest.current = { low, high, min, max, step, minGap, onChange, reduced };
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

  const lowPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragging.current = true;
        startLow.current = latest.current.low;
        press(lowScale);
      },
      onPanResponderMove: (_e, g) => {
        const p = latest.current;
        const raw = rawFrom(startLow.current, g.dx);
        const committed = Math.min(
          snap(raw, p.min, p.max, p.step),
          p.high - p.minGap,
        );
        p.onChange(committed, p.high);
        // Follow the finger continuously (clamped), independent of the snap.
        lowX.value = Math.max(0, Math.min(xOf(raw), xOf(p.high - p.minGap)));
      },
      onPanResponderRelease: () => {
        dragging.current = false;
        release(lowScale);
        const p = latest.current;
        settle(lowX, xOf(Math.min(p.low, p.high - p.minGap)));
      },
    }),
  ).current;

  const highPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragging.current = true;
        startHigh.current = latest.current.high;
        press(highScale);
      },
      onPanResponderMove: (_e, g) => {
        const p = latest.current;
        const raw = rawFrom(startHigh.current, g.dx);
        const committed = Math.max(
          snap(raw, p.min, p.max, p.step),
          p.low + p.minGap,
        );
        p.onChange(p.low, committed);
        highX.value = Math.max(
          xOf(p.low + p.minGap),
          Math.min(xOf(raw), trackWRef.current),
        );
      },
      onPanResponderRelease: () => {
        dragging.current = false;
        release(highScale);
        const p = latest.current;
        settle(highX, xOf(Math.max(p.high, p.low + p.minGap)));
      },
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
    <View onLayout={onLayout} className="h-7 justify-center">
      <View className="h-1 rounded-full bg-line" />
      {trackW > 0 ? (
        <Animated.View
          style={[
            {
              position: "absolute",
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.ember,
            },
            fillStyle,
          ]}
        />
      ) : null}
      <Animated.View
        {...lowPan.panHandlers}
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
        {...highPan.panHandlers}
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
