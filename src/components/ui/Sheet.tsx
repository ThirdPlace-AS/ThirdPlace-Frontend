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
// A <Sheet> closes itself (user 2026-11-27, "smooth and native"): the scrim,
// system back, the drag and ✕ run the exit first and call `onClose` once the
// sheet is gone, so a sheet its parent mounts only while open still slides
// away instead of vanishing. Buttons inside close the same way through the
// `close` that children-as-a-function receive, or useSheetClose().
//
// The scrim is a SIBLING behind the card, never its ancestor, so the card's
// buttons are never nested inside a <button> on web (CLAUDE.md "Sheets").
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
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
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  useElevation,
  media,
  presentation,
  radius,
  spring,
  useThemeColors,
} from "@/theme";
import { recentPressOrigin } from "@/lib/pressOrigin";

import { BACK_ICON, IconButton } from "./IconButton";
import { KeyboardAvoider } from "./KeyboardAvoider";
import { SHEET_FROM_SCALE, scaleAbout } from "./originMotion";
import { Text } from "./Text";
import { usePresence } from "./usePresence";

/** Sheet top corners (radius token "2xl", 28 px). */
export const SHEET_RADIUS = parseInt(radius.xl ?? "32", 10);
/** Scrim left visible above the tallest content sheet. */
const SHEET_TOP_GAP = 16;

// True once the sheet's open slide has landed (and while it stays open).
// Content that is heavy and below the first screen can mount then: a commit
// at rest is safe inside the Modal (usePresence), and the slide starts
// without waiting for it (Filtre, user 2026-11-24). True outside a Sheet.
const SheetSettledContext = createContext(true);

/** Whether the enclosing Sheet has finished opening; true outside one. */
export function useSheetSettled(): boolean {
  return useContext(SheetSettledContext);
}

const SheetCloseContext = createContext<(() => void) | null>(null);

/** Close the enclosing Sheet with its exit, then its `onClose`; null
 *  outside a Sheet. */
export function useSheetClose(): (() => void) | null {
  return useContext(SheetCloseContext);
}

