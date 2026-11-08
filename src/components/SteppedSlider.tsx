// Documented interop boundary: standard PanResponder gesture pattern. Refs are
// read only inside PanResponder callbacks / effects and written only from events
// — never during render — so the react-hooks/refs heuristic is a false positive.
// react-hooks/immutability is disabled too: the thumb shared value is driven from
// BOTH the sync effect (index → spring) and the gesture callbacks (finger-follow),
// guarded by the `dragging` ref — a valid Reanimated pattern the rule can't model.
/* eslint-disable react-hooks/refs, react-hooks/immutability */
import { useEffect, useRef, useState } from "react";
import { type LayoutChangeEvent, PanResponder, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { motion, useThemeColors, elevation } from "@/theme";
import { Text } from "@/components/ui";

const THUMB = 28;
// Horizontal travel (dp) before a touch counts as a drag rather than a tap.
const DRAG_SLOP = 4;

/** The step under a point on the track: x from the first step's centre, w the
 *  track's length between the first and last centres. */
export function stepAt(x: number, w: number, last: number): number {
  const ratio = w > 0 ? Math.min(1, Math.max(0, x / w)) : 0;
  return Math.round(ratio * last);
}

// Single-handle slider that commits to discrete steps (used for "Varighet" /
// "Avstand"). The thumb + progress fill live in a reanimated shared value so the
// handle glides under the finger during the drag and springs to the committed
// step on release — smooth, while `index`/`onChange` stay discrete. `onChange`
// fires live on every move so the tick highlight + section subtitle track the
// drag. Reduced-motion-safe: springs collapse to instant sets.
export function SteppedSlider({
  labels,
  index,
  onChange,
}: {
  labels: string[];
  index: number;
  onChange: (index: number) => void;
}) {
  const colors = useThemeColors();
  const [trackW, setTrackW] = useState(0);
  const trackWRef = useRef(0);
  // Where the touch went down on the track, and whether it has become a drag.
  const startX = useRef(0);
  const moved = useRef(false);
  const dragging = useRef(false);
  const last = labels.length - 1 || 1;

  const reduced = useReducedMotion();
  const thumbX = useSharedValue(0);
  const scale = useSharedValue(1);

  const xForIndex = (i: number) => (i / last) * trackW;

  useEffect(() => {
    if (dragging.current) return;
    const x = xForIndex(index);
    thumbX.value = reduced ? x : withSpring(x, motion.spring.snappy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, trackW, reduced]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width - THUMB;
    trackWRef.current = w;
    setTrackW(w);
  };

  // Created once; callbacks read the latest props via `latest`. A responder
  // rebuilt per render (onChange re-renders the parent on every move) loses its
  // accumulated gestureState, so g.dx would only be the latest move delta.
  const latest = useRef({ index, last, onChange, reduced });
  latest.current = { index, last, onChange, reduced };

  // The whole track takes the touch (Phase 19): the thumb rests at the right
  // end by default ("Alle"), about 30 dp from the screen edge, where Android's
  // back gesture starts, so a drag begun on the thumb closed Filtre instead.
  // A tap jumps to the nearest step on release; a horizontal drag follows the
  // finger from wherever it started. A vertical scroll that starts here is
  // taken by the sheet (terminate) and changes nothing.
  const settle = () => {
    dragging.current = false;
    const p = latest.current;
    scale.value = p.reduced ? 1 : withSpring(1, motion.spring.snappy);
    const x = (p.index / p.last) * (trackWRef.current || 0);
    thumbX.value = p.reduced ? x : withSpring(x, motion.spring.snappy);
  };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const w = trackWRef.current || 1;
        startX.current = Math.max(
          0,
          Math.min(w, e.nativeEvent.locationX - THUMB / 2),
        );
        moved.current = false;
      },
      onPanResponderMove: (_e, g) => {
        const p = latest.current;
        const w = trackWRef.current || 1;
        if (!moved.current) {
          if (Math.abs(g.dx) < DRAG_SLOP) return;
          moved.current = true;
          dragging.current = true;
          scale.value = p.reduced ? 1 : withSpring(1.2, motion.spring.snappy);
        }
        const x = Math.max(0, Math.min(w, startX.current + g.dx));
        thumbX.value = x; // follow the finger
        p.onChange(stepAt(x, w, p.last));
      },
      onPanResponderRelease: () => {
        const p = latest.current;
        if (!moved.current)
          p.onChange(stepAt(startX.current, trackWRef.current || 1, p.last));
        settle();
      },
      onPanResponderTerminate: settle,
    }),
  ).current;

  const fillStyle = useAnimatedStyle(() => ({ width: thumbX.value }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }, { scale: scale.value }],
  }));

  return (
    <View>
      <View
        {...pan.panHandlers}
        onLayout={onLayout}
        className="h-7 justify-center"
      >
        <View pointerEvents="none" className="h-0.5 flex-row justify-between">
          {labels.map((l, i) => (
            <View
              key={l}
              style={{
                width: 2,
                height: i === index ? 10 : 6,
                marginTop: i === index ? -4 : -2,
                borderRadius: 1,
                backgroundColor: i <= index ? colors.ink : colors.line,
              }}
            />
          ))}
        </View>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: THUMB / 2,
            right: THUMB / 2,
            height: 2,
            borderRadius: 1,
            backgroundColor: colors.line,
          }}
        />
        {trackW > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                left: THUMB / 2,
                height: 2,
                borderRadius: 1,
                backgroundColor: colors.ink,
              },
              fillStyle,
            ]}
          />
        ) : null}
        <Animated.View
          pointerEvents="none"
          accessibilityRole="adjustable"
          accessibilityLabel="Verdi"
          accessibilityValue={{ text: labels[index] }}
          accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
          onAccessibilityAction={(e) => {
            const d = e.nativeEvent.actionName === "increment" ? 1 : -1;
            onChange(Math.min(last, Math.max(0, index + d)));
          }}
          style={[
            {
              position: "absolute",
              left: 0,
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB / 2,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.line,
              ...elevation.e1,
            },
            thumbStyle,
          ]}
        />
      </View>
      <View className="flex-row justify-between pt-1">
        {labels.map((l, i) => (
          <Text key={l} variant="caption" tone={i === index ? "ink" : "muted"}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}
