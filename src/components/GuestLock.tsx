import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { colors } from "@/theme";

// Inline notice that a feature needs an account. Visual only — it does NOT
// implement authorization (that is BLOCKED_CONTRACT_GAP until policies exist).
export function GuestLock({ message }: { message: string }) {
  return (
    <View className="flex-row items-center gap-2 rounded-md border border-line bg-surfaceMuted px-3 py-2">
      <Ionicons name="lock-closed-outline" size={16} color={colors.muted} />
      <Text className="flex-1 text-sm text-muted">{message}</Text>
    </View>
  );
}
