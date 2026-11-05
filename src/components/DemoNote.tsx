import { Text, View } from "react-native";

import { DemoBadge } from "./DemoBadge";

// DEMO badge + one muted line explaining what the demo does not do. The
// standard honesty marker for demo actions; text comes from `@/copy`.
export function DemoNote({ children }: { children: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <DemoBadge />
      <Text className="flex-1 text-xs text-muted font-normal">{children}</Text>
    </View>
  );
}
