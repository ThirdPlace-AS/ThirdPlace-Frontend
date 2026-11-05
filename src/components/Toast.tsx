import { Ionicons } from "@expo/vector-icons";
import { useEffect, useSyncExternalStore } from "react";
import { View } from "react-native";
import Animated, {
  FadeInUp,
  FadeOutUp,
  useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, Pressable, Text } from "@/components/ui";
import { duration, elevation } from "@/theme";

// Flytende varsler (PDF p27): a floating banner at the top of the screen —
// icon, bold title, one-line body. A tiny module store so any screen can call
// `showToast(...)`; <ToastHost /> is mounted once in the root layout. Toasts
// are local UI feedback only — they never claim a backend success
// (callers pass demo-honest copy).
//
// Limitation: the host renders in the root layer, so RN Modal-based Sheets
// draw over it — only call showToast() from screen-level actions, not from
// inside a Sheet.
export type ToastInput = {
  title: string;
  body?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};
type Toast = ToastInput & { id: number };

let current: Toast | null = null;
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function showToast(t: ToastInput) {
  current = { ...t, id: ++seq };
  emit();
}

export function dismissToast() {
  current = null;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function ToastHost() {
  const toast = useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismissToast, 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // The host stays mounted so the toast can animate out.
  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", left: 0, right: 0, top: insets.top + 8 }}
      className="px-gutter"
      accessibilityLiveRegion="polite"
    >
      {toast ? (
        <Animated.View
          key={toast.id}
          entering={reduced ? undefined : FadeInUp.duration(duration.base)}
          exiting={reduced ? undefined : FadeOutUp.duration(duration.fast)}
        >
          <Pressable
            accessibilityRole="alert"
            accessibilityLabel={`${toast.title}. ${toast.body ?? ""}`}
            accessibilityHint="Trykk for å lukke"
            onPress={dismissToast}
            pressedScale={0.98}
            contentClassName="flex-row items-center gap-md rounded-lg bg-ink px-md py-md"
            contentStyle={elevation.e3}
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-onInk/10">
              <Icon
                name={toast.icon ?? "notifications-outline"}
                size="md"
                tone="onInk"
              />
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="label" weight="semibold" tone="onInk">
                {toast.title}
              </Text>
              {toast.body ? (
                <Text variant="caption" tone="onInk" numberOfLines={2}>
                  {toast.body}
                </Text>
              ) : null}
            </View>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}
