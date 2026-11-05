// Presence for Modal-based surfaces (Sheet, Overlay): keeps the Modal mounted
// while the exit animation runs, then unmounts it. `progress` goes 0 → 1 on
// enter and 1 → 0 on exit; under reduced motion both are a short fade.
import { useEffect, useState } from "react";
import {
  Easing,
  runOnJS,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { duration, easing, presentation } from "@/theme";

const ENTER = Easing.bezier(...easing.enter);
const EXIT = Easing.bezier(...easing.exit);

export function usePresence(visible: boolean) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  // Mount in the same render that turns `visible` on (no extra effect pass).
  if (visible && !mounted) setMounted(true);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      progress.value = withTiming(1, {
        duration: reduced ? duration.fast : presentation.enter,
        easing: ENTER,
      });
    } else {
      progress.value = withTiming(
        0,
        {
          duration: reduced ? duration.fast : presentation.exit,
          easing: EXIT,
        },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        },
      );
    }
  }, [visible, mounted, reduced, progress]);

  return { mounted, progress, reduced };
}
