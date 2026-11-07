import { Image } from "expo-image";
import { useState } from "react";
import { media } from "@/theme";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";

import { imagePreview } from "@/fixtures/images";
import { useLoadPhase } from "@/hooks/useLoadPhase";

// Full-bleed photo carousel for a swipe card. Tinder-style: segmented progress
// dots at the top, tap the left/right 30% of the UPPER area to step photos (the
// lower area is left free for the info overlay + expand chevron). Only the top
// (interactive) card steps; cards peeking behind show the cover photo.
//
// The index can be lifted (controlled) via `onIndexChange` so the card overlay
// can tint its footer scrim to the shown photo (the consolidated info block is
// the same on every photo; only the scrim follows). Uncontrolled when absent.
export function PhotoCarousel({
  photos,
  interactive = true,
  onIndexChange,
  indicatorTop = 8,
  variant = "hero",
}: {
  photos: ImageSourcePropType[];
  interactive?: boolean;
  onIndexChange?: (index: number) => void;
  // Distance (px) from the top of the image to the photo indicator. The
  // indicator always pins to the TOP of the image — on the full-bleed card the
  // caller passes enough offset to clear the status bar + top bar; in the
  // detail hero it stays near 8 so it hugs the top edge of the box.
  indicatorTop?: number;
  // Indicator style. `"card"` (the full-bleed deck card) = a horizontally
  // CENTERED cluster of short rounded pills with gaps, matching the reference's
  // collapsed card. `"hero"` (the detail hero) = thin full-width segmented bars.
  variant?: "card" | "hero";
}) {
  const [i, setI] = useState(0);
  // Loading rule (DESIGN_SYSTEM §5): the neutral block below is the skeleton
  // while a photo decodes; past 2 s a spinner joins it.
  const [loaded, setLoaded] = useState<ImageSourcePropType | null>(null);
  const count = photos.length;
  const idx = Math.min(i, count - 1);
  // Called from an onPress handler (not render), so computing `next` from the
  // derived `idx` and lifting it via onIndexChange is safe — doing this inside
  // the setI updater fired the parent's setState during render (setState-in-render).
  const step = (d: number) => {
    const next = Math.min(count - 1, Math.max(0, idx + d));
    if (next !== idx) {
      setI(next);
      onIndexChange?.(next);
    }
  };
  const multi = interactive && count > 1;
  const phase = useLoadPhase(loaded !== photos[idx]);

  return (
    <View className="absolute inset-0">
      {/* Neutral loading backdrop so a card reads as "loading" (not a black
          void) during the brief moment before the photo decodes on mount. */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: media.placeholder },
        ]}
      />
      {phase === "loader" ? (
        <View
          style={StyleSheet.absoluteFill}
          className="items-center justify-center"
          pointerEvents="none"
        >
          <ActivityIndicator color={media.onMedia} />
        </View>
      ) : null}
      {/* expo-image: the blurred preview paints at once, decoded photos stay
          in memory (the deck re-shows the same cards), and the top card's
          photo loads first. */}
      <Image
        source={photos[idx]}
        placeholder={imagePreview(photos[idx])}
        placeholderContentFit="cover"
        contentFit="cover"
        cachePolicy="memory-disk"
        priority={interactive ? "high" : "normal"}
        style={StyleSheet.absoluteFill}
        accessibilityIgnoresInvertColors
        onLoad={() => setLoaded(photos[idx] ?? null)}
      />

      {multi ? (
        <>
          {/* Tap zones — upper 70% only, so the info/chevron below stay tappable. */}
          <View
            className="absolute inset-x-0 top-0 flex-row"
            style={{ height: "70%" }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Forrige bilde"
              onPress={() => step(-1)}
              style={{ width: "40%" }}
              className="h-full"
            />
            <View style={{ flex: 1 }} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Neste bilde"
              onPress={() => step(1)}
              style={{ width: "40%" }}
              className="h-full"
            />
          </View>

          {/* Photo indicator — pinned to the TOP of the image (caller controls
              the exact offset via `indicatorTop`), so the "how many photos" dots
              always hug the top edge, as in the reference. The deck card centers
              a cluster of short pills; the detail hero stretches thin full-width
              bars. */}
          <View
            className={`absolute inset-x-0 flex-row px-3 ${
              variant === "card" ? "justify-center gap-1.5" : "gap-1"
            }`}
            style={{ top: indicatorTop }}
          >
            {photos.map((_, k) =>
              variant === "card" ? (
                <View
                  key={k}
                  className={`h-1.5 w-4 rounded-full ${
                    k === idx ? "bg-white" : "bg-white/40"
                  }`}
                />
              ) : (
                <View
                  key={k}
                  className={`h-1 flex-1 rounded-full ${
                    k === idx ? "bg-white" : "bg-white/30"
                  }`}
                />
              ),
            )}
          </View>
        </>
      ) : null}
    </View>
  );
}
