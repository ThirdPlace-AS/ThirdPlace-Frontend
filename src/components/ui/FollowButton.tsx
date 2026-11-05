// FollowButton (docs/design/DESIGN_SYSTEM.md §5) — "Følg" (ink pill) morphs to
// "Følger" (quiet muted pill). The label cross-fades; a selection haptic
// confirms the tap. Following is local demo state wherever it is used.
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";

import { duration } from "@/theme";

import { Pressable } from "./Pressable";
import { Text } from "./Text";

export function FollowButton({
  following,
  onPress,
  size = "sm",
  name,
  fullWidth = false,
}: {
  following: boolean;
  onPress: () => void;
  /** sm = list rows (36), md = profile header (48). */
  size?: "sm" | "md";
  /** Who is followed — makes the label specific for screen readers. */
  name?: string;
  fullWidth?: boolean;
}) {
  const reduced = useReducedMotion();
  const height = size === "md" ? 48 : 36;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        following
          ? `Slutt å følge${name ? ` ${name}` : ""}`
          : `Følg${name ? ` ${name}` : ""}`
      }
      accessibilityState={{ selected: following }}
      haptic="selection"
      pressedScale={0.95}
      onPress={onPress}
      className={fullWidth ? "w-full" : undefined}
      contentClassName={`items-center justify-center rounded-full ${
        size === "md" ? "px-6" : "px-4"
      } ${following ? "border border-line bg-surfaceMuted" : "border border-ink bg-ink"}`}
      contentStyle={{ height }}
    >
      <Animated.View
        key={following ? "on" : "off"}
        entering={reduced ? undefined : FadeIn.duration(duration.fast)}
      >
        <Text
          variant={size === "md" ? "body" : "label"}
          weight="semibold"
          tone={following ? "ink" : "onInk"}
        >
          {following ? "Følger" : "Følg"}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
