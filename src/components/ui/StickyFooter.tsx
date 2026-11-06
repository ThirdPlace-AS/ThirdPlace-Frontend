// StickyFooter (docs/design/DESIGN_SYSTEM.md §4): the primary action of a
// flow or single-goal screen, pinned below the scroll area so it is never
// pushed below the fold on a short phone. A hairline and the page background
// separate it from content scrolling underneath.
//
// Place it as a sibling AFTER the ScrollView (inside a KeyboardAvoidingView
// when the screen has inputs). `safeBottom` adds the bottom inset for screens
// whose <Screen> does not pad the bottom edge (stack routes use edges top).
import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function StickyFooter({
  children,
  safeBottom = false,
}: {
  children: ReactNode;
  safeBottom?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="gap-3 border-t border-line bg-background px-gutter pt-3"
      style={{ paddingBottom: safeBottom ? Math.max(insets.bottom, 12) : 12 }}
    >
      {children}
    </View>
  );
}
