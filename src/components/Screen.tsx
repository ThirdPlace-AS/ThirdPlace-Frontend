import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Standard screen scaffold: safe-area + light background + consistent gutter.
// `scroll` wraps children in a ScrollView; otherwise a plain padded View.
export function Screen({
  children,
  scroll = false,
  edges = ["top"],
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
}) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={edges}>
      {scroll ? (
        <ScrollView contentContainerClassName="gap-5 p-gutter">
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 p-gutter">{children}</View>
      )}
    </SafeAreaView>
  );
}
