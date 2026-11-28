// Elevation — the only place shadows are defined (docs/design/DESIGN_SYSTEM.md §3).
// Uses the cross-platform `boxShadow` style (RN ≥ 0.76, new architecture), so iOS
// and Android render the same layered soft shadow. Read it with `useElevation()`
// (the tier follows the theme) and spread the level into `style`.
import type { ViewStyle } from "react-native";

import { useScheme, type Scheme } from "./scheme";

export type ElevationLevel = "e0" | "e1" | "e2" | "e3";
export type Elevation = Record<ElevationLevel, Pick<ViewStyle, "boxShadow">>;

// One shadow tier, shadcn.io's Airbnb DESIGN.md (user 2026-11-15): a hairline
// ring, a soft near shadow and a slightly deeper one. The e1–e3 names stay so
// callers keep their meaning; they all render the same tier.
const LIGHT_TIER: Pick<ViewStyle, "boxShadow"> = {
  boxShadow:
    "0px 0px 0px 1px rgba(0, 0, 0, 0.02), 0px 2px 6px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.1)",
};

// Dark mode has shadows too (user 2026-11-27). The light tier's 2–10 % black
// cannot be seen on the #121212 background, so the same three layers are
// drawn in a deeper black. Softer and spread wider than the first take
// (user 2026-11-27, 0567): lower alpha, larger blur, so it reads as a glow
// under the card rather than a dark rim.
const DARK_TIER: Pick<ViewStyle, "boxShadow"> = {
  boxShadow:
    "0px 0px 0px 1px rgba(0, 0, 0, 0.2), 0px 4px 16px rgba(0, 0, 0, 0.25), 0px 12px 40px rgba(0, 0, 0, 0.3)",
};

function tiers(tier: Pick<ViewStyle, "boxShadow">): Elevation {
  return {
    /** Flat — most content on the background. */
    e0: {},
    /** Cards on imagery or the map. */
    e1: tier,
    /** Floating controls: search pill, map buttons, FAB. */
    e2: tier,
    /** Sheets, modals, toasts. */
    e3: tier,
  };
}

const ELEVATION: Record<Scheme, Elevation> = {
  light: tiers(LIGHT_TIER),
  dark: tiers(DARK_TIER),
};

/** The shadows for a scheme (outside React, e.g. a test). */
export function elevationFor(scheme: Scheme): Elevation {
  return ELEVATION[scheme];
}

/** The shadows for the active theme. Stable objects per scheme. */
export function useElevation(): Elevation {
  return ELEVATION[useScheme()];
}

/**
 * The edge of a raised card (Airbnb light frames, 2026-11-26): in light the
 * shadow alone lifts it, so no border; in dark the shadow sits on a near-black
 * background, so the hairline border keeps the card's edge clear as well.
 * Pair with `useElevation().e1`/`e2`.
 */
export function useRaisedEdge(): string {
  return useScheme() === "dark" ? "border border-line" : "";
}
