import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// Shimmer placeholder block. Respects reduced-motion (static when enabled).
export function Skeleton({
  height = 16,
  width,
  rounded = "md",
}: {
  height?: number;
  width?: number | `${number}%`;
  rounded?: "sm" | "md" | "lg" | "full";
}) {
  const opacity = useSharedValue(0.5);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity, reduced]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const radius = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }[rounded];

  return (
    <Animated.View style={[{ height, width: width ?? "100%" }, style]}>
      <View className={`h-full w-full bg-surfaceMuted ${radius}`} />
    </Animated.View>
  );
}

// A card-shaped skeleton row used by list loading states.
export function SkeletonCard() {
  return (
    <View className="gap-2 rounded-lg border border-line bg-surface p-4">
      <Skeleton height={18} width="60%" />
      <Skeleton height={12} width="30%" />
      <Skeleton height={12} width="90%" />
    </View>
  );
}
