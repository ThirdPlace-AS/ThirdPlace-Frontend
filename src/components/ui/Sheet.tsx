// Sheets (docs/design/DESIGN_SYSTEM.md §4 "Sheets & overlays").
//
// One look, two engines:
//   <Sheet>          Modal engine — action sheets, pickers, forms, prompts.
//                    Slides up over a scrim, drag the handle/header down (or
//                    tap the scrim, or Android back) to close.
//   useSheetChrome() styles the @gorhom engine (map browse/detail sheets) with
//                    the same surface, 28 px top radius, handle and elevation.
//   <SheetHandle>, <SheetHeader> are the shared parts.
//
// The scrim is a SIBLING behind the card, never its ancestor, so the card's
// buttons are never nested inside a <button> on web (CLAUDE.md "Sheets").
import { useMemo, useState, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  type LayoutChangeEvent,
  Modal,
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  elevation,
  media,
  presentation,
  radius,
  spring,
  useThemeColors,
} from "@/theme";

import { BACK_ICON, IconButton } from "./IconButton";
import { Text } from "./Text";
import { usePresence } from "./usePresence";

/** Sheet top corners (radius token "2xl", 28 px). */
export const SHEET_RADIUS = parseInt(radius["2xl"] ?? "28", 10);
/** Scrim left visible above the tallest content sheet. */
const SHEET_TOP_GAP = 16;

export type SheetTone = "light" | "dark";

export function SheetHandle({ tone = "light" }: { tone?: SheetTone }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className={`h-1 w-10 self-center rounded-full ${
        tone === "dark" ? "bg-onMedia/25" : "bg-line"
      }`}
    />
  );
}

export function SheetHeader({
  title,
  onClose,
  onBack,
  tone = "light",
  divider = false,
  actions,
  center = false,
  label,
  labelIcon,
}: {
  title?: string;
  onClose?: () => void;
  onBack?: () => void;
  tone?: SheetTone;
  divider?: boolean;
  /** Extra icon buttons before ✕ (e.g. Del + Lagre on an experience). */
  actions?: ReactNode;
  /** Centred title (a picker such as Kartlag), not the default left. */
  center?: boolean;
  /** A short label at the left when there is no title (the map's page
   *  sheet says what the item is: "Park", "Kafé", "Klatring"). */
  label?: string;
  /** Drawn before `label` (the map's page sheet: the pin in its colour). */
  labelIcon?: ReactNode;
}) {
  const dark = tone === "dark";
  const variant = dark ? "mediaSubtle" : "ghost";
  if (!title && !onClose && !onBack && !actions) return null;
  return (
    <View
      className={`flex-row items-center gap-sm ${
        divider
          ? dark
            ? "border-b border-onMedia/10 pb-3"
            : "border-b border-line pb-3"
          : ""
      }`}
    >
      {onBack ? (
        <IconButton
          icon={BACK_ICON}
          label="Tilbake"
          size="sm"
          variant={variant}
          onPress={onBack}
          className="-ml-xs"
        />
      ) : null}
      {!title && label ? labelIcon : null}
      {!title && label ? (
        <Text
          variant="label"
          weight="semibold"
          tone={dark ? "onMedia" : "ink"}
          numberOfLines={1}
          // A long kind ("Vietnamesisk restaurant") shrinks a little beside
          // its pin on a 360 dp phone instead of losing its end.
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          className="flex-1"
        >
          {label}
        </Text>
      ) : (
        <Text
          variant="h2"
          weight="bold"
          tone={dark ? "onMedia" : "ink"}
          numberOfLines={1}
          className={center ? "flex-1 text-center" : "flex-1"}
        >
          {title ?? ""}
        </Text>
      )}
      {actions}
      {onClose ? (
        <IconButton
          icon="close"
          label="Lukk"
          size="sm"
          variant={variant}
          onPress={onClose}
          className="-mr-xs"
        />
      ) : null}
    </View>
  );
}

/** Props for the @gorhom engine so map sheets match <Sheet>. The same objects
 *  on every render (speed pass 0345): new ones made gorhom restyle the map
 *  sheets on each render of the map screen. */
export function useSheetChrome() {
  const c = useThemeColors();
  return useMemo(
    () => ({
      backgroundStyle: {
        backgroundColor: c.surface,
        borderTopLeftRadius: SHEET_RADIUS,
        borderTopRightRadius: SHEET_RADIUS,
      },
      handleIndicatorStyle: {
        backgroundColor: c.line,
        width: 40,
        height: 4,
      },
      style: elevation.e3,
    }),
    [c.surface, c.line],
  );
}

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  /** In-sheet back (nested content). */
  onBack?: () => void;
  /** "dark" matches a dark overlay (e.g. swipe detail); default light. */
  tone?: SheetTone;
  /** "muted" paints the card light grey so white content cards read on it. */
  surfaceTone?: "default" | "muted";
  /** Tall (~92 %) sheet whose children own a scroll area + sticky footer. */
  fullHeight?: boolean;
  /** Centre the title (pickers such as Kartlag). */
  centerTitle?: boolean;
  children: ReactNode;
};

