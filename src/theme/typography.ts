import { Platform } from "react-native";

// Typography — TEMPORARY system fonts (founder decision, Phase 0.3) pending
// confirmation of the real typeface. We deliberately do NOT load a custom font:
// iOS uses San Francisco ("System"), Android uses Roboto ("sans-serif").
// Sizes/weights are PROVISIONAL (see docs/design/DESIGN_TOKENS_PROVISIONAL.md).

export const fontFamily = {
  // Leave undefined on iOS so the platform picks San Francisco.
  system: Platform.select({
    ios: undefined,
    android: "sans-serif",
    default: undefined,
  }),
} as const;

export const fontSize = {
  display: 30,
  h1: 24,
  h2: 20,
  title: 18,
  body: 16,
  caption: 13,
  micro: 11,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;
