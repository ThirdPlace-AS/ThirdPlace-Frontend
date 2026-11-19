// Swipeable photo strip for a browse card (Phase 8, benchmark B3): pages
// horizontally with dots at the bottom; a single photo renders without dots.
// Bundled demo art only (no media contract).
import { useState } from "react";
import {
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from "react-native";
// Gesture-handler ScrollView: a plain RN one lost the horizontal pan to the
// browse sheet's gesture handler, so photos never paged.
import { ScrollView } from "react-native-gesture-handler";

import { LoadingImage } from "@/components/ui/LoadingImage";

export function PhotoPager({
  photos,
  width: knownWidth,
  onIndexChange,
}: {
  photos: ImageSourcePropType[];
  /** The pager's width when the parent already knows it (the browse list
   * measures its cards once), so no layout pass is needed before the first
   * photo paints. Measured with onLayout when left out. */
  width?: number;
  /** Reports the page after each swipe (e.g. to open the viewer there). */
  onIndexChange?: (index: number) => void;
}) {
  const [measured, setMeasured] = useState(0);
  const width = knownWidth ?? measured;
  const [index, setIndex] = useState(0);
  // Only the first photo is mounted (and decoded) until the person starts
  // swiping; then the rest join (speed pass 0349: every page of every card
  // was decoded up front, ~100 bitmaps after scrolling the browse list).
  // The pages not yet mounted keep their width, so paging lines up.
  const [allPages, setAllPages] = useState(false);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
    onIndexChange?.(i);
  };
  return (
    <View
      className="absolute inset-0"
      onLayout={
        knownWidth === undefined
          ? (e) => setMeasured(Math.round(e.nativeEvent.layout.width))
          : undefined
      }
    >
      {width > 0 ? (
        <ScrollView
          testID="photo-pager"
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={
            allPages || photos.length < 2 ? undefined : () => setAllPages(true)
          }
          onMomentumScrollEnd={onEnd}
          accessible={false}
          // Android still exposes a scroller to TalkBack (it read an empty
          // label); the gallery or card around it carries the label.
          importantForAccessibility="no-hide-descendants"
        >
          {photos.map((src, i) =>
            i === 0 || allPages ? (
              <LoadingImage
                key={i}
                source={src}
                contentFit="cover"
                transition={150}
                style={{ width, height: "100%" }}
                accessible={false}
              />
            ) : (
              <View key={i} testID="photo-page-later" style={{ width }} />
            ),
          )}
        </ScrollView>
      ) : null}
      {photos.length > 1 ? (
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="absolute inset-x-0 bottom-3 flex-row justify-center gap-1.5"
        >
          {photos.slice(0, 5).map((_, i) => (
            <View
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === Math.min(index, 4) ? "bg-white" : "bg-white/60"
              }`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
