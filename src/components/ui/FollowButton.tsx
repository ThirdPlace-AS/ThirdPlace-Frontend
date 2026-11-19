// FollowButton (docs/design/DESIGN_SYSTEM.md §5) — "Følg" (ink pill) morphs to
// "Følger" (quiet muted pill). The label cross-fades to confirm the tap. Following is local demo state wherever it is used.
import Animated, { FadeIn } from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { duration } from "@/theme";

import { followButtonClass } from "./base/button";
import { Pressable } from "./Pressable";
import { Text } from "./Text";

export function FollowButton({
  following,
  onPress,
  size = "sm",
  name,
  fullWidth = false,
  followLabel = "Følg",
}: {
  following: boolean;
  onPress: () => void;
  /** sm = list rows (36), md = profile header (48, same as Button md). */
  size?: "sm" | "md";
  /** Who is followed — makes the label specific for screen readers. */
  name?: string;
  fullWidth?: boolean;
  /** Label while not following, e.g. "Følg tilbake" for a follower (PDF p13). */
  followLabel?: string;
}) {
  const reduced = useReducedMotion();
  const height = size === "md" ? 48 : 36;
  return (
    <Pressable
      accessibilityRole="button"
      // sm is 36 dp tall: top up to the 44 dp target.
      hitSlop={size === "md" ? undefined : { top: 4, bottom: 4 }}
      accessibilityLabel={
        following
          ? `Slutt å følge${name ? ` ${name}` : ""}`
          : `${followLabel}${name ? ` ${name}` : ""}`
      }
      accessibilityState={{ selected: following }}
      pressedScale={0.95}
      onPress={onPress}
      className={fullWidth ? "w-full" : undefined}
      contentClassName={followButtonClass({ size, following })}
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
          {following ? "Følger" : followLabel}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
