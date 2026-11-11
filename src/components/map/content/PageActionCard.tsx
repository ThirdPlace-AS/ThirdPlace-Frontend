// The page sheet's floating action card: an experience's join card (PDF p6,
// the reference video) or a place's chat (user 2026-11-09: "a sticky action
// section but it should focus on the chat"). It shows only when the page is
// full screen (user 2026-11-09: "should only show when the screen is full"):
// it fades in with the page top bar on the last stretch of the drag
// (pageReveal) and takes touches and screen-reader focus only at the top
// snap. The card tracks the snap itself: gorhom renders footerComponent as a
// component type, so a new render callback would remount it (and close a
// pay or sign-in sheet opened from it).
import { useState } from "react";
import { View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { elevation, gutterPx } from "@/theme";

import { atPageTop, pageReveal } from "../pageTarget";

import { ExperienceJoinBar } from "./ExperienceJoinBar";
import { PlaceChatBar } from "./PlaceChatBar";

/** dp the card rises while it fades in (none with reduced motion). */
const RISE = 12;

export function PageActionCard({
  kind,
  id,
  animatedIndex,
  bottomPad,
  compact,
}: {
  kind: "experience" | "place";
  id: string;
  /** The sheet's gorhom animatedIndex. */
  animatedIndex: SharedValue<number>;
  /** Room for the gesture bar under the card. */
  bottomPad: number;
  /** Short phones: a tighter card. */
  compact: boolean;
}) {
  const reduce = useReducedMotion();
  // Starts hidden: the sheet opens at the peek or mid snap, and the reaction
  // reports the real position on its first run (a remount at the top too).
  const [atTop, setAtTop] = useState(false);
  useAnimatedReaction(
    () => atPageTop(animatedIndex.value),
    (now, prev) => {
      if (now !== prev) runOnJS(setAtTop)(now);
    },
  );
  const rise = reduce ? 0 : RISE;
  const reveal = useAnimatedStyle(() => {
    const t = pageReveal(animatedIndex.value);
    return { opacity: t, transform: [{ translateY: (1 - t) * rise }] };
  }, [rise]);

  return (
    <Animated.View
      testID="page-action-card"
      pointerEvents={atTop ? "box-none" : "none"}
      accessibilityElementsHidden={!atTop}
      importantForAccessibility={atTop ? "auto" : "no-hide-descendants"}
      style={[
        { paddingHorizontal: gutterPx, paddingBottom: bottomPad },
        reveal,
      ]}
    >
      <View
        className={`rounded-lg border border-line bg-surface px-4 ${
          compact ? "py-2" : "py-3"
        }`}
        style={elevation.e2}
      >
        {kind === "place" ? (
          <PlaceChatBar placeId={id} />
        ) : (
          <ExperienceJoinBar id={id} />
        )}
      </View>
    </Animated.View>
  );
}
