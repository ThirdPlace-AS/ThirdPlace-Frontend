// Typeface (docs/design/DESIGN_SYSTEM.md §2 "Typeface"): Inter (open licence,
// OFL), user 2026-11-15 with the shadcn.io Airbnb design system; it replaced
// DM Sans (2026-11-05). Four weights. Android ignores
// `fontWeight` for custom fonts, so each weight is its own family name and the
// `Text` primitive picks the family from the weight.
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";

export type FontWeight = "regular" | "medium" | "semibold" | "bold";

// Family names live in tokens.js (Tailwind font-* utilities use them too).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tokens = require("./tokens.js") as {
  fontFamily: Record<FontWeight, string>;
};
export const FONT_FAMILY = tokens.fontFamily;

/** Font assets for `useFonts` at the root (family name → file). */
export const fontAssets = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
};

/** Family name for a weight. */
export function fontFamilyFor(weight: FontWeight): string {
  return FONT_FAMILY[weight];
}
