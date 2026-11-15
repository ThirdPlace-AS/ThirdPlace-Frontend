// Adapted from React Native Reusables `button`
// (packages/registry/src/nativewind/components/ui/button.tsx @ d430e9a),
// reached only through `@/components/ui/Button` (DESIGN_SYSTEM.md §4 "Base layer").
// Kept: the cva split into a container table and a label colour that reaches
// the label through TextClassContext. Changed: our variants, sizes and fills;
// press feedback, disabled dimming and the busy state come from our
// `Pressable` (no active:/hover:/focus: classes, no opacity-50, no shadows);
// the brand gradient and spinner stay in `Button`. No Slot/asChild.
import { cva, type VariantProps } from "class-variance-authority";

import { memoVariants } from "@/lib/memoVariants";

import type { IconTone } from "../Icon";
import type { TextTone } from "./text";

// Literal class names so Tailwind generates them. Key order is output order.
export const buttonVariants = cva(
  "flex-row items-center justify-center gap-sm",
  {
    variants: {
      size: { sm: "px-lg", md: "px-xl", lg: "px-xl" },
      rounded: { md: "rounded-md", full: "rounded-full" },
      fill: {
        ink: "bg-ink",
        // Flat AA-safe pink under the gradient (shows if it can't paint).
        ember: "overflow-hidden bg-emberStrong",
        secondary: "bg-surfaceMuted",
        outline: "border border-line bg-surface",
        ghost: "bg-transparent",
        danger: "bg-danger",
        // Disabled filled buttons: "not yet", not a broken colour.
        muted: "bg-surfaceMuted",
      },
    },
    defaultVariants: { size: "md", rounded: "md", fill: "ink" },
  },
);

export const buttonClass = memoVariants(buttonVariants);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ButtonSize = NonNullable<ButtonVariantProps["size"]>;
export type ButtonVariant = Exclude<
  NonNullable<ButtonVariantProps["fill"]>,
  "muted"
>;

/** Label (and icon) tone per variant, given to the label via TextClassContext. */
export const buttonTone: Record<ButtonVariant, TextTone & IconTone> = {
  ink: "onInk",
  ember: "onEmber",
  secondary: "ink",
  outline: "ink",
  ghost: "ink",
  danger: "onEmber",
};

/** Minimum heights (style, so they stay exact under inlineRem). */
export const buttonHeight: Record<ButtonSize, number> = {
  sm: 40,
  md: 52,
  lg: 60,
};

// IconButton: a round glyph button. Same base; fills per variant, glyph tone
// per variant (an explicit tone prop wins). Sizes are style (width/height).
export const iconButtonVariants = cva(
  "items-center justify-center rounded-full",
  {
    variants: {
      variant: {
        ghost: "",
        outline: "border border-line bg-surface",
        filled: "bg-surfaceMuted",
        ink: "bg-ink",
        ember: "bg-ember",
        floating: "bg-surfaceRaised",
        media: "bg-scrim/40",
        mediaSubtle: "bg-onMedia/10",
        mediaOutline: "border border-onMedia/25",
      },
    },
    defaultVariants: { variant: "ghost" },
  },
);

export const iconButtonClass = memoVariants(iconButtonVariants);

export type IconButtonVariant = NonNullable<
  VariantProps<typeof iconButtonVariants>["variant"]
>;

export const iconButtonTone: Record<IconButtonVariant, IconTone> = {
  ghost: "ink",
  outline: "ink",
  filled: "ink",
  ink: "onInk",
  ember: "onEmber",
  floating: "ink",
  media: "onMedia",
  mediaSubtle: "onMedia",
  mediaOutline: "onMedia",
};

// FollowButton: "Følg" (ink pill) and "Følger" (quiet muted pill).
export const followButtonVariants = cva(
  "items-center justify-center rounded-full",
  {
    variants: {
      size: { sm: "px-4", md: "px-6" },
      following: {
        true: "border border-line bg-surfaceMuted",
        false: "border border-ink bg-ink",
      },
    },
    defaultVariants: { size: "sm", following: false },
  },
);

export const followButtonClass = memoVariants(followButtonVariants);
