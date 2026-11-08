import { Platform } from "react-native";

// Subtle, consistent haptic language for the app. Reinforces interactions; never
// drives them. The native module is loaded lazily and guarded: it is a no-op on
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
  // Light tick for discrete selections (marker tap, mode change).
  selection() {
    if (!supported) return;
    Haptics!.selectionAsync().catch(() => {});
  },
  // Soft impact for committing an interaction (apply filters, expand preview).
  light() {
    if (!supported) return;
    Haptics!.impactAsync(Haptics!.ImpactFeedbackStyle.Light).catch(() => {});
  },
  // Success notification for a completed local action.
  success() {
    if (!supported) return;
    Haptics!
      .notificationAsync(Haptics!.NotificationFeedbackType.Success)
      .catch(() => {});
  },
};
