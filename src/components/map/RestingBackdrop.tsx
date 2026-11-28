import { createContext, memo, useContext, useMemo } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  useBottomSheet,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

import { useThemeColors } from "@/theme";

// The map detail sheet's backdrop (0577). gorhom's own backdrop switched its
// touch handling with a React state update when a drag crossed the peek
// (index 0): a commit mid-drag, and on the Android 10 phone a stalled frame
// right there. Here the sheet decides once it has come to rest (onChange),
// and the backdrop reads that from context, so nothing renders mid-drag and
// renderBackdrop stays one function (a new one remounted the backdrop).

export type BackdropState = {
  /** Catches taps (and closes the sheet) only at rest above the peek. */
  touchable: boolean;
  /** Screen-reader props: "Lukk" over the map, silent under the page. */
  a11y: {
    accessible?: boolean;
    accessibilityLabel?: string | null;
    accessibilityHint?: string | null;
    accessibilityRole?: "button" | null;
  };
};

export const BackdropContext = createContext<BackdropState>({
  touchable: false,
  a11y: {},
});

const OPACITY = 0.5;

function RestingBackdropComponent({
  animatedIndex,
  style,
}: BottomSheetBackdropProps) {
  const { touchable, a11y } = useContext(BackdropContext);
  const silent = a11y.accessible === false;
  const { close } = useBottomSheet();
  const c = useThemeColors();
  // Same fade as gorhom's backdrop: clear at the peek, full at the middle.
  const fade = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [-1, 0, 1],
      [0, 0, OPACITY],
      Extrapolation.CLAMP,
    ),
  }));
  const tap = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        runOnJS(close)();
      }),
    [close],
  );
  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          style,
          { backgroundColor: c.scrim },
          fade,
        ]}
        pointerEvents={touchable ? "auto" : "none"}
        // Silent under the page: a prop set back to undefined kept its old
        // value on Android (content-desc stayed "Lukk"), so the label and
        // hint are cleared with "" and the view leaves the screen reader's
        // tree.
        importantForAccessibility={silent ? "no-hide-descendants" : "auto"}
        accessibilityElementsHidden={silent}
        accessible={!silent}
        accessibilityRole={silent ? "none" : "button"}
        accessibilityLabel={silent ? "" : (a11y.accessibilityLabel ?? "")}
        accessibilityHint={silent ? "" : (a11y.accessibilityHint ?? "")}
      />
    </GestureDetector>
  );
}

export const RestingBackdrop = memo(RestingBackdropComponent);
