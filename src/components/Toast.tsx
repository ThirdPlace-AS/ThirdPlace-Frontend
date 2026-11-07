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
  /** One action on the right (PDF p27 draws "Meld på" / "Bli med"), e.g.
   * "Angre" after removing something. The toast stays 5 s instead of 3.5. */
  action?: { label: string; onPress: () => void };
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

// Sheets exit in 200 ms; a toast fired from inside one would draw under the
// Modal. Close the sheet first, then call this: it waits for the exit.
const SHEET_EXIT_MS = 240;
export function showToastAfterSheet(t: ToastInput) {
  setTimeout(() => showToast(t), SHEET_EXIT_MS);
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
    const t = setTimeout(dismissToast, toast.action ? 5000 : 3500);
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
          {/* Row: tap-to-close body + an optional action as a SIBLING (no
              button inside a button on web). */}
          <View
            className="flex-row items-center rounded-lg bg-ink"
            style={elevation.e3}
          >
            <Pressable
              accessibilityRole="alert"
              accessibilityLabel={`${toast.title}. ${toast.body ?? ""}`}
              accessibilityHint="Trykk for å lukke"
              onPress={dismissToast}
              pressedScale={0.98}
              className="flex-1"
              contentClassName="flex-row items-center gap-md px-md py-md"
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
            {toast.action ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={toast.action.label}
                haptic="selection"
                hitSlop={8}
                onPress={() => {
                  const run = toast.action?.onPress;
                  dismissToast();
                  run?.();
                }}
                className="pr-md"
                contentClassName="rounded-full bg-onInk/10 px-md py-2"
              >
                <Text variant="label" weight="semibold" tone="onInk">
                  {toast.action.label}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
