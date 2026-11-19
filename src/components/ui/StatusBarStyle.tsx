// Focus-aware status-bar content colour.
//
// expo-status-bar's <StatusBar> applies its style when it mounts, but tab and
// stack screens stay mounted after you leave them, so a dark screen's "light"
// icons leaked onto every light screen opened afterwards (white clock on a
// white header). Here each request is pushed while its screen is focused and
// popped on blur/unmount; the newest request wins, and with none left the bar
// follows the theme (dark icons on light, light icons on dark).
//
// style: "light" | "dark" for a surface that is always dark/light (swipe card,
// photo hero, night map); "auto" for a themed surface shown above one of those
// (e.g. a light panel opened over the swipe deck).
import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";

export type BarStyle = "light" | "dark" | "auto";

let fallback: "light" | "dark" = "dark";
const stack: { style: BarStyle }[] = [];

function apply() {
  const top = stack[stack.length - 1]?.style ?? "auto";
  setStatusBarStyle(top === "auto" ? fallback : top, true);
}

/** Called by the theme root: icon colour for themed surfaces. */
export function setStatusBarFallback(style: "light" | "dark") {
  fallback = style;
  apply();
}

/** Test seam: requests currently on the stack (newest last). */
export function statusBarRequests(): BarStyle[] {
  return stack.map((e) => e.style);
}

export function StatusBarStyle({ style }: { style: BarStyle }) {
  useFocusEffect(
    useCallback(() => {
      const entry = { style };
      stack.push(entry);
      apply();
      return () => {
        const i = stack.indexOf(entry);
        if (i >= 0) stack.splice(i, 1);
        apply();
      };
    }, [style]),
  );
  return null;
}
