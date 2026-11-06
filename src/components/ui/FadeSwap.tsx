// FadeSwap (docs/design/DESIGN_SYSTEM.md §5): content that replaces other
// content in place (wizard steps, the in-sheet detail stack, the next card)
// fades in over `duration.base` instead of swapping in one frame. Changing
// `swapKey` remounts the child. Reduced motion: no animation.
//
// Style only on the animated view (className on an animated component is
// dropped on a cold start, CLAUDE.md); put visual classes on the children.
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";

import { duration } from "@/theme/motion";

export function FadeSwap({
  swapKey,
  children,
  style,
}: {
  swapKey: string | number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      key={swapKey}
      entering={reduced ? undefined : FadeIn.duration(duration.base)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
