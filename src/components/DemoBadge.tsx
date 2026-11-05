import { Text, View } from "react-native";

// Marks UI whose action is a non-functional demo (no backend). Keeps the app
// honest: mock actions never masquerade as real services.
export function DemoBadge({ label = "DEMO" }: { label?: string }) {
  return (
    <View className="self-start rounded-full border border-line bg-surfaceMuted px-2 py-0.5">
      <Text className="text-[10px] font-semibold tracking-wide text-muted">
        {label}
      </Text>
    </View>
  );
}
