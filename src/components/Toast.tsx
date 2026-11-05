import { Ionicons } from "@expo/vector-icons";
import { useEffect, useSyncExternalStore } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeInUp,
  FadeOutUp,
  useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme";

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

  if (!toast) return null;
  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", left: 0, right: 0, top: insets.top + 8 }}
      className="px-gutter"
    >
      <Animated.View
        key={toast.id}
        entering={reduced ? undefined : FadeInUp.duration(200)}
        exiting={reduced ? undefined : FadeOutUp.duration(150)}
      >
        <Pressable
          accessibilityRole="alert"
          accessibilityLabel={`${toast.title}. ${toast.body ?? ""}`}
          onPress={dismissToast}
          className="flex-row items-center gap-3 rounded-lg bg-ink px-4 py-3"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Ionicons
              name={toast.icon ?? "notifications-outline"}
              size={18}
              color={colors.onInk}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-white">
              {toast.title}
            </Text>
            {toast.body ? (
              <Text className="text-xs text-white/75" numberOfLines={2}>
                {toast.body}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}
