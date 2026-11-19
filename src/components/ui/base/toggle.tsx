// Adapted from React Native Reusables `toggle` / `toggle-group`
// (packages/registry/src/nativewind/components/ui/toggle.tsx @ d430e9a),
// reached only through `@/components/ui/Chip` and `ChipGroup`
// (DESIGN_SYSTEM.md §4 "Base layer").
// Kept: the cva shell per variant, size and pressed state. Changed: our pill
// shape, fills and paddings; press feedback stays in our `Pressable` (no
// active:/hover:/focus: classes) and the a11y roles stay in `Chip` (button,
// radio or checkbox), so no @rn-primitives/toggle(-group) and no Slot.
import { cva, type VariantProps } from "class-variance-authority";

import { memoVariants } from "@/lib/memoVariants";

// Literal class names so Tailwind generates them. Key order is output order.
export const toggleVariants = cva("flex-row items-center gap-2 rounded-full", {
  variants: {
    size: { sm: "px-3", md: "px-gutter" },
    shell: {
      filledOn: "border border-ink bg-ink",
      // PDF (p5 Filtre, p22 Oppdag folk/Filter folk): unselected = grey
      // fill, no visible border.
      filledOff: "border border-surfaceMuted bg-surfaceMuted",
      // "outline": selected = 2 px ink ring (map Filtre type grids).
      outlineOn: "border-2 border-ink bg-surface",
      outlineOff: "border border-line bg-surface",
    },
  },
  defaultVariants: { size: "md", shell: "filledOff" },
});

export const toggleClass = memoVariants(toggleVariants);

type ToggleVariantProps = VariantProps<typeof toggleVariants>;
export type ToggleSize = NonNullable<ToggleVariantProps["size"]>;
export type ToggleVariant = "filled" | "outline";

export function toggleShell(
  variant: ToggleVariant,
  selected: boolean,
): NonNullable<ToggleVariantProps["shell"]> {
  if (variant === "filled") return selected ? "filledOn" : "filledOff";
  return selected ? "outlineOn" : "outlineOff";
}

/** Minimum heights (style, so they stay exact under inlineRem). */
export const toggleHeight: Record<ToggleSize, number> = { sm: 32, md: 40 };

/** The group's row. */
export const toggleGroupClass = "flex-row flex-wrap gap-2";
