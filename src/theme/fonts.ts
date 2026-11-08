// Typeface (docs/design/DESIGN_SYSTEM.md §2 "Typeface"): DM Sans, chosen by the
// founder on 2026-11-05 (open licence, OFL). Four weights. Android ignores
// `fontWeight` for custom fonts, so each weight is its own family name and the
// `Text` primitive picks the family from the weight.
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";

export type FontWeight = "regular" | "medium" | "semibold" | "bold";

// Family names live in tokens.js (Tailwind font-* utilities use them too).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tokens = require("./tokens.js") as {
  fontFamily: Record<FontWeight, string>;
};
export const FONT_FAMILY = tokens.fontFamily;

/** Font assets for `useFonts` at the root (family name → file). */
export const fontAssets = {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
};

/** Family name for a weight. */
export function fontFamilyFor(weight: FontWeight): string {
  return FONT_FAMILY[weight];
}
