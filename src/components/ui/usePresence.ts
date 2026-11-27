// Presence for Modal-based surfaces (Sheet, Overlay): keeps the Modal mounted
// while the exit animation runs, then unmounts it. `progress` goes 0 → 1 on
// enter and 1 → 0 on exit; under reduced motion both are a short fade.
//
// `settled` is true once the enter animation has finished. Callers must then
// render their resting position with a plain (React-owned) style instead of the
// animated one: on Android, a React commit inside a Modal (e.g. content that
// mounts later) dropped Reanimated's animated style, so the sheet slid back
// off-screen or new content did not paint until the next touch (seen on the
// Map Filtre sheet, 2026-11-06).
//
// The enter starts in the mount effect. On the phone the Modal's window has
// drawn its first frame by then (the slide starts 50–80 ms after it); waiting
// for the Modal's onShow left the window empty for 115–147 ms (frame timings,
// 2026-11-27, ledger 0569). Sheet and Overlay pass curve "sheet" (easing.sheet).
// `onHidden` runs once an exit has finished and the Modal is gone.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Easing,
  runOnJS,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { duration, easing, presentation } from "@/theme";

const CURVES = {
  enter: Easing.bezier(...easing.enter),
  sheet: Easing.bezier(...easing.sheet),
};
const EXIT = Easing.bezier(...easing.exit);

export function usePresence(
  visible: boolean,
  onHidden?: () => void,
  curve: keyof typeof CURVES = "enter",
) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const [settled, setSettled] = useState(false);
  // Mount in the same render that turns `visible` on (no extra effect pass),
  // and leave the settled state the moment we start closing.
  if (visible && !mounted) setMounted(true);
  if (!visible && settled) setSettled(false);
  const progress = useSharedValue(0);
  const hiddenRef = useRef(onHidden);
  useEffect(() => {
    hiddenRef.current = onHidden;
  });

  const finishHide = useCallback(() => {
    setMounted(false);
    hiddenRef.current?.();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      progress.value = withTiming(
        1,
        {
          duration: reduced ? duration.fast : presentation.enter,
          easing: CURVES[curve],
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
          if (finished) runOnJS(finishHide)();
        },
      );
    }
  }, [visible, mounted, reduced, progress, finishHide, curve]);

  return { mounted, progress, reduced, settled };
}
