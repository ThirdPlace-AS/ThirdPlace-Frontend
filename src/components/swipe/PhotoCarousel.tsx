import { Image } from "expo-image";
import { useState, type ReactNode } from "react";
import { media } from "@/theme";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";

import { imagePreview } from "@/fixtures/images";
import { useAfterPaint } from "@/hooks/useAfterPaint";
import { useLoadPhase } from "@/hooks/useLoadPhase";
import { useScreenReader } from "@/hooks/useScreenReader";

// Full-bleed photo carousel: progress pills at the top. In the details hero,
// tap the left/right 40 % of the upper area to step photos; on the deck card
// the deck's tap gesture steps them from anywhere on the card (the zones here
// stay only for a screen reader). Only the top (interactive) card steps; cards
// behind show their current photo.
//
// The index can be lifted (controlled) via `onIndexChange` so the card overlay
// can tint its footer scrim to the shown photo (the consolidated info block is
// the same on every photo; only the scrim follows). Uncontrolled when absent.
export function PhotoCarousel({
  photos,
  interactive = true,
  indicator,
  onIndexChange,
  index,
  indicatorTop = 8,
  variant = "hero",
  fit = "cover",
  overlay,
}: {
  // Drawn over the photo but under the photo indicator (the deck card's head
  // band, so the pills stay bright on top of it).
  overlay?: ReactNode;
  photos: ImageSourcePropType[];
  interactive?: boolean;
  // Show the photo indicator (defaults to `interactive`). The deck's next card
  // shows it before it can be tapped, so nothing appears when it moves up.
  indicator?: boolean;
  onIndexChange?: (index: number) => void;
  // Controlled photo (Sveip's card and its details show the same photo);
  // uncontrolled when absent.
  index?: number;
  // Distance (px) from the top of the image to the photo indicator. The
  // indicator always pins to the TOP of the image — on the full-bleed card the
  // caller passes enough offset to clear the status bar + top bar; in the
  // detail hero it stays near 8 so it hugs the top edge of the box.
  indicatorTop?: number;
  // Indicator style. `"card"` (the full-bleed deck card) = a horizontally
  // CENTERED cluster of short rounded pills with gaps, matching the reference's
  // collapsed card. `"hero"` (the detail hero) = thin full-width segmented bars.
  variant?: "card" | "hero";
  // How a photo fills its box: "cover" crops to fill (default), "contain" shows
  // the whole photo (Sveip's card, user 2026-11-21).
  fit?: "cover" | "contain";
}) {
  const [i, setI] = useState(0);
  // Loading rule (DESIGN_SYSTEM §5): the neutral block below is the skeleton
  // while a photo decodes; past 2 s a spinner joins it.
  const [loaded, setLoaded] = useState<ReadonlySet<ImageSourcePropType>>(
    () => new Set(),
  );
  const markLoaded = (src: ImageSourcePropType | undefined) => {
    if (src == null) return;
    setLoaded((cur) => {
      if (cur.has(src)) return cur;
      const next = new Set(cur);
      next.add(src);
      return next;
    });
  };
  const screenReader = useScreenReader();
  const count = photos.length;
  const idx = Math.max(0, Math.min(index ?? i, count - 1));
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
  // The deck card takes its photo taps from the deck's own tap gesture (the
  // whole card, user 2026-11-18), so its tap zones are only for a screen
  // reader; the details hero keeps them.
  const multi =
    interactive && count > 1 && (variant === "hero" || screenReader);
  const pills = (indicator ?? interactive) && count > 1;
  // The top card keeps every photo mounted and decoded, only the shown one
  // visible, so a tap switches in the same frame (user 2026-11-18). Cards
  // behind it hold the one photo they show.
  const stacked = useAfterPaint(variant === "card" && interactive && count > 1);
  const shownSrc = photos[idx];
  const phase = useLoadPhase(!(shownSrc != null && loaded.has(shownSrc)));

  return (
    <View className="absolute inset-0">
      {/* Neutral loading backdrop so a card reads as "loading" (not a black
          void) during the brief moment before the photo decodes on mount. */}
      <View
        style={[
          StyleSheet.absoluteFill,
          // A whole photo fitted in the box leaves bars: the deck's own dark.
          {
            backgroundColor: fit === "contain" ? media.deck : media.placeholder,
          },
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
      {photos.map((src, k) =>
        stacked || k === idx ? (
          // Keyed by position, so the photo a card shows while it waits
          // behind is the same element once it is the top card.
          <Image
            key={k}
            source={src}
            placeholder={imagePreview(src)}
            placeholderContentFit={fit}
            contentFit={fit}
            cachePolicy="memory-disk"
            priority={k === idx ? (interactive ? "high" : "normal") : "low"}
            style={[StyleSheet.absoluteFill, { opacity: k === idx ? 1 : 0 }]}
            accessibilityIgnoresInvertColors
            onLoad={() => markLoaded(src)}
          />
        ) : null,
      )}
      {overlay}

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
        </>
      ) : null}
      {pills ? (
        <>
          {/* Photo indicator — pinned to the TOP of the image (caller controls
              the exact offset via `indicatorTop`), so the "how many photos" dots
              always hug the top edge, as in the reference. The deck card centers
              a cluster of short pills; the detail hero stretches thin full-width
              bars. */}
          <View
            className={`absolute inset-x-0 flex-row px-3 ${
              variant === "card" ? "justify-center gap-1" : "gap-1"
            }`}
            style={{ top: indicatorTop }}
          >
            {photos.map((_, k) =>
              variant === "card" ? (
                // Short pills (8 × 4 dp, 4 dp apart, the others ~30 % white),
                // as measured on the reference.
                <View
                  key={k}
                  style={{ width: 8, height: 4 }}
                  className={`rounded-full ${
                    k === idx ? "bg-white" : "bg-white/30"
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
