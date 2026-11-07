// Photo with the loading rule (DESIGN_SYSTEM §4): a pulsing skeleton behind
// the image until it has loaded; if that takes more than 2 s, a spinner
// instead. Drop-in for expo-image's <Image> where a photo can arrive late.
// Bundled photos paint their blurred 16 px preview at once, stay in memory
// once decoded, and `thumb` swaps in the ≤480 px file for small slots.
import { Image, type ImageProps } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { imagePreview, smallImage } from "@/fixtures/images";
import { useLoadPhase } from "@/hooks/useLoadPhase";
import { useThemeColors } from "@/theme";

import { Skeleton } from "./Skeleton";

export function LoadingImage({
  style,
  onLoad,
  thumb = false,
  ...props
}: ImageProps & {
  /** Small slot (rail card, thumbnail, row): load the ≤480 px file. */
  thumb?: boolean;
}) {
  const c = useThemeColors();
  const [loaded, setLoaded] = useState(false);
  const [source, setSource] = useState(props.source);
  // A new source starts loading again.
  if (props.source !== source) {
    setSource(props.source);
    setLoaded(false);
  }
  const phase = useLoadPhase(!loaded);
  return (
    <View style={[{ overflow: "hidden" }, style]}>
      {phase === "skeleton" ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Skeleton height={9999} rounded="sm" />
        </View>
      ) : phase === "loader" ? (
        <View
          style={StyleSheet.absoluteFill}
          className="items-center justify-center bg-surfaceMuted"
          pointerEvents="none"
          accessibilityLabel="Laster bilde"
        >
          <ActivityIndicator color={c.muted} />
        </View>
      ) : null}
      <Image
        cachePolicy="memory-disk"
        placeholder={imagePreview(props.source)}
        placeholderContentFit="cover"
        {...props}
        source={thumb ? smallImage(props.source) : props.source}
        style={StyleSheet.absoluteFill}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
      />
    </View>
  );
}
