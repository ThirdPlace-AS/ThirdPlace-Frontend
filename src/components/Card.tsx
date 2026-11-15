import type { ReactNode } from "react";
import { View } from "react-native";

export function Card({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-lg border border-line bg-surface p-4">
      {children}
    </View>
  );
}
