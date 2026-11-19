// Overlay (docs/design/DESIGN_SYSTEM.md §4 "Sheets & overlays") — the
// full-screen member of the sheet family: search, filter panel, swipe detail,
// image viewer. One Modal engine with Android back → onClose, an enter/exit
// animation, and children mounted only while it is open (state seeds fresh on
// every open — render the body unconditionally inside, the Overlay unmounts it
// after the exit animation).
import { useState, type ReactNode } from "react";
import {
  Modal,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { usePresence } from "./usePresence";

export type OverlayEnter = "fade" | "up" | "left";

type OverlayProps = {
  visible: boolean;
  /** Android back / accessibility escape. */
  onClose: () => void;
  /** "fade" (search, viewer), "up" (detail), "left" (filter panel). */
  enter?: OverlayEnter;
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
  className,
  style,
  statusBarTranslucent = false,
  accessibilityLabel,
  children,
}: OverlayProps) {
  const { mounted, progress, reduced, settled } = usePresence(visible);
  const { width, height } = useWindowDimensions();

  // Layered per the className + Reanimated rule (CLAUDE.md): the animated
  // wrapper takes style only, the core View carries the classes.
  const anim = useAnimatedStyle(() => {
    if (reduced || enter === "fade") return { opacity: progress.value };
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
      statusBarTranslucent={statusBarTranslucent}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
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
