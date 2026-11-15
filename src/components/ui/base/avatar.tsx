// Adapted from React Native Reusables `avatar`
// (packages/registry/src/nativewind/components/ui/avatar.tsx @ d430e9a),
// reached only through `@/components/ui/Avatar` (DESIGN_SYSTEM.md §4 "Base layer").
// Kept: the round clipped root and a fallback behind the image. Changed: the
// image stays expo-image (small portrait file, blurred preview, cache), so no
// @rn-primitives/avatar; token sizes are a style (exact under inlineRem).
import type { IconSize } from "@/theme";

import type { TextVariant } from "./text";

export const avatarClass =
  "items-center justify-center overflow-hidden rounded-full bg-surfaceMuted";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Diameter in px. */
export const avatarPx: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 88,
};
/** Glyph size for an icon avatar. */
export const avatarIcon: Record<AvatarSize, IconSize> = {
  xs: "sm",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};
/** Text variant for the initials. */
export const avatarText: Record<AvatarSize, TextVariant> = {
  xs: "micro",
  sm: "caption",
  md: "label",
  lg: "title",
  xl: "h1",
};
