// Adapted from React Native Reusables `input`
// (packages/registry/src/nativewind/components/ui/input.tsx @ d430e9a),
// reached only through `@/components/ui/Input` and `SearchBar`
// (DESIGN_SYSTEM.md §4 "Base layer").
// Kept: the field's class table. Changed: our surface, ink and line colours
// and an error border; focus is React state in `Input`, not `focus-visible:`
// classes, the placeholder colour is a prop (no `placeholder:` class), and
// font, size, border width and padding stay a style (exact under inlineRem,
// and the 2 px emphasis border is offset in padding so text never shifts).
import { cva, type VariantProps } from "class-variance-authority";

import { memoVariants } from "@/lib/memoVariants";

// Literal class names so Tailwind generates them.
export const inputVariants = cva("w-full rounded-md bg-surface text-ink", {
  variants: {
    state: {
      idle: "border-line",
      focused: "border-ink",
      error: "border-danger",
    },
  },
  defaultVariants: { state: "idle" },
});

export const inputClass = memoVariants(inputVariants);

export type InputState = NonNullable<
  VariantProps<typeof inputVariants>["state"]
>;

/** SearchBar: the pill around the magnifier, the field and the clear button. */
export const searchShellClass =
  "flex-row items-center gap-sm rounded-full border border-line bg-surface px-gutter";
/** SearchBar's field inside the pill. */
export const searchFieldClass = "flex-1 text-ink";
