// Screen scaffold (docs/design/DESIGN_SYSTEM.md §4): theme background + safe
// area. Drop-in for `<SafeAreaView className="flex-1 bg-background">`; opt into
// `scroll` (ScrollView with section spacing) and/or `padded` (gutter padding).
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

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
  return (
    <SafeAreaView className="flex-1 bg-background" edges={edges}>
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
    </SafeAreaView>
  );
}
