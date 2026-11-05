// Documented interop boundary: standard PanResponder gesture pattern. Refs are
// read only inside PanResponder callbacks / effects and written only from events
// — never during render — so the react-hooks/refs heuristic is a false positive.
// react-hooks/immutability is disabled too: the thumb shared value is driven from
// BOTH the sync effect (index → spring) and the gesture callbacks (finger-follow),
// guarded by the `dragging` ref — a valid Reanimated pattern the rule can't model.
/* eslint-disable react-hooks/refs, react-hooks/immutability */
import { useEffect, useRef, useState } from "react";
import { type LayoutChangeEvent, PanResponder, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { motion, useThemeColors, elevation } from "@/theme";

const THUMB = 28;

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
  const startIdx = useRef(index);
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

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragging.current = true;
        startIdx.current = latest.current.index;
        scale.value = latest.current.reduced
          ? 1
          : withSpring(1.2, motion.spring.snappy);
      },
      onPanResponderMove: (_e, g) => {
        const p = latest.current;
        const w = trackWRef.current || 1;
        const startX = (startIdx.current / p.last) * w;
        thumbX.value = Math.max(0, Math.min(w, startX + g.dx)); // follow finger
        const ratio = Math.min(1, Math.max(0, (startX + g.dx) / w));
        p.onChange(Math.round(ratio * p.last));
      },
      onPanResponderRelease: () => {
        dragging.current = false;
        const p = latest.current;
        scale.value = p.reduced ? 1 : withSpring(1, motion.spring.snappy);
        const x = (p.index / p.last) * (trackWRef.current || 0);
        thumbX.value = p.reduced ? x : withSpring(x, motion.spring.snappy);
      },
    }),
  ).current;

  const fillStyle = useAnimatedStyle(() => ({ width: thumbX.value }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }, { scale: scale.value }],
  }));

  return (
    <View>
      <View onLayout={onLayout} className="h-7 justify-center">
        <View className="h-0.5 flex-row justify-between">
          {labels.map((l, i) => (
            <View
              key={l}
              style={{
                width: 2,
                height: i === index ? 10 : 6,
                marginTop: i === index ? -4 : -2,
                borderRadius: 1,
                backgroundColor: i <= index ? colors.ember : colors.line,
              }}
            />
          ))}
        </View>
        <View
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
            style={[
              {
                position: "absolute",
                left: THUMB / 2,
                height: 2,
                borderRadius: 1,
                backgroundColor: colors.ember,
              },
              fillStyle,
            ]}
          />
        ) : null}
        <Animated.View
          {...pan.panHandlers}
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
          <Text
            key={l}
            className={`font-normal text-[10px] ${i === index ? "text-ink" : "text-muted"}`}
          >
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}
