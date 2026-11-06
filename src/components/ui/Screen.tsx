// Screen scaffold (docs/design/DESIGN_SYSTEM.md §4): theme background + safe
// area. Drop-in for `<SafeAreaView className="flex-1 bg-background">`,
// padded from the provider insets; opt into
// `scroll` (ScrollView with section spacing) and/or `padded` (gutter padding).
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets, type Edge } from "react-native-safe-area-context";

const ALL: readonly Edge[] = ["top", "right", "bottom", "left"];

export function Screen({
  children,
  edges,
  scroll = false,
  padded = false,
}: {
  children: ReactNode;
  /** Safe-area edges; defaults to all four (SafeAreaView default). */
  edges?: readonly Edge[];
  scroll?: boolean;
  padded?: boolean;
}) {
  // Padding comes from the provider insets (seeded from the native window in
  // app/_layout.tsx), not a native SafeAreaView: those measure after mount, so
  // on a busy device a freshly pushed screen could paint a frame or more with
  // its header under the status bar (fresh-eyes review H1).
  const insets = useSafeAreaInsets();
  const on = new Set(edges ?? ALL);
  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: on.has("top") ? insets.top : 0,
        paddingRight: on.has("right") ? insets.right : 0,
        paddingBottom: on.has("bottom") ? insets.bottom : 0,
        paddingLeft: on.has("left") ? insets.left : 0,
      }}
    >
      {scroll ? (
        <ScrollView
          contentContainerClassName={`gap-lg ${padded ? "p-gutter" : ""}`}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : padded ? (
        <View className="flex-1 p-gutter">{children}</View>
      ) : (
        children
      )}
    </View>
  );
}
