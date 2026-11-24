import {
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useRef, type ReactNode } from "react";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

import { IconButton, Pressable, Text } from "@/components/ui";
import {
  DISCOVERY_MODES,
  type DiscoveryMode,
} from "@/components/map/types/mapPresentation";
import { media } from "@/theme";

// Top overlay filter bar. A sliders button opens the Filtre sheet, a horizontal
// row of mode text-tabs (selected = dark pill, the rest plain text), and a
// notifications bell on the right.
//
// The tabs follow the design (PDF p7): For deg · Opplevelser · Steder. "For deg"
// is a NON-PERSONALIZED demo shell (DEMO_MODES rule — no invented ranking);
// "Opplevelser" is the plain experience deck; "Steder" is the place deck (not
// built yet — honest empty state). Group swipe is its own flow ("Start
// gruppe-sveip", PDF p8), not a tab. Local filtering lives in the Filtre sheet.
export type SwipeMode = DiscoveryMode;

// The map's six modes in its order, named for Sveip (user 2026-11-20): For
// deg · Populært · Live · Utforsk · Lagret · Venner.
const SWIPE_MODE_LABELS: Record<DiscoveryMode, string> = {
  forYou: "For deg",
  trending: "Populært",
  live: "Live",
  explore: "Utforsk",
  saved: "Lagret",
  friends: "Venner",
};
export const SWIPE_MODES: { key: SwipeMode; label: string }[] =
  DISCOVERY_MODES.map((key) => ({ key, label: SWIPE_MODE_LABELS[key] }));

