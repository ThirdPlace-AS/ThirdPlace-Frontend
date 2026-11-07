// Skeleton (docs/design/DESIGN_SYSTEM.md §4 "Loading") — calm placeholder
// blocks that pulse while a list loads. Static under reduced motion. Group them
// in <SkeletonList> so screen readers hear one "Laster" instead of each block.
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { duration } from "@/theme";

export type SkeletonRadius = "sm" | "md" | "lg" | "full";

// Literal class names so Tailwind generates them.
const RADIUS: Record<SkeletonRadius, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({
  height = 16,
  width,
  rounded = "md",
}: {
  height?: number;
  width?: number | `${number}%`;
  rounded?: SkeletonRadius;
}) {
  const opacity = useSharedValue(0.55);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(
      withTiming(1, { duration: duration.shimmer }),
      -1,
      true,
    );
  }, [opacity, reduced]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ height, width: width ?? "100%" }, style]}>
      <View className={`h-full w-full bg-surfaceMuted ${RADIUS[rounded]}`} />
    </Animated.View>
  );
}

/** Card-shaped placeholder (photo + two lines), e.g. map browse cards. */
export function SkeletonCard({ media = false }: { media?: boolean }) {
  return (
    <View className="gap-sm">
      {media ? <Skeleton height={180} rounded="lg" /> : null}
      <Skeleton height={18} width="60%" />
      <Skeleton height={12} width="35%" />
    </View>
  );
}

/** Row placeholder (avatar + two lines), e.g. chat or people lists. */
export function SkeletonRow() {
  return (
    <View className="flex-row items-center gap-md py-sm">
      <Skeleton height={44} width={44} rounded="full" />
      <View className="flex-1 gap-sm">
        <Skeleton height={14} width="55%" />
        <Skeleton height={12} width="80%" />
      </View>
    </View>
  );
}

export function SkeletonList({
  count = 3,
  variant = "row",
  label = "Laster",
}: {
  count?: number;
  variant?: "row" | "card" | "mediaCard";
  label?: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      className={variant === "row" ? "gap-xs" : "gap-xl"}
    >
      {Array.from({ length: count }, (_, i) =>
        variant === "row" ? (
          <SkeletonRow key={i} />
        ) : (
          <SkeletonCard key={i} media={variant === "mediaCard"} />
        ),
      )}
    </View>
  );
}