// A drag-to-close continues at the finger's speed (ease-out from it), within
// the exit's length so the callers' timers (240–260 ms) still hold.
const FLING_OUT = Easing.out(Easing.cubic);
const FLING_MIN_MS = 120;

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
      className={`flex-row items-center gap-2 ${
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
          tone={dark ? "onMedia" : undefined}
          onPress={onBack}
          className="-ml-1"
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
          className="-mr-1"
        />
      ) : null}
    </View>
  );
}

/** Props for the @gorhom engine so map sheets match <Sheet>. The same objects
 *  on every render (speed pass 0345): new ones made gorhom restyle the map
 *  sheets on each render of the map screen. */
export function useSheetChrome() {
  const elev = useElevation();
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
      style: elev.e3,
    }),
    [c.surface, c.line, elev.e3],
  );
}

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  /** In-sheet back (nested content). */
  onBack?: () => void;
  /** System back only, no header ← (0454): an open section inside the
   *  sheet closes before the sheet does. `onBack` wins when both are set. */
  onSystemBack?: () => void;
  /** "dark" matches a dark overlay (e.g. swipe detail); default light. */
  tone?: SheetTone;
  /** "muted" paints the card light grey so white content cards read on it. */
  surfaceTone?: "default" | "muted";
  /** Tall (~92 %) sheet whose children own a scroll area + sticky footer. */
  fullHeight?: boolean;
  /** Centre the title (pickers such as Kartlag). */
  centerTitle?: boolean;
  /** Content, or a function given `close` (exit first, then onClose). */
  children: ReactNode | ((close: () => void) => ReactNode);
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
  onSystemBack,
  tone = "light",
  surfaceTone = "default",
  fullHeight = false,
  centerTitle = false,
  children,
}: SheetProps) {
  const elev = useElevation();
  const dark = tone === "dark";
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height: winH, width: winW } = useWindowDimensions();
  // A content sheet never grows past the status bar: taller content scrolls
  // inside the card (8 notifications overflowed a 640 dp phone).
  const maxCardH = winH - insets.top - SHEET_TOP_GAP;
  const padBottom = Math.max(insets.bottom, 12) + 16;
  // Closing from inside: hide first, call onClose once the exit is done.
  const [closing, setClosing] = useState(false);
  if (!visible && closing) setClosing(false);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    closingRef.current = closing;
    onCloseRef.current = onClose;
  });
  const close = useCallback(() => setClosing(true), []);
  const onHidden = useCallback(() => {
    if (closingRef.current) onCloseRef.current();
  }, []);
  const shown = visible && !closing;
  const { mounted, progress, reduced, settled, onShow } = usePresence(
    shown,
    onHidden,
    "sheet",
  );
  // The card grows from the tap that opened it (0457): read once per open,
  // kept through the exit. Null (opened by code) keeps the plain slide.
  const [originX, setOriginX] = useState<number | null>(
    () => recentPressOrigin()?.x ?? null,
  );
  const [wasVisible, setWasVisible] = useState(visible);
  if (shown !== wasVisible) {
    setWasVisible(shown);
    if (shown) setOriginX(recentPressOrigin()?.x ?? null);
  }
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
        // Off the bottom at the release speed (ease-out starts at 3× the
        // average), never longer than the exit.
        const rest = Math.max(0, cardH.value - drag.value);
        const v = Math.max(1, e.velocityY);
        const ms = Math.min(
          presentation.exit,
          Math.max(FLING_MIN_MS, ((3 * rest) / v) * 1000),
        );
        drag.value = withTiming(cardH.value, {
          duration: ms,
          easing: FLING_OUT,
        });
        runOnJS(close)();
      } else {
        // Back to rest without bouncing past it: an overshoot lifted the
        // card off the bottom edge for a frame or two.
        drag.value = withSpring(
          0,
          { ...spring.snappy, overshootClamping: true },
          (finished) => {
            if (finished) runOnJS(setDragging)(false);
          },
        );
      }
    });
  const animate = !settled || dragging;

  const onCardLayout = (e: LayoutChangeEvent) => {
    cardH.value = e.nativeEvent.layout.height;
  };
  // Each open starts from rest: a swipe-to-close leaves the drag at the card's
  // height. Reset when the Modal's window is up, not on a layout pass: one
  // landing during a release snapped the card back up for a frame.
  const onModalShow = () => {
    drag.value = 0;
    onShow();
  };

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value * (1 - Math.min(1, drag.value / cardH.value)),
  }));
  const cardStyle = useAnimatedStyle(() => {
    if (reduced) {
      return {
        opacity: progress.value,
        transform: [{ translateY: drag.value }],
      };
    }
    const slide = (1 - progress.value) * cardH.value + drag.value;
    if (originX === null) return { transform: [{ translateY: slide }] };
    // Scale about the tap's x at the card's bottom edge.
    const s = SHEET_FROM_SCALE + (1 - SHEET_FROM_SCALE) * progress.value;
    const t = scaleAbout(
      { x: originX, y: winH },
      { x: winW / 2, y: winH - cardH.value / 2 },
      s,
    );
    return {
      transform: [
        { translateX: t.translateX },
        { translateY: slide + t.translateY },
        { scale: s },
      ],
    };
  });

  const body = typeof children === "function" ? children(close) : children;

  const cardBg = dark
    ? null
    : surfaceTone === "muted"
      ? "bg-surfaceMuted"
      : "bg-surface";

  return (
    <SheetCloseContext.Provider value={close}>
      <Modal
        visible={mounted}
        transparent
        animationType="none"
        // System back undoes the last step (0454): an inner step goes back to
        // the step before it, like the header ←; only the first step closes.
        onRequestClose={onBack ?? onSystemBack ?? close}
        onShow={onModalShow}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* The keyboard pads the bottom (edge-to-edge Android does not resize
            the Modal window), and the card shrinks so it stays on screen. */}
          <KeyboardAvoider
            className="flex-1 justify-end"
            // Keeps a content sheet below the status bar when the keyboard
            // leaves it less room than maxCardH.
            style={
              fullHeight ? null : { paddingTop: insets.top + SHEET_TOP_GAP }
            }
          >
            <Animated.View
              style={[StyleSheet.absoluteFill, animate ? scrimStyle : null]}
            >
              <RNPressable
                accessibilityLabel="Lukk"
                accessibilityRole="button"
                onPress={close}
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
                className={`rounded-t-xl ${cardBg ?? ""} ${
                  fullHeight ? "flex-1" : ""
                }`}
                style={[
                  elev.e3,
                  dark ? { backgroundColor: media.base } : null,
                  { paddingBottom: padBottom },
                  fullHeight ? null : { maxHeight: maxCardH, flexShrink: 1 },
                ]}
              >
                <GestureDetector gesture={pan}>
                  <View
                    collapsable={false}
                    className="gap-3 px-gutter pb-4 pt-3"
                  >
                    <SheetHandle tone={tone} />
                    <SheetHeader
                      title={title}
                      tone={tone}
                      onBack={onBack}
                      onClose={fullHeight ? close : undefined}
                      divider={fullHeight}
                      center={centerTitle}
                    />
                  </View>
                </GestureDetector>
                {fullHeight ? (
                  // Tall sheets own their scroll area and sticky footer.
                  <View className="flex-1 gap-4 px-gutter">
                    <SheetSettledContext.Provider value={settled || reduced}>
                      {body}
                    </SheetSettledContext.Provider>
                  </View>
                ) : (
                  <ScrollView
                    style={{ flexGrow: 0, flexShrink: 1 }}
                    contentContainerClassName="gap-4 px-gutter"
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                    overScrollMode="never"
                  >
                    <SheetSettledContext.Provider value={settled || reduced}>
                      {body}
                    </SheetSettledContext.Provider>
                  </ScrollView>
                )}
              </View>
            </Animated.View>
          </KeyboardAvoider>
        </GestureHandlerRootView>
      </Modal>
    </SheetCloseContext.Provider>
  );
}
