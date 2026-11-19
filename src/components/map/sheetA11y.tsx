// TalkBack for the map's gorhom sheets (browse + detail). The library's
// defaults are English ("Bottom Sheet", "Bottom sheet handle", "Drag up or
// down to extend or minimize the bottom sheet", "Tap to close the bottom
// sheet") and its "adjustable" handle had no actions, so a screen-reader user
// heard English and could not resize the sheet. Here the container is not
// announced (its content is), the background is silent, and the handle is a
// Norwegian adjustable control: swipe up on it expands the sheet, swipe down
// collapses it. Kept out of ui/Sheet.tsx so the Modal engine (and its tests)
// never load the gorhom module.
import {
  useBottomSheet,
  type BottomSheetBackgroundProps,
  type BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
import { View, type AccessibilityActionEvent } from "react-native";

import { useThemeColors } from "@/theme";

/** Accessibility props for a gorhom handle (spread on its outer View). */
export function useSheetHandleA11y() {
  const { expand, collapse } = useBottomSheet();
  return {
    accessible: true,
    accessibilityRole: "adjustable" as const,
    accessibilityLabel: "Endre størrelse",
    accessibilityHint: "Sveip opp for å vise mer, eller ned for å vise mindre.",
    accessibilityActions: [
      { name: "increment", label: "Vis mer" },
      { name: "decrement", label: "Vis mindre" },
    ],
    onAccessibilityAction: (e: AccessibilityActionEvent) => {
      if (e.nativeEvent.actionName === "increment") expand();
      else if (e.nativeEvent.actionName === "decrement") collapse();
    },
  };
}

// Same look as gorhom's default handle with useSheetChrome()'s indicator
// (10 px padding, 40 × 4 bar in the line colour), so the measured peek is
// unchanged.
function SheetHandle(_props: BottomSheetHandleProps) {
  const c = useThemeColors();
  const a11y = useSheetHandleA11y();
  return (
    <View style={{ padding: 10 }} {...a11y}>
      <View
        style={{
          alignSelf: "center",
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: c.line,
        }}
      />
    </View>
  );
}

function SheetBackground({ style }: BottomSheetBackgroundProps) {
  return <View pointerEvents="none" style={style} />;
}

/** Spread after `useSheetChrome()` on a gorhom BottomSheet. */
export const sheetA11yChrome = {
  // null, not undefined: undefined falls back to the English defaults, and
  // Android still reads a labelled view that is not focusable.
  accessible: false,
  accessibilityLabel: null,
  accessibilityRole: null,
  handleComponent: SheetHandle,
  backgroundComponent: SheetBackground,
} as const;

/** BottomSheetBackdrop labels (its defaults are English). */
export const backdropA11y = {
  accessibilityLabel: "Lukk",
  accessibilityHint: "Lukker detaljene og viser kartet.",
} as const;
