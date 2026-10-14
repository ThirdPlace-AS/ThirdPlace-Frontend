import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Subtle, consistent haptic language for the app. Reinforces interactions; never
// drives them. No-op on web / unsupported platforms and never throws. Real device
// feedback is native-verification-outstanding (NV-7).
const supported = Platform.OS === "ios" || Platform.OS === "android";

export const haptics = {
  // Light tick for discrete selections (marker tap, mode change).
  selection() {
    if (!supported) return;
    Haptics.selectionAsync().catch(() => {});
  },
  // Soft impact for committing an interaction (apply filters, expand preview).
  light() {
    if (!supported) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  // Success notification for a completed local action.
  success() {
    if (!supported) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
  },
};
