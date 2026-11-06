// Swipeable photo strip for a browse card (Phase 8, benchmark B3): pages
// horizontally with dots at the bottom; a single photo renders without dots.
// Bundled demo art only (no media contract).
import { Image } from "expo-image";
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

export function PhotoPager({
  photos,
  onIndexChange,
}: {
  photos: ImageSourcePropType[];
  /** Reports the page after each swipe (e.g. to open the viewer there). */
  onIndexChange?: (index: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
    onIndexChange?.(i);
  };
  return (
    <View
      className="absolute inset-0"
      onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
    >
      {width > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onEnd}
          accessible={false}
        >
          {photos.map((src, i) => (
            <Image
              key={i}
              source={src}
              contentFit="cover"
              transition={150}
              style={{ width, height: "100%" }}
              accessible={false}
            />
          ))}
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
