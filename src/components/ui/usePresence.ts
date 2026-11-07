// Presence for Modal-based surfaces (Sheet, Overlay): keeps the Modal mounted
// while the exit animation runs, then unmounts it. `progress` goes 0 → 1 on
// enter and 1 → 0 on exit; under reduced motion both are a short fade.
//
// `settled` is true once the enter animation has finished. Callers must then
// render their resting position with a plain (React-owned) style instead of the
// animated one: on Android, a React commit inside a Modal (e.g. content that
// mounts later) dropped Reanimated's animated transform, so the sheet slid back
// off-screen or new content did not paint until the next touch (seen on the
// Map Filtre sheet, 2026-11-06).
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
  const [settled, setSettled] = useState(false);
  // Mount in the same render that turns `visible` on (no extra effect pass),
  // and leave the settled state the moment we start closing.
  if (visible && !mounted) setMounted(true);
  if (!visible && settled) setSettled(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      progress.value = withTiming(
        1,
        {
          duration: reduced ? duration.fast : presentation.enter,
          easing: ENTER,
        },
        (finished) => {
          if (finished) runOnJS(setSettled)(true);
        },
      );
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

  return { mounted, progress, reduced, settled };
}
