// Adapted from React Native Reusables `checkbox` and `radio-group`
// (packages/registry/src/nativewind/components/ui/checkbox.tsx and
// radio-group.tsx @ d430e9a), reached only through `@/components/ui/CheckboxMark`
// and `RadioMark` (DESIGN_SYSTEM.md §4 "Base layer").
// Kept: the indicator tables (box on/off, radio on/off). Changed: our square
// ink box and the Ionicons radio glyphs; the row that holds the indicator
// keeps the role, the checked state and the press (our `Pressable`), so no
// @rn-primitives/checkbox or radio-group, no lucide check, no Slot.
import { cva } from "class-variance-authority";

import { memoVariants } from "@/lib/memoVariants";

import type { IconName } from "../Icon";

// Literal class names so Tailwind generates them.
export const checkboxVariants = cva(
  "h-6 w-6 items-center justify-center rounded-xs border",
  {
    variants: {
      checked: {
        true: "border-ink bg-ink",
        false: "border-line bg-surface",
      },
    },
    defaultVariants: { checked: false },
  },
);

export const checkboxClass = memoVariants(checkboxVariants);

/** The radio indicator's glyph, on and off. */
export const radioGlyph: Record<"on" | "off", IconName> = {
  on: "radio-button-on",
  off: "radio-button-off",
};
