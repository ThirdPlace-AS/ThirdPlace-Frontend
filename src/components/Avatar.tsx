import { Text, View } from "react-native";

// Initials avatar (no real images in the demo).
export function Avatar({
  initials,
  size = 40,
}: {
  initials: string;
  size?: number;
}) {
  return (
    <View
      className="items-center justify-center rounded-full bg-surfaceMuted"
      style={{ width: size, height: size }}
    >
      <Text className="text-sm font-semibold text-ink">{initials}</Text>
    </View>
  );
}