export function SwipeFilterBar({
  mode,
  onSelectMode,
  onOpenFilters,
  filterActive,
  onOpenNotifications,
  unreadCount,
  onLight = false,
  onOpenGroup,
  touchH,
}: {
  mode: SwipeMode;
  // How tall the row is to touch, down to the bottom of the top shadow (dp).
  // The pills and icons stay at the top of it.
  touchH?: number;
  onSelectMode: (m: SwipeMode) => void;
  onOpenFilters: () => void;
  filterActive: boolean;
  onOpenNotifications: () => void;
  unreadCount: number;
  // True when the bar sits over a light screen (empty / Steder states) rather
  // than a photo — glyphs and text switch to ink.
  onLight?: boolean;
  // Opens "Start gruppe-sveip" (PDF p8).
  onOpenGroup?: () => void;
}) {
  // No background behind the group and bell icons, over a photo or not (user
  // 2026-11-20); the glyph tone is what changes.
  const iconVariant = "ghost";
  const iconTone = onLight ? "ink" : "onMedia";
  // Under 380 dp the three tabs plus three icons do not fit: "Steder" was cut
  // mid-word at 360 dp. Tighter paddings there; wider phones keep the PDF look.
  const compact = useWindowDimensions().width < 380;
  // The tabs fade out at the row's two edges as they are dragged past them,
  // as on the reference (user 2026-11-20), instead of being cut off hard.
  const downX = useRef(0);
  const scrollX = useSharedValue(0);
  const viewW = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });
  // The row sits between the side icons and fades out as the pills reach
  // them.
  const side = compact ? 12 : 16;
  const iconW = 36;
  const padL = side + iconW + 8;
  const padR = side + iconW * (onOpenGroup ? 2 : 1) + 8;
  return (
    <View style={{ height: touchH ?? 44 }}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: compact ? 2 : 6,
          alignItems: "flex-start",
        }}
        style={{
          position: "absolute",
          // Between the side icons: the pills are clipped at them and never
          // pass under them (user 2026-11-20). The row is as tall as the
          // shadow, so it is still easy to catch.
          left: padL,
          right: padR,
          top: 0,
          height: touchH ?? 44,
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onLayout={(e) => viewW.set(e.nativeEvent.layout.width)}
      >
        {SWIPE_MODES.map((m) => {
          const active = m.key === mode;
          return (
            <FadingTab
              key={m.key}
              scrollX={scrollX}
              viewW={viewW}
              padL={0}
              padR={0}
            >
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
                pressedScale={0.95}
                onPressIn={(e) => {
                  downX.current = e.nativeEvent.pageX;
                }}
                // A drag along the row is not a tap on the pill it began on.
                onPress={(e) => {
                  if (Math.abs(e.nativeEvent.pageX - downX.current) > 8) return;
                  onSelectMode(m.key);
                }}
                // Over a photo the selected pill is flat black at half strength with
                // white text and no ring: measured on the reference, where it is
                // 0.49 of the band behind it per channel (user 2026-11-20). On a
                // light screen it is the theme ink (so it also works in dark mode).
                contentClassName={
                  active
                    ? `rounded-full ${compact ? "px-3" : "px-4"} py-2 ${onLight ? "bg-ink" : ""}`
                    : `${compact ? "px-2" : "px-3"} py-2`
                }
                contentStyle={
                  active && !onLight
                    ? { backgroundColor: media.scrim }
                    : undefined
                }
              >
                {/* The type of the map's mode pills (label, semibold when
                  selected, medium otherwise); the look stays this bar's own
                  (user 2026-11-20). */}
                <Text
                  variant="label"
                  weight={active ? "semibold" : "medium"}
                  tone={
                    active
                      ? onLight
                        ? "onInk"
                        : "onMedia"
                      : onLight
                        ? "muted"
                        : "onMedia"
                  }
                  className={!active && !onLight ? "opacity-70" : undefined}
                >
                  {m.label}
                </Text>
              </Pressable>
            </FadingTab>
          );
        })}
      </Animated.ScrollView>

      {/* The icons sit on top of the row; a touch between them falls through
          to the row below. */}
      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 top-0 flex-row items-start justify-between"
        style={{ paddingHorizontal: side }}
      >
        <IconButton
          icon="options-outline"
          label="Filtre"
          variant="ghost"
          size="sm"
          tone={iconTone}
          badge={filterActive}
          onPress={onOpenFilters}
        />
        <View pointerEvents="box-none" className="flex-row items-start">
          {onOpenGroup ? (
            <IconButton
              icon="people-outline"
              label="Start gruppe-sveip"
              variant={iconVariant}
              size="sm"
              tone={iconTone}
              onPress={onOpenGroup}
            />
          ) : null}
          {/* Notifications bell (opens the demo notifications sheet), with an
              unread count badge — same affordance as the map's top bar. */}
          <IconButton
            icon="notifications-outline"
            label="Varsler"
            variant={iconVariant}
            size="sm"
            tone={iconTone}
            badge={unreadCount}
            onPress={onOpenNotifications}
          />
        </View>
      </View>
    </View>
  );
}

// How far in from the row's edge a tab starts to fade (dp), measured on the
// reference recording.
const EDGE_FADE = 64;

// One tab: full while it is well inside the row, fading out as it nears or
// passes either edge.
function FadingTab({
  scrollX,
  viewW,
  padL,
  padR,
  children,
}: {
  scrollX: SharedValue<number>;
  viewW: SharedValue<number>;
  // The row's free space on each side (where the icons are): a tab fades out
  // as it reaches it.
  padL: number;
  padR: number;
  children: ReactNode;
}) {
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  const style = useAnimatedStyle(() => {
    if (viewW.value <= 0 || w.value <= 0) return { opacity: 1 };
    const fromLeft = (x.value + w.value - scrollX.value - padL) / EDGE_FADE;
    const fromRight =
      (scrollX.value + viewW.value - padR - x.value) / EDGE_FADE;
    // Linear, as measured on the reference: about 65 dp from full to nothing,
    // ending at the icons.
    return { opacity: Math.max(0, Math.min(1, fromLeft, fromRight)) };
  });
  const onLayout = (e: LayoutChangeEvent) => {
    x.set(e.nativeEvent.layout.x);
    w.set(e.nativeEvent.layout.width);
  };
  return (
    <Animated.View style={style} onLayout={onLayout}>
      {children}
    </Animated.View>
  );
}
