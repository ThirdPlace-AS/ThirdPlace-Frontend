// Pressable primitive (docs/design/DESIGN_SYSTEM.md §4 "Pressed").
// Every tappable surface gets the same tactile response: a quick spring scale
// on press-in, back on release. No vibration on a tap (founder 2026-11-09).
// Under reduced motion it dims instead of scaling. Disabled → 40 % and no
// feedback.
//
// Structure (deliberate — NativeWind only styles core components reliably):
//   core Pressable   ← a11y, hitSlop, press handlers, `className` (LAYOUT only:
//                      w-full, self-start, absolute bottom-5 right-5, ml-auto)
//     Animated.View  ← scale/opacity (core Animated, style only)
//       core View    ← `contentClassName` (VISUALS: bg, border, rounded, padding,
//                      flex-row…) + `contentStyle` (sizes, elevation)
// Keeping the core Pressable outermost keeps hitSlop working (a touchable
// can't receive touches outside its parent's bounds).
import { forwardRef, useMemo, useState, type ReactNode } from "react";
import {
  Animated as RNAnimated,
  Pressable as RNPressable,
  View,
  type GestureResponderEvent,
  type PressableProps as RNPressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { duration, spring } from "@/theme";

export type PressFeedback = "scale" | "none";

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

// Speed (R4, 0367): the press scale runs on React Native's core Animated
// with the native driver. Each Pressable used to create a Reanimated shared
// value and an animated style (a worklet mapper on the UI runtime) when it
// mounted; Filtre alone mounts dozens, and its open committed about 11 %
// sooner without them on the emulator (median of 10 runs against 5). The
// look is the same: a quick spring scale, or a dim under reduced motion.
export const Pressable = forwardRef<View, PressableProps>(function Pressable(
  {
    children,
    className,
    style,
    contentClassName,
    contentStyle,
    feedback = "scale",
    pressedScale = 0.97,
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
  // 0 at rest, 1 while pressed; animated natively once it has started.
  const [pressed] = useState(() => new RNAnimated.Value(0));
  const animated = useMemo(() => {
    if (feedback === "none") return null;
    if (reduced)
      return {
        opacity: pressed.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.7],
        }),
      };
    return {
      transform: [
        {
          scale: pressed.interpolate({
            inputRange: [0, 1],
            outputRange: [1, pressedScale],
          }),
        },
      ],
    };
  }, [feedback, reduced, pressed, pressedScale]);

  const to = (v: number) =>
    (reduced
      ? RNAnimated.timing(pressed, {
          toValue: v,
          duration: duration.fast,
          useNativeDriver: true,
        })
      : RNAnimated.spring(pressed, {
          toValue: v,
          useNativeDriver: true,
          ...spring.snappy,
        })
    ).start();

  const handleIn = (e: GestureResponderEvent) => {
    if (animated) to(1);
    onPressIn?.(e);
  };
  const handleOut = (e: GestureResponderEvent) => {
    if (animated) to(0);
    onPressOut?.(e);
  };
  // Always hand RN a handler, so a press without onPress (a busy Button)
  // ends here instead of reaching a parent's onPress.
  const handlePress = (e: GestureResponderEvent) => {
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
      <RNAnimated.View
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
      </RNAnimated.View>
    </RNPressable>
  );
});
