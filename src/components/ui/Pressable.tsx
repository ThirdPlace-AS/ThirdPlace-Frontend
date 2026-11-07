// Pressable primitive (docs/design/DESIGN_SYSTEM.md §4 "Pressed").
// Every tappable surface gets the same tactile response: a quick spring scale
// on press-in, back on release, optional haptic on press. Under reduced motion
// it dims instead of scaling. Disabled → 40 % and no feedback.
//
// Structure (deliberate — NativeWind only styles core components reliably):
//   core Pressable   ← a11y, hitSlop, press handlers, `className` (LAYOUT only:
//                      w-full, self-start, absolute bottom-5 right-5, ml-auto)
//     Animated.View  ← scale/opacity (style only)
//       core View    ← `contentClassName` (VISUALS: bg, border, rounded, padding,
//                      flex-row…) + `contentStyle` (sizes, elevation)
// Keeping the core Pressable outermost keeps hitSlop working (a touchable
// can't receive touches outside its parent's bounds).
import { forwardRef, type ReactNode } from "react";
import {
  Pressable as RNPressable,
  View,
  type GestureResponderEvent,
  type PressableProps as RNPressableProps,
  type StyleProp,
  type ViewStyle,
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

export type PressFeedback = "scale" | "none";
export type PressHaptic = "selection" | "light" | "none";

export type PressableProps = Omit<RNPressableProps, "children" | "style"> & {
  children?: ReactNode;
  /** Layout classes for the touch target (position, width, margins). */
  className?: string;
  /** Layout style for the touch target. */
  style?: StyleProp<ViewStyle>;
  /** Visual classes for the pressed-scaled surface (bg, border, rounded…). */
  contentClassName?: string;
  /** Visual style for the surface (fixed sizes, elevation). */
  contentStyle?: StyleProp<ViewStyle>;
  /** Visual press response. Default "scale". */
  feedback?: PressFeedback;
  /** Pressed scale (default 0.97; small controls look better at ~0.92). */
  pressedScale?: number;
  /** Haptic fired on press (default none). */
  haptic?: PressHaptic;
  /** Fade to 40 % when disabled (default). Off when the child draws its own
   * disabled look (Button). */
  dimWhenDisabled?: boolean;
};

// NativeWind turns `active:`/`focus:` classes into press handlers on the
// element that carries them. On the inner content View that makes it the touch
// responder and the outer Pressable never fires (seen on device: every ghost
// IconButton was dead). Strip them; scale is the press state.
const INTERACTIVE_VARIANT = /(^|\s)(active|focus|hover):\S+/g;
export function stripInteractive(cls?: string): string | undefined {
  if (!cls) return cls;
  const out = cls.replace(INTERACTIVE_VARIANT, " ").replace(/\s+/g, " ").trim();
  if (__DEV__ && out !== cls.trim()) {
    console.warn(
      `Pressable: removed interactive variants from contentClassName ("${cls}") — they block presses.`,
    );
  }
  return out;
}

export const Pressable = forwardRef<View, PressableProps>(function Pressable(
  {
    children,
    className,
    style,
    contentClassName,
    contentStyle,
    feedback = "scale",
    pressedScale = 0.97,
    haptic = "none",
    dimWhenDisabled = true,
    disabled,
    onPressIn,
    onPressOut,
    onPress,
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

  const to = (v: number) =>
    reduced
      ? withTiming(v, { duration: duration.fast })
      : withSpring(v, spring.snappy);

  const handleIn = (e: GestureResponderEvent) => {
    pressed.value = to(1);
    onPressIn?.(e);
  };
  const handleOut = (e: GestureResponderEvent) => {
    pressed.value = to(0);
    onPressOut?.(e);
  };
  const handlePress = (e: GestureResponderEvent) => {
    if (haptic === "selection") haptics.selection();
    else if (haptic === "light") haptics.light();
    onPress?.(e);
  };

  return (
    <RNPressable
      ref={ref}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      onPressIn={handleIn}
      onPressOut={handleOut}
      onPress={handlePress}
      className={className}
      style={style}
      {...rest}
    >
      <Animated.View
        style={[
          animated,
          disabled && dimWhenDisabled ? { opacity: 0.4 } : null,
        ]}
      >
        <View
          className={stripInteractive(contentClassName)}
          style={contentStyle}
        >
          {children}
        </View>
      </Animated.View>
    </RNPressable>
  );
});
