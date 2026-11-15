// `cn()` — the shadcn / React Native Reusables class helper (DESIGN_SYSTEM.md
// §4 "Base layer"). tailwind-merge only knows Tailwind's own scale, so our
// named type sizes and spacing are added from the tokens: without them
// `cn("text-display", "text-ink")` reads text-display as a colour and drops it.
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import { fontSizes, radius, spacing } from "@/theme";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: Object.keys(spacing),
      borderRadius: Object.keys(radius),
    },
    classGroups: {
      "font-size": [{ text: Object.keys(fontSizes) }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
