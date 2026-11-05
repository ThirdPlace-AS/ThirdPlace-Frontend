// Elevation — the only place shadows are defined (docs/design/DESIGN_SYSTEM.md §3).
// Uses the cross-platform `boxShadow` style (RN ≥ 0.76, new architecture), so iOS
// and Android render the same layered soft shadow. Spread into `style`.
import type { ViewStyle } from "react-native";

export type ElevationLevel = "e0" | "e1" | "e2" | "e3";

export const elevation: Record<ElevationLevel, ViewStyle> = {
  /** Flat — most content on the background. */
  e0: {},
  /** Cards on imagery or the map. */
  e1: {
    boxShadow:
      "0px 1px 3px rgba(0, 0, 0, 0.06), 0px 2px 8px rgba(0, 0, 0, 0.06)",
  },
  /** Floating controls: search pill, map buttons, FAB. */
  e2: {
    boxShadow:
      "0px 1px 2px rgba(0, 0, 0, 0.08), 0px 6px 16px rgba(0, 0, 0, 0.12)",
  },
  /** Sheets, modals, toasts. */
  e3: {
    boxShadow:
      "0px 2px 6px rgba(0, 0, 0, 0.08), 0px 12px 32px rgba(0, 0, 0, 0.18)",
  },
};
