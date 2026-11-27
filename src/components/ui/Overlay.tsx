// Overlay (docs/design/DESIGN_SYSTEM.md §4 "Sheets & overlays") — the
// full-screen member of the sheet family: search, filter panel, swipe detail,
// image viewer. One Modal engine with Android back → onClose, an enter/exit
// animation, and children mounted only while it is open (state seeds fresh on
// every open — render the body unconditionally inside, the Overlay unmounts it
// after the exit animation).
//
// "zoom" (0457) opens from the tap: from the rect passed in `from` (a
// thumbnail), else from the last press point (lib/pressOrigin), else it fades.
// The origin is read once per open, so closing shrinks back into it.
import { useState, type ReactNode } from "react";
import {
  Modal,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { recentPressOrigin } from "@/lib/pressOrigin";

import {
  growFromRect,
  ZOOM_FROM_SCALE,
  zoomFromPoint,
  type Point,
  type Rect,
} from "./originMotion";
import { usePresence } from "./usePresence";

export type OverlayEnter = "fade" | "up" | "left" | "zoom";

type OverlayProps = {
  visible: boolean;
  /** Android back / accessibility escape. */
  onClose: () => void;
  /** "zoom" (from the tap), "fade", "up" (detail), "left" (filter panel). */
  enter?: OverlayEnter;
  /** "zoom": grow out of this window rect (a tapped thumbnail) instead of
   *  the press point. */
  from?: Rect | null;
  /** Colour behind the content that fades in on its own, so a zoom grows
   *  the content over it (the photo viewer's black). */
  backdrop?: string;
  /** Visual classes for the full-screen surface (e.g. "bg-background"). */
  className?: string;
  style?: StyleProp<ViewStyle>;
  statusBarTranslucent?: boolean;
  accessibilityLabel?: string;
  children: ReactNode;
};

/** Costs nothing until first opened, like <Sheet> (speed pass 0348); then
 *  stays mounted for the exit animation and quick reopening. */
export function Overlay(props: OverlayProps) {
  const [opened, setOpened] = useState(props.visible);
  if (props.visible && !opened) setOpened(true);
  return opened ? <OverlayEngine {...props} /> : null;
}

function OverlayEngine({
  visible,
  onClose,
  enter = "fade",
  from,
  backdrop,
  className,
  style,
  statusBarTranslucent = false,
  accessibilityLabel,
  children,
}: OverlayProps) {
  const { mounted, progress, reduced, settled, onShow } = usePresence(visible);
  const { width, height } = useWindowDimensions();
  // Read once per open; kept through the exit so it closes into the same spot.
  const [origin, setOrigin] = useState<{
    rect: Rect | null;
    point: Point | null;
  }>(() => ({ rect: from ?? null, point: from ? null : recentPressOrigin() }));
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setOrigin({
        rect: from ?? null,
        point: from ? null : recentPressOrigin(),
      });
    }
  }

  // Layered per the className + Reanimated rule (CLAUDE.md): the animated
  // wrapper takes style only, the core View carries the classes.
  const backdropAnim = useAnimatedStyle(() => ({ opacity: progress.value }));
  // A plain number in this closure, so the worklet captures it.
  const zoomFrom = ZOOM_FROM_SCALE;
  const anim = useAnimatedStyle(() => {
    if (reduced || enter === "fade") return { opacity: progress.value };
    if (enter === "zoom") {
      const size = { width, height };
      const f = origin.rect
        ? growFromRect(origin.rect, size, progress.value)
        : origin.point
          ? zoomFromPoint(origin.point, size, progress.value, zoomFrom)
          : null;
      if (!f) return { opacity: progress.value };
      return {
        opacity: Math.min(1, progress.value * 2),
        transform: [
          { translateX: f.translateX },
          { translateY: f.translateY },
          { scale: f.scale },
        ],
      };
    }
    if (enter === "up") {
      return { transform: [{ translateY: (1 - progress.value) * height }] };
    }
    return { transform: [{ translateX: -(1 - progress.value) * width }] };
  });

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      onShow={onShow}
      statusBarTranslucent={statusBarTranslucent}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        {backdrop ? (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: backdrop },
              settled ? null : backdropAnim,
            ]}
          />
        ) : null}
        {/* Static once settled: React commits inside a Modal dropped the
            animated style on Android (see usePresence). */}
        <Animated.View style={[{ flex: 1 }, settled ? null : anim]}>
          <View
            className={`flex-1 ${className ?? ""}`}
            style={style}
            accessibilityViewIsModal
            accessibilityLabel={accessibilityLabel}
          >
            {mounted ? children : null}
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}
