// Typeface (docs/design/DESIGN_SYSTEM.md §2 "Typeface").
//
// One open-licence geometric sans, four weights. Android ignores `fontWeight`
// for custom fonts, so each weight is its own family name and the `Text`
// primitive picks the family from the weight.
//
// Two candidates are loaded while the founder chooses in the specimen
// (app/_sandbox/theme.tsx). After the choice, delete the other candidate's
// imports here and its package from package.json.
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import { PlusJakartaSans_400Regular } from "@expo-google-fonts/plus-jakarta-sans/400Regular";
import { PlusJakartaSans_500Medium } from "@expo-google-fonts/plus-jakarta-sans/500Medium";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";

export type FontWeight = "regular" | "medium" | "semibold" | "bold";
export type FontSet = "dmSans" | "jakarta";

export const FONT_SETS: Record<FontSet, Record<FontWeight, string>> = {
  dmSans: {
    regular: "DMSans_400Regular",
    medium: "DMSans_500Medium",
    semibold: "DMSans_600SemiBold",
    bold: "DMSans_700Bold",
  },
  jakarta: {
    regular: "PlusJakartaSans_400Regular",
    medium: "PlusJakartaSans_500Medium",
    semibold: "PlusJakartaSans_600SemiBold",
    bold: "PlusJakartaSans_700Bold",
  },
};

export const FONT_LABELS: Record<FontSet, string> = {
  dmSans: "DM Sans",
  jakarta: "Plus Jakarta Sans",
};

/** The family the app uses. Candidate until founder sign-off. */
export const ACTIVE_FONT_SET: FontSet = "dmSans";

/** Font assets for `useFonts` at the root (family name → file). */
export const fontAssets = {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
};

/** Family name for a weight in a set (defaults to the active set). */
export function fontFamilyFor(
  weight: FontWeight,
  set: FontSet = ACTIVE_FONT_SET,
): string {
  return FONT_SETS[set][weight];
}
