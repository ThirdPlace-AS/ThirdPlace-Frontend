import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { useThemeColors } from "@/theme";

// Renders `value` as a 5-star row (full / half / outline). Display-only; the
// rating itself is a MOCK number. `size` and `color` are tunable for chip use.
export function RatingStars({
  value,
  size = 14,
  color,
  max = 5,
}: {
  value: number;
  size?: number;
  color?: string;
  max?: number;
}) {
  const colors = useThemeColors();
  const tint = color ?? colors.ember;
  return (
    <View
      className="flex-row"
      accessibilityLabel={`${value} av ${max} stjerner`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= value;
        const half = !filled && i + 0.5 <= value;
        const name = filled ? "star" : half ? "star-half" : "star-outline";
        return <Ionicons key={i} name={name} size={size} color={tint} />;
      })}
    </View>
  );
}
