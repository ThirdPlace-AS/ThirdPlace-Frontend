// Accordion (docs/design/DESIGN_SYSTEM.md §4 "Expanded / collapsed") — a
// titled disclosure with an animated height and a rotating chevron. Works
// controlled (`open` + `onToggle`) or uncontrolled (`defaultOpen`). Collapsed
// content stays measured but is hidden from touch and screen readers.
// `lazy` mounts the content only once the row is first opened (it then stays
// mounted, so closing still animates): for long lists of controls, such as
// Filtre's Kategori rows, which made the sheet slow to open.
import { useEffect, useState, type ReactNode } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { duration, easing } from "@/theme";

import { Icon, type IconName } from "./Icon";
import { Pressable } from "./Pressable";
import { Text } from "./Text";

const STANDARD = Easing.bezier(...easing.standard);

export function Accordion({
  title,
  subtitle,
  icon,
  meta,
  open: openProp,
  defaultOpen = false,
  onToggle,
  variant = "plain",
  lazy = false,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Short trailing text, e.g. a count. */
  meta?: string;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onToggle?: () => void;
  /** "card" = bordered surface (chat groups); "plain" = inline section. */
  variant?: "plain" | "card";
  /** Mount the content only once opened (heavy content). */
  lazy?: boolean;
  children: ReactNode;
}) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  // Opened at least once: a lazy body mounts then and stays.
  const [opened, setOpened] = useState(open);
  if (open && !opened) setOpened(true);
  const reduced = useReducedMotion();
  const progress = useSharedValue(open ? 1 : 0);
  const contentH = useSharedValue(0);

  const toggle = () => {
    if (openProp === undefined) setInner((o) => !o);
    onToggle?.();
  };
  const onContentLayout = (e: LayoutChangeEvent) => {
    contentH.value = e.nativeEvent.layout.height;
  };

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, {
      duration: reduced ? 0 : duration.base,
      easing: STANDARD,
    });
  }, [open, reduced, progress]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: contentH.value * progress.value,
    opacity: progress.value,
  }));
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  const card = variant === "card";
  return (
    <View
      className={
        card ? "overflow-hidden rounded-lg border border-line bg-surface" : ""
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={meta ? `${title}, ${meta}` : title}
        accessibilityState={{ expanded: open }}
        accessibilityHint={subtitle}
        onPress={toggle}
        pressedScale={0.99}
        contentClassName={`flex-row items-center gap-md ${
          card ? "px-md py-3.5" : "py-sm"
        }`}
      >
        {icon ? <Icon name={icon} size="md" tone="ink" /> : null}
        <View className="flex-1 gap-0.5">
          <Text variant="body" weight="semibold">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" tone="muted">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {meta ? (
          <Text variant="caption" tone="muted">
            {meta}
          </Text>
        ) : null}
        <Animated.View style={chevronStyle}>
          <Icon name="chevron-down" size="md" tone={card ? "muted" : "ink"} />
        </Animated.View>
      </Pressable>
      <Animated.View style={[{ overflow: "hidden" }, bodyStyle]}>
        <View
          onLayout={onContentLayout}
          pointerEvents={open ? "auto" : "none"}
          importantForAccessibility={open ? "auto" : "no-hide-descendants"}
          accessibilityElementsHidden={!open}
          style={{ position: "absolute", left: 0, right: 0, top: 0 }}
        >
          {lazy && !opened ? null : children}
        </View>
      </Animated.View>
    </View>
  );
}
