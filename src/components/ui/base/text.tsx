// Adapted from React Native Reusables `text`
// (packages/registry/src/nativewind/components/ui/text.tsx @ d430e9a),
// reached only through `@/components/ui/Text` (DESIGN_SYSTEM.md §4 "Base layer").
// Our type scale and tones replace shadcn's h1–h4/p/lead/muted variants;
// size and weight stay out of classes because `Text` sets the font family
// and the "Større tekst" size as a style. No Slot/asChild (no new dependency).
import { cva, type VariantProps } from "class-variance-authority";
import { createContext } from "react";

import { memoVariants } from "@/lib/memoVariants";

// Literal class names so Tailwind's content scan generates them.
export const textVariants = cva("", {
  variants: {
    variant: {
      display: "text-display",
      h1: "text-h1",
      h2: "text-h2",
      title: "text-title",
      body: "text-body",
      label: "text-label",
      caption: "text-caption",
      micro: "text-micro uppercase",
    },
    tone: {
      ink: "text-ink",
      muted: "text-muted",
      inverse: "text-onInk",
      onInk: "text-onInk",
      ember: "text-emberText",
      success: "text-successText",
      danger: "text-dangerText",
      warning: "text-warningText",
      onEmber: "text-onEmber",
      onSuccess: "text-onSuccess",
      onDanger: "text-onDanger",
      onMedia: "text-onMedia",
    },
  },
  defaultVariants: { variant: "body", tone: "ink" },
});

/** textVariants, built once per variant and tone. */
export const textClass = memoVariants(textVariants);

type TextVariantProps = VariantProps<typeof textVariants>;
export type TextVariant = NonNullable<TextVariantProps["variant"]>;
export type TextTone = NonNullable<TextVariantProps["tone"]>;

/**
 * Colour for the `Text` inside a component (RNR's pattern: a button sets the
 * colour of its label). Carries a tone, not a class string: size and weight
 * come from `Text`'s own props, and an explicit `tone` prop wins.
 */
export const TextClassContext = createContext<TextTone | undefined>(undefined);
