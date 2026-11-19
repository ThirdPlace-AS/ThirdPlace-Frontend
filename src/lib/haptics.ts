import { Platform } from "react-native";

// Haptics at a few chosen moments, in the right strength (user 2026-11-09:
// "Add haptic feedback where it makes sense and in the right strength", and
// "Also key taps" over the earlier no-tap rule of ledger 0322):
//   selection  a drag crosses a threshold (Sveip's commit line, swipe to
//              reply) or a slider moves a step;
//   toggleOn   save / like turns on (never when it turns off);
//   tap        a message is sent;
//   longPress  a long press opens a menu (reactions, "Flere valg");
//   success    a real local completion (joined, published).
// Plain buttons, navigation, chips and switches stay silent;
// tests/designGuard.test.ts holds the list of files and moments.
//
// Android uses the platform's own feedback constants (View.performHaptic-
// Feedback through expo-haptics), so the phone's touch-feedback setting
// applies; constants newer than the phone fall back to an older one. iOS
// uses the matching impact, selection and notification calls. The native
// module is loaded lazily and guarded: a no-op on web, on other platforms and
// in builds without expo-haptics, and it never throws.
let Haptics: typeof import("expo-haptics") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Haptics = require("expo-haptics");
} catch {
  Haptics = null;
}

const H = Haptics;
// Read when a moment fires (cheap), so tests can switch the platform.
const os = () => (H === null ? null : Platform.OS);
const apiLevel = () =>
  typeof Platform.Version === "number" ? Platform.Version : 0;

type AndroidKind = import("expo-haptics").AndroidHaptics;

function onAndroid(
  kind: AndroidKind,
  minApi: number,
  fallback: AndroidKind,
): void {
  H!
    .performAndroidHapticsAsync(apiLevel() >= minApi ? kind : fallback)
    .catch(() => {});
}

export const haptics = {
  selection() {
    if (os() === "android")
      onAndroid(
        H!.AndroidHaptics.Segment_Tick,
        34,
        H!.AndroidHaptics.Clock_Tick,
      );
    else if (os() === "ios") H!.selectionAsync().catch(() => {});
  },
  toggleOn() {
    if (os() === "android")
      onAndroid(H!.AndroidHaptics.Toggle_On, 34, H!.AndroidHaptics.Virtual_Key);
    else if (os() === "ios")
      H!.impactAsync(H!.ImpactFeedbackStyle.Light).catch(() => {});
  },
  tap() {
    if (os() === "android")
      onAndroid(
        H!.AndroidHaptics.Virtual_Key,
        5,
        H!.AndroidHaptics.Virtual_Key,
      );
    else if (os() === "ios")
      H!.impactAsync(H!.ImpactFeedbackStyle.Light).catch(() => {});
  },
  longPress() {
    if (os() === "android")
      onAndroid(H!.AndroidHaptics.Long_Press, 3, H!.AndroidHaptics.Long_Press);
    else if (os() === "ios")
      H!.impactAsync(H!.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  success() {
    if (os() === "android")
      onAndroid(H!.AndroidHaptics.Confirm, 30, H!.AndroidHaptics.Virtual_Key);
    else if (os() === "ios")
      H!.notificationAsync(H!.NotificationFeedbackType.Success).catch(() => {});
  },
};