/** A sheet costs nothing until it is first opened (speed pass 0348: an
 *  experience page mounted 11 hidden sheets and overlays, each with its
 *  presence state, shared values and animated styles). Once opened it stays
 *  mounted, so the exit animation runs and reopening is instant. */
export function Sheet(props: SheetProps) {
  const [opened, setOpened] = useState(props.visible);
  if (props.visible && !opened) setOpened(true);
  return opened ? <SheetEngine {...props} /> : null;
}

function SheetEngine({
  visible,
  onClose,
  title,
  onBack,
  tone = "light",
  surfaceTone = "default",
  fullHeight = false,
  centerTitle = false,
  children,
}: SheetProps) {
  const dark = tone === "dark";
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  // A content sheet never grows past the status bar: taller content scrolls
  // inside the card (8 notifications overflowed a 640 dp phone).
  const maxCardH = winH - insets.top - SHEET_TOP_GAP;
  const padBottom = Math.max(insets.bottom, 12) + 16;
  const { mounted, progress, reduced, settled } = usePresence(visible);
  const cardH = useSharedValue(winH);
  const drag = useSharedValue(0);
  // While a drag is live the card needs the animated style again (see
  // usePresence on why it is static at rest).
  const [dragging, setDragging] = useState(false);
  if (!mounted && dragging) setDragging(false);

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetY(-8)
    .onStart(() => {
      runOnJS(setDragging)(true);
    })
    .onUpdate((e) => {
      drag.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      const far = drag.value > cardH.value * presentation.dismissRatio;
      if (far || e.velocityY > presentation.dismissVelocity) {
        runOnJS(onClose)();
      } else {
        drag.value = withSpring(0, spring.snappy, (finished) => {
          if (finished) runOnJS(setDragging)(false);
        });
      }
    });
  const animate = !settled || dragging;

  // The Modal remounts the card on every open, so this also resets a drag left
  // over from a swipe-to-close.
  const onCardLayout = (e: LayoutChangeEvent) => {
    cardH.value = e.nativeEvent.layout.height;
    if (visible) drag.value = 0;
  };

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value * (1 - Math.min(1, drag.value / cardH.value)),
  }));
  const cardStyle = useAnimatedStyle(() =>
    reduced
      ? { opacity: progress.value, transform: [{ translateY: drag.value }] }
      : {
          transform: [
            { translateY: (1 - progress.value) * cardH.value + drag.value },
          ],
        },
  );

  const cardBg = dark
    ? null
    : surfaceTone === "muted"
      ? "bg-surfaceMuted"
      : "bg-surface";

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* The keyboard pads the bottom (edge-to-edge Android does not resize
            the Modal window), and the card shrinks so it stays on screen. */}
        <KeyboardAvoidingView
          behavior="padding"
          className="flex-1 justify-end"
          // Keeps a content sheet below the status bar when the keyboard
          // leaves it less room than maxCardH.
          style={fullHeight ? null : { paddingTop: insets.top + SHEET_TOP_GAP }}
        >
          <Animated.View
            style={[StyleSheet.absoluteFill, animate ? scrimStyle : null]}
          >
            <RNPressable
              accessibilityLabel="Lukk"
              accessibilityRole="button"
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: dark ? media.scrimStrong : c.scrim,
                opacity: dark ? 1 : 0.4,
              }}
            />
          </Animated.View>
          <Animated.View
            style={[
              animate ? cardStyle : null,
              fullHeight ? { height: "92%" } : { flexShrink: 1 },
            ]}
            onLayout={onCardLayout}
          >
            <View
              accessibilityViewIsModal
              className={`rounded-t-2xl ${cardBg ?? ""} ${
                fullHeight ? "flex-1" : ""
              }`}
              style={[
                elevation.e3,
                dark ? { backgroundColor: media.base } : null,
                { paddingBottom: padBottom },
                fullHeight ? null : { maxHeight: maxCardH, flexShrink: 1 },
              ]}
            >
              <GestureDetector gesture={pan}>
                <View
                  collapsable={false}
                  className="gap-3 px-gutter pb-4 pt-2.5"
                >
                  <SheetHandle tone={tone} />
                  <SheetHeader
                    title={title}
                    tone={tone}
                    onBack={onBack}
                    onClose={fullHeight ? onClose : undefined}
                    divider={fullHeight}
                    center={centerTitle}
                  />
                </View>
              </GestureDetector>
              {fullHeight ? (
                // Tall sheets own their scroll area and sticky footer.
                <View className="flex-1 gap-4 px-gutter">{children}</View>
              ) : (
                <ScrollView
                  style={{ flexGrow: 0, flexShrink: 1 }}
                  contentContainerClassName="gap-4 px-gutter"
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                  overScrollMode="never"
                >
                  {children}
                </ScrollView>
              )}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}
