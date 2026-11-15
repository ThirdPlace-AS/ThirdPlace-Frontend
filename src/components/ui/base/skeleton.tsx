// Adapted from React Native Reusables `skeleton`
// (packages/registry/src/nativewind/components/ui/skeleton.tsx @ d430e9a),
// reached only through `@/components/ui/Skeleton` (DESIGN_SYSTEM.md §4 "Base layer").
// Kept: the block's class. Changed: our muted fill and radius tokens; the
// pulse stays our Reanimated opacity loop in `Skeleton` (static under reduced
// motion), not RNR's `animate-pulse` (no tailwindcss-animate).
import { cva, type VariantProps } from "class-variance-authority";

import { memoVariants } from "@/lib/memoVariants";

// Literal class names so Tailwind generates them.
export const skeletonVariants = cva("h-full w-full bg-surfaceMuted", {
  variants: {
    rounded: {
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-md",
      full: "rounded-full",
    },
  },
  defaultVariants: { rounded: "md" },
});

export const skeletonClass = memoVariants(skeletonVariants);

export type SkeletonRadius = NonNullable<
  VariantProps<typeof skeletonVariants>["rounded"]
>;
