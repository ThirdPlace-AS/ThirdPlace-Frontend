// Adapted from React Native Reusables `badge`
// (packages/registry/src/nativewind/components/ui/badge.tsx @ d430e9a),
// reached only through `@/components/ui/Badge` (DESIGN_SYSTEM.md §4 "Base layer").
// Kept: the cva split into a shell table and a label colour. Changed: our
// tones, the tag/status padding and the solid fills for a badge over a photo;
// no focus/hover classes, no Slot/asChild.
import { cva, type VariantProps } from "class-variance-authority";

import { memoVariants } from "@/lib/memoVariants";

import type { TextTone } from "./text";

// Literal class names so Tailwind generates them. Key order is output order.
export const badgeVariants = cva("self-start rounded-full", {
  variants: {
    kind: { tag: "px-2 py-0.5", status: "px-3 py-1" },
    fill: {
      neutral: "border border-line bg-surfaceMuted",
      ink: "bg-ink",
      ember: "bg-emberStrong", // text on pink: the AA-safe pink
      success: "bg-success/15",
      warning: "bg-warning/15",
      danger: "bg-danger/15",
      // Solid fills for a badge over a photo, where a 15 % tint would not
      // read as green or red (the browse card's "Åpent" / "Stengt",
      // 2026-11-09). White on success is 4.5:1, on danger 5.5:1.
      solidSuccess: "bg-success",
      solidDanger: "bg-danger",
    },
  },
  defaultVariants: { kind: "tag", fill: "neutral" },
});

export const badgeClass = memoVariants(badgeVariants);

type BadgeFill = NonNullable<VariantProps<typeof badgeVariants>["fill"]>;
export type BadgeTone = Exclude<BadgeFill, "solidSuccess" | "solidDanger">;

/** The fill for a tone; `solid` only changes success and danger. */
export function badgeFill(tone: BadgeTone, solid: boolean): BadgeFill {
  if (solid && tone === "success") return "solidSuccess";
  if (solid && tone === "danger") return "solidDanger";
  return tone;
}

/** Label tone per fill. */
export const badgeTone: Record<BadgeFill, TextTone> = {
  neutral: "muted",
  ink: "inverse",
  ember: "onEmber",
  success: "success",
  warning: "warning",
  danger: "danger",
  solidSuccess: "onSuccess",
  solidDanger: "onDanger",
};
