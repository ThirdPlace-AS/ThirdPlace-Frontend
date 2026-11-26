// Full-screen photo viewer (PDF p24 Bildeviser; Phase 11 G5): swipe between
// photos, "3 av 10" counter, ✕ to close (top right, as Airbnb’s viewer),
// a swipe down closes it too (user 2026-11-26); Android back closes (Overlay).
// Bundled fixture photos only (no media contract).
// Opens out of the tapped thumbnail when the caller passes its rect (`from`,
// see useOriginRect) and shrinks back into it if closed on the same photo;
// after paging to another photo it fades out (0457).
import { useState } from "react";
import {
  FlatList,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { smallImage } from "@/fixtures/images";
import { media } from "@/theme";
import { motion } from "@/theme/motion";

import { IconButton } from "./IconButton";
import { LoadingImage } from "./LoadingImage";
import type { Rect } from "./originMotion";
import { Overlay } from "./Overlay";
import { StatusBarStyle } from "./StatusBarStyle";
import { Text } from "./Text";

/** Drag (dp) or downward speed (dp/s) that closes the viewer. */
const CLOSE_DRAG = 120;
const CLOSE_FLICK = 900;

export function PhotoViewer({
  photos,
  index,
  onClose,
  label,
  from,
}: {
  photos: readonly ImageSourcePropType[];
  /** Photo to open at; null = closed. */
  index: number | null;
  onClose: () => void;
  label?: string;
  /** Window rect of the tapped thumbnail; without it the viewer zooms from
   *  the press point. */
  from?: Rect | null;
}) {
  // Keep the last index while the Overlay animates out.
  const [shown, setShown] = useState(index ?? 0);
  // Still on the photo it opened at: closing shrinks back into the thumbnail.
  const [atStart, setAtStart] = useState(true);
  if (index !== null && index !== shown) setShown(index);
  const [wasOpen, setWasOpen] = useState(index !== null);
  if ((index !== null) !== wasOpen) {
    setWasOpen(index !== null);
    if (index !== null) setAtStart(true);
  }
  return (
    <Overlay
      visible={index !== null}
      onClose={onClose}
      enter={atStart ? "zoom" : "fade"}
      from={from}
      backdrop={media.black}
      statusBarTranslucent
      accessibilityLabel={label ?? "Bilder"}
    >
      <ViewerBody
        photos={photos}
        start={shown}
        onClose={onClose}
        onPage={(i) => setAtStart(i === shown)}
      />
    </Overlay>
  );
}

function ViewerBody({
  photos,
  start,
  onClose,
  onPage,
}: {
  photos: readonly ImageSourcePropType[];
  start: number;
  onClose: () => void;
  onPage: (index: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [current, setCurrent] = useState(start);
  const n = photos.length;
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrent(i);
    onPage(i);
  };
  // Swipe down to close: the photo follows the finger (a little smaller as
  // it goes) and the bar fades; past CLOSE_DRAG or a quick flick it closes,
  // otherwise it springs back. Sideways drags stay with the pager.
  const drag = useSharedValue(0);
  const pan = Gesture.Pan()
    .activeOffsetY(16)
    .failOffsetX([-16, 16])
    .onUpdate((e) => {
      drag.set(Math.max(0, e.translationY));
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_DRAG || e.velocityY > CLOSE_FLICK) {
        runOnJS(onClose)();
      } else {
        drag.set(withTiming(0, { duration: motion.duration.fast }));
      }
    });
  const photoStyle = useAnimatedStyle(() => {
    const v = drag.get();
    return {
      transform: [
        { translateY: v },
        { scale: 1 - Math.min(v / height, 1) * 0.25 },
      ],
    };
  });
  const barStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(drag.get() / CLOSE_DRAG, 1),
  }));
  return (
    <View className="flex-1">
      <StatusBarStyle style="light" />
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ flex: 1 }, photoStyle]}>
          <FlatList
            data={photos as ImageSourcePropType[]}
            horizontal
            pagingEnabled
            initialScrollIndex={Math.min(start, n - 1)}
            getItemLayout={(_, i) => ({
              length: width,
              offset: width * i,
              index: i,
            })}
            // The photo opened and its neighbours, not the whole set (speed pass
            // 0350: the defaults mounted and decoded up to ten full photos).
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={3}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onEnd}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item, index: i }) => (
              <View
                style={{ width, height }}
                className="justify-center"
                accessible
                accessibilityRole="image"
                accessibilityLabel={`Bilde ${i + 1} av ${n}`}
              >
                <LoadingImage
                  source={item}
                  contentFit="contain"
                  // The small file the thumbnail just drew (in memory) paints on
                  // the first frame, so the photo grows from the start (0457).
                  placeholder={smallImage(item)}
                  placeholderContentFit="contain"
                  transition={150}
                  style={{ width, height: height * 0.8 }}
                />
              </View>
            )}
          />
        </Animated.View>
      </GestureDetector>
      <Animated.View
        pointerEvents="box-none"
        style={[
          { position: "absolute", left: 0, right: 0, top: insets.top + 8 },
          barStyle,
        ]}
      >
        <View
          pointerEvents="box-none"
          className="flex-row items-center justify-between px-gutter"
        >
          <View className="w-10" />
          <Text variant="label" weight="semibold" tone="onMedia">
            {`${current + 1} av ${n}`}
          </Text>
          <IconButton
            icon="close"
            label="Lukk"
            variant="mediaSubtle"
            onPress={onClose}
          />
        </View>
      </Animated.View>
    </View>
  );
}
