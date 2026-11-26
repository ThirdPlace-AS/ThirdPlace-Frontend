// The page sheet's floating action card: an experience's join card (PDF p6,
// the reference video) or a place's chat (user 2026-11-09: "a sticky action
// section but it should focus on the chat"). It shows only when the page is
// full screen (user 2026-11-09: "should only show when the screen is full"):
// it fades in once the sheet is at the top snap and fades out as soon as it
// leaves it (0461: a card tied to the drag covered the rows while the page
// rose), and takes touches and screen-reader focus only there. The card
// tracks the snap itself: gorhom renders footerComponent as a
// component type, so a new render callback would remount it (and close a
// pay or sign-in sheet opened from it).
import { useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { duration, easing, elevation, gutterPx, useRaisedEdge } from "@/theme";

import { atPageTop } from "../pageTarget";

import { ExperienceJoinBar } from "./ExperienceJoinBar";
import { PlaceChatBar } from "./PlaceChatBar";

/** dp the card rises while it fades in (none with reduced motion). */
const RISE = 12;
const ENTER = Easing.bezier(...easing.enter);
const EXIT = Easing.bezier(...easing.exit);

export function PageActionCard({
  kind,
  id,
  animatedIndex,
  bottomPad,
  compact,
  onManage,
}: {
  kind: "experience" | "place";
  id: string;
  /** The sheet's gorhom animatedIndex. */
  animatedIndex: SharedValue<number>;
  /** Room for the gesture bar under the card. */
  bottomPad: number;
  /** Short phones: a tighter card. */
  compact: boolean;
  /** Opens the host view (the viewer hosts this experience, 0464). */
  onManage?: () => void;
}) {
  const reduce = useReducedMotion();
  const edge = useRaisedEdge();
  // Starts hidden: the sheet opens at the peek or mid snap, and the reaction
  // reports the real position on its first run (a remount at the top too).
  const [atTop, setAtTop] = useState(false);
  // 0 hidden · 1 shown; timed, not tied to the drag.
  const shown = useSharedValue(0);
  useAnimatedReaction(
    () => atPageTop(animatedIndex.value),
    (now, prev) => {
      if (now === prev) return;
      const to = now ? 1 : 0;
      // The first run (a remount) and reduced motion jump straight there.
      if (prev === null || reduce) shown.value = to;
      else
        shown.value = now
          ? withTiming(1, { duration: duration.base, easing: ENTER })
          : withTiming(0, { duration: duration.fast, easing: EXIT });
      runOnJS(setAtTop)(now);
    },
    [reduce],
  );
  const rise = reduce ? 0 : RISE;
  const reveal = useAnimatedStyle(() => {
    const t = shown.value;
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
        className={`rounded-md ${edge} bg-surface px-4 ${
          compact ? "py-2" : "py-3"
        }`}
        style={elevation.e2}
      >
        {kind === "place" ? (
          <PlaceChatBar placeId={id} />
        ) : (
          <ExperienceJoinBar id={id} onManage={onManage} />
        )}
      </View>
    </Animated.View>
  );
}
