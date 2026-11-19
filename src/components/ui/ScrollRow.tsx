// ScrollRow (docs/design/DESIGN_SYSTEM.md §4): a single line of chips or
// avatars that scrolls sideways and bleeds to the screen edges, instead of
// wrapping one orphan onto a second line on a 360 dp phone. Use inside a
// gutter-padded scroll area (the bleed cancels that padding).
import type { ReactNode } from "react";
import { ScrollView } from "react-native";

import { gutterPx } from "@/theme";

export function ScrollRow({
  children,
  gap = "gap-2",
  radio = false,
}: {
  children: ReactNode;
  /** Spacing class between items (gap-2 chips, gap-3 avatars). */
  gap?: "gap-2" | "gap-3";
  /** Announce the row as a single-choice group (tabs as chips). */
  radio?: boolean;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole={radio ? "radiogroup" : undefined}
      // -mx-gutter generates nothing for the custom token; bleed explicitly.
      style={{ marginHorizontal: -gutterPx, flexGrow: 0 }}
      contentContainerClassName={`${gap} px-gutter`}
    >
      {children}
    </ScrollView>
  );
}
