// Sveip's details, opened in place from the card's info button: the same page
// as the map's and the routes' (user 2026-11-20: "the details page needs to
// look like the one on the map"). It is the experience's or place's own page
// body, with its top bar, gallery, sections and (for an experience) the
// floating join card: ExperiencePageBody / PlacePageBody, the screens behind
// /experience/[id] and /place/[id]. It slides up over the deck, and its back
// button, the system back and a commit close it again.
import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  SheetStageContext,
  STAGE_REST_DELAY_MS,
  type SheetStage,
} from "@/components/map/sheetStage";
import { experienceById, placeById } from "@/fixtures";
import { ExperiencePageBody } from "@/features/experience/ExperienceScreen";
import { PlacePageBody } from "@/features/place/PlaceScreen";
import { useStepBack } from "@/lib/useStepBack";

import type { DeckItem } from "./deckItems";

const OPEN_MS = 260;
const CLOSE_MS = 220;

export function SwipeDetails({
  item,
  reduced,
  closing,
  onClose,
  onClosed,
}: {
  item: DeckItem;
  reduced: boolean;
  /** Set by the deck to run the close (back button, system back, a commit). */
  closing: boolean;
  /** Asks the deck to close. */
  onClose: () => void;
  onClosed: () => void;
}) {
  const { height } = useWindowDimensions();
  const p = useSharedValue(reduced ? 1 : 0);
  // System back closes the details (and only them) while Sveip is focused.
  useStepBack(!closing, onClose);

  // The page opens with its first screen only (top bar, gallery, title and
  // first rows), so the slide starts at once; the rest mounts once it has
  // landed, as the map's page sheet does (user 2026-11-24: the details were
  // slow to appear: ~0.3-0.4 s of render before the slide on production JS).
  const [stage, setStage] = useState<SheetStage>(reduced ? 2 : 1);
  useEffect(() => {
    if (stage !== 1 || closing) return;
    // Nothing mounts during the slide; a moment after it, the rest.
    const t = setTimeout(() => setStage(2), OPEN_MS + STAGE_REST_DELAY_MS);
    return () => clearTimeout(t);
  }, [stage, closing]);
  useEffect(() => {
    if (reduced) return;
    p.value = withTiming(1, {
      duration: OPEN_MS,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!closing) return;
    if (reduced) {
      onClosed();
      return;
    }
    // A Reanimated shared value, driven on the UI thread (not React state).
    // eslint-disable-next-line react-hooks/immutability
    p.value = withTiming(
      0,
      { duration: CLOSE_MS, easing: Easing.out(Easing.cubic) },
      (fin) => {
        "worklet";
        if (fin) runOnJS(onClosed)();
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - p.value) * height }],
  }));

  const exp = item.kind === "experience" ? experienceById(item.id) : undefined;
  const place = item.kind === "place" ? placeById(item.id) : undefined;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { zIndex: 25, elevation: 25 }, style]}
      accessibilityViewIsModal
    >
      <SheetStageContext.Provider value={stage}>
        {exp ? (
          <ExperiencePageBody exp={exp} onBack={onClose} />
        ) : place ? (
          <PlacePageBody place={place} onBack={onClose} />
        ) : null}
      </SheetStageContext.Provider>
    </Animated.View>
  );
}
