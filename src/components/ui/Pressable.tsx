// Pressable primitive (docs/design/DESIGN_SYSTEM.md §4 "Pressed").
// Every tappable surface gets the same tactile response: a quick spring scale
// on press-in, back on release, optional haptic on press. Under reduced motion
// it dims instead of scaling. Disabled → 40 % and no feedback.
import { cssInterop } from "nativewind";
import { forwardRef } from "react";
import {
  Pressable as RNPressable,
  type GestureResponderEvent,
  type PressableProps as RNPressableProps,
  type View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { haptics } from "@/lib/haptics";
import { duration, spring } from "@/theme";

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);
// Let `className` reach the animated wrapper (NativeWind only interops core components).
cssInterop(AnimatedPressable, { className: "style" });

export type PressFeedback = "scale" | "none";
export type PressHaptic = "selection" | "light" | "none";

export type PressableProps = RNPressableProps & {
  className?: string;
  /** Visual press response. Default "scale". */
  feedback?: PressFeedback;
  /** Pressed scale (default 0.97; small controls look better at ~0.92). */
  pressedScale?: number;
  /** Haptic fired on press (default none). */
  haptic?: PressHaptic;
};

export const Pressable = forwardRef<View, PressableProps>(function Pressable(
  {
    feedback = "scale",
    pressedScale = 0.97,
    haptic = "none",
    disabled,
    onPressIn,
    onPressOut,
    onPress,
    style,
    accessibilityState,
    ...rest
  },
  ref,
) {
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);

  const animated = useAnimatedStyle(() => {
    if (feedback === "none") return {};
    if (reduced) return { opacity: 1 - pressed.value * 0.3 };
    return {
      transform: [{ scale: 1 - pressed.value * (1 - pressedScale) }],
    };
  });

  const handleIn = (e: GestureResponderEvent) => {
    pressed.value = reduced
      ? withTiming(1, { duration: duration.fast })
      : withSpring(1, spring.snappy);
    onPressIn?.(e);
  };
  const handleOut = (e: GestureResponderEvent) => {
    pressed.value = reduced
      ? withTiming(0, { duration: duration.fast })
      : withSpring(0, spring.snappy);
    onPressOut?.(e);
  };
  const handlePress = (e: GestureResponderEvent) => {
    if (haptic === "selection") haptics.selection();
    else if (haptic === "light") haptics.light();
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      ref={ref}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      onPressIn={handleIn}
      onPressOut={handleOut}
      onPress={handlePress}
      // `style` may be a function in RN Pressable; animated wrapper needs an object.
      style={[
        typeof style === "function" ? undefined : style,
        animated,
        disabled ? { opacity: 0.4 } : null,
      ]}
      {...rest}
    />
  );
});
