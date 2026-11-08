import { Platform } from "react-native";

// Haptics for drag gestures only: no vibration on a tap or a long press
// (founder 2026-11-09). Two users: Sveip's tick when a dragged card crosses
// the commit line, and the chat's swipe-to-reply. Reinforces a gesture; never
// drives it. The native module is loaded lazily and guarded: it is a no-op on
// web, on unsupported platforms, AND in any build where expo-haptics isn't
// compiled in — and never throws. Real device feedback is native-verification-
// outstanding (NV-7).
let Haptics: typeof import("expo-haptics") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Haptics = require("expo-haptics");
} catch {
  Haptics = null;
}

const supported =
  (Platform.OS === "ios" || Platform.OS === "android") && Haptics !== null;

export const haptics = {
  // Light tick when a drag gesture reaches its threshold.
  selection() {
    if (!supported) return;
    Haptics!.selectionAsync().catch(() => {});
  },
};
