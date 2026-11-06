import { View } from "react-native";

import { Icon, Text } from "@/components/ui";

// Inline notice that a feature needs an account. Visual only — it does NOT
// implement authorization (that is BLOCKED_CONTRACT_GAP until policies exist).
export function GuestLock({ message }: { message: string }) {
  return (
    <View className="flex-row items-center gap-2 rounded-md border border-line bg-surfaceMuted px-3 py-2">
      <Icon name="lock-closed-outline" size="sm" tone="muted" />
      <Text variant="caption" tone="muted" className="flex-1">
        {message}
      </Text>
    </View>
  );
}
