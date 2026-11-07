// PopIcon — an Icon that pops (1 → 1.25 → 1, spring.snappy) when `pop` turns
// on. Used by the like/save toggle (docs/design/DESIGN_SYSTEM.md §5
// "Microinteraction patterns"). No pop on mount and none under reduced motion.
import { useEffect, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { spring } from "@/theme";

import { Icon, type IconProps } from "./Icon";

export function PopIcon({ pop, ...icon }: IconProps & { pop: boolean }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const prev = useRef(pop);

  useEffect(() => {
    const turnedOn = pop && !prev.current;
    prev.current = pop;
    if (!turnedOn || reduced) return;
    scale.value = withSequence(
      withSpring(1.25, spring.snappy),
      withSpring(1, spring.snappy),
    );
  }, [pop, reduced, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Icon {...icon} />
    </Animated.View>
  );
}
