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
// The enter waits for the Modal's window (pass `onShow` to the Modal) and
// starts inside that callback: the window comes up 100–280 ms after the Modal
// mounts, and an enter started at mount had mostly run before its first frame,
// so the sheet popped up instead of sliding (frame recording, 2026-11-27). If
// the Modal never reports, the enter starts after SHOW_FALLBACK_MS.
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
// Well above the slowest window seen (276 ms on the map's Filtre, emulator).
const SHOW_FALLBACK_MS = 600;

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
  // Starts the enter once per open, and the exit; set in an effect so onShow
  // can start the enter without waiting for a render.
  const enterRef = useRef<(() => void) | null>(null);
  const exitRef = useRef<(() => void) | null>(null);
  const enteringRef = useRef(false);
  // onShow arrived before the effect that sets enterRef.
  const pendingShow = useRef(false);
  useEffect(() => {
    hiddenRef.current = onHidden;
  });

  const finishHide = useCallback(() => {
    setMounted(false);
    hiddenRef.current?.();
  }, []);
  // No state change here: a render on onShow re-rendered the whole sheet just
  // as it began to slide, and the commit stalled the first frames.
  const onShow = useCallback(() => {
    if (enterRef.current) enterRef.current();
    else pendingShow.current = true;
  }, []);

  useEffect(() => {
    enterRef.current = () => {
      if (!visible || enteringRef.current) return;
      enteringRef.current = true;
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
    };
    exitRef.current = () => {
      enteringRef.current = false;
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
    };
    if (pendingShow.current) {
      pendingShow.current = false;
      enterRef.current();
    }
  });

  // Fallback for a Modal that never reports onShow (a no-op once the enter
  // has started).
  useEffect(() => {
    if (!mounted || !visible) return;
    const t = setTimeout(() => enterRef.current?.(), SHOW_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [mounted, visible]);

  // A reopen while the exit still runs: the window is already up.
  const wasExiting = useRef(false);
  useEffect(() => {
    if (!mounted) {
      wasExiting.current = false;
      return;
    }
    if (!visible) {
      wasExiting.current = true;
      exitRef.current?.();
    } else if (wasExiting.current) {
      wasExiting.current = false;
      enterRef.current?.();
    }
  }, [visible, mounted]);

  return { mounted, progress, reduced, settled, onShow };
}
