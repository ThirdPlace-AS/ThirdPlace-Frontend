import { View } from "react-native";

import { DemoBadge } from "./DemoBadge";
import { Text } from "@/components/ui";

// DEMO badge + one muted line explaining what the demo does not do. The
// standard honesty marker for demo actions; text comes from `@/copy`.
export function DemoNote({ children }: { children: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <DemoBadge />
      <Text variant="caption" tone="muted" className="flex-1">
        {children}
      </Text>
    </View>
  );
}
