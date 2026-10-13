import { Pressable, Text } from "react-native";

// Selectable pill. Selected = ink fill / white text (matches the screens).
export function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`rounded-full border px-4 py-2 ${
        selected ? "border-ink bg-ink" : "border-line bg-surface"
      }`}
    >
      <Text
        className={`text-sm font-medium ${selected ? "text-onInk" : "text-ink"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
