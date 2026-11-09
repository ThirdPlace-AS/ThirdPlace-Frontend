// Full-screen photo viewer (PDF p24 Bildeviser; Phase 11 G5): swipe between
// photos, "3 av 10" counter, ✕ to close; Android back closes (Overlay).
// Bundled fixture photos only (no media contract).
import { useState } from "react";
import {
  FlatList,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { media } from "@/theme";

import { IconButton } from "./IconButton";
import { LoadingImage } from "./LoadingImage";
import { Overlay } from "./Overlay";
import { StatusBarStyle } from "./StatusBarStyle";
import { Text } from "./Text";

export function PhotoViewer({
  photos,
  index,
  onClose,
  label,
}: {
  photos: readonly ImageSourcePropType[];
  /** Photo to open at; null = closed. */
  index: number | null;
  onClose: () => void;
  label?: string;
}) {
  // Keep the last index while the Overlay animates out.
  const [shown, setShown] = useState(index ?? 0);
  if (index !== null && index !== shown) setShown(index);
  return (
    <Overlay
      visible={index !== null}
      onClose={onClose}
      enter="fade"
      statusBarTranslucent
      style={{ backgroundColor: media.black }}
      accessibilityLabel={label ?? "Bilder"}
    >
      <ViewerBody photos={photos} start={shown} onClose={onClose} />
    </Overlay>
  );
}

function ViewerBody({
  photos,
  start,
  onClose,
}: {
  photos: readonly ImageSourcePropType[];
  start: number;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [current, setCurrent] = useState(start);
  const n = photos.length;
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setCurrent(Math.round(e.nativeEvent.contentOffset.x / width));
  return (
    <View className="flex-1">
      <StatusBarStyle style="light" />
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
              transition={150}
              style={{ width, height: height * 0.8 }}
            />
          </View>
        )}
      />
      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 flex-row items-center justify-between px-gutter"
        style={{ top: insets.top + 8 }}
      >
        <IconButton
          icon="close"
          label="Lukk"
          variant="mediaSubtle"
          onPress={onClose}
        />
        <Text variant="label" weight="semibold" tone="onMedia">
          {`${current + 1} av ${n}`}
        </Text>
        <View className="w-10" />
      </View>
    </View>
  );
}
