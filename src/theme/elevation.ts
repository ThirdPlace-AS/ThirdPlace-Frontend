// Elevation — the only place shadows are defined (docs/design/DESIGN_SYSTEM.md §3).
// Uses the cross-platform `boxShadow` style (RN ≥ 0.76, new architecture), so iOS
// and Android render the same layered soft shadow. Spread into `style`.
import type { ViewStyle } from "react-native";

export type ElevationLevel = "e0" | "e1" | "e2" | "e3";

// One shadow tier, shadcn.io's Airbnb DESIGN.md (user 2026-11-15): a hairline
// ring, a soft near shadow and a slightly deeper one. The e1–e3 names stay so
// callers keep their meaning; they all render the same tier.
const TIER: Pick<ViewStyle, "boxShadow"> = {
  boxShadow:
    "0px 0px 0px 1px rgba(0, 0, 0, 0.02), 0px 2px 6px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.1)",
};

export const elevation: Record<ElevationLevel, Pick<ViewStyle, "boxShadow">> = {
  /** Flat — most content on the background. */
  e0: {},
  /** Cards on imagery or the map. */
  e1: TIER,
  /** Floating controls: search pill, map buttons, FAB. */
  e2: TIER,
  /** Sheets, modals, toasts. */
  e3: TIER,
};
