import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { View } from "react-native";
import type { EntryExitAnimationFunction } from "react-native-reanimated";
import { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { Toaster, toast } from "sonner-native";

import { Icon, Pressable, Text } from "@/components/ui";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { duration, useElevation, gutterPx } from "@/theme";

const CARD_INSET = { marginHorizontal: gutterPx };
// sonner's positioner has no height of its own (the toast inside is
// absolute), and Android then leaves the toast out of the accessibility tree:
// TalkBack could not reach it. A min height above the card's keeps it in; the
// positioner passes touches through (box-none).
const POSITIONER = { minHeight: 120 };

// Flytende varsler (PDF p27): a floating banner at the top of the screen —
// icon, bold title, one-line body. `showToast(...)` from any screen; the queue,
// timers and swipe-to-dismiss are sonner-native's (DESIGN_SYSTEM.md §4, P4),
// the card is ours. <ToastHost /> is mounted once in the root layout. Toasts
// are local UI feedback only — they never claim a backend success.
//
// Limitation: the host renders in the root layer, so RN Modal-based Sheets
// draw over it on Android (sonner's full-window overlay is iOS only) — close
// the sheet first, then call showToastAfterSheet().
export type ToastInput = {
  title: string;
  body?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** One action on the right (PDF p27 draws "Meld på" / "Bli med"), e.g.
   * "Angre" after removing something. The toast stays 5 s instead of 3.5. */
  action?: { label: string; onPress: () => void };
};

// One toast at a time: a new one replaces the one on screen.
let currentId: string | number | null = null;

export function showToast(t: ToastInput) {
  if (currentId !== null) toast.dismiss(currentId);
  const id = toast.custom(<ToastCard toast={t} onClose={dismissToast} />, {
    duration: t.action ? 5000 : 3500,
    onAutoClose: (closedId) => {
      if (closedId === currentId) currentId = null;
    },
    onDismiss: (closedId) => {
      if (closedId === currentId) currentId = null;
    },
  });
  currentId = id;
}

// Sheets exit in 200 ms; a toast fired from inside one would draw under the
// Modal. Close the sheet first, then call this: it waits for the exit.
const SHEET_EXIT_MS = 240;
export function showToastAfterSheet(t: ToastInput) {
  setTimeout(() => showToast(t), SHEET_EXIT_MS);
}

export function dismissToast() {
  if (currentId === null) return;
  const id = currentId;
  currentId = null;
  toast.dismiss(id);
}

function ToastCard({
  toast: t,
  onClose,
}: {
  toast: ToastInput;
  onClose: () => void;
}) {
  const elev = useElevation();
  return (
    // Row: tap-to-close body + an optional action as a SIBLING (no button
    // inside a button on web).
    // Side gutters as a style: sonner's wrapper is full width and the
    // mx-gutter class did not reach this view on Android.
    <View
      className="flex-row items-center rounded-md bg-ink"
      style={[CARD_INSET, elev.e3]}
    >
      <Pressable
        accessibilityRole="alert"
        accessibilityLabel={`${t.title}. ${t.body ?? ""}`}
        accessibilityHint="Trykk for å lukke"
        onPress={onClose}
        pressedScale={0.98}
        className="flex-1"
        contentClassName="flex-row items-center gap-3 px-3 py-3"
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-onInk/10">
          <Icon
            name={t.icon ?? "notifications-outline"}
            size="md"
            tone="onInk"
          />
        </View>
        <View className="flex-1 gap-1">
          <Text variant="label" weight="semibold" tone="onInk">
            {t.title}
          </Text>
          {t.body ? (
            <Text variant="caption" tone="onInk" numberOfLines={2}>
              {t.body}
            </Text>
          ) : null}
        </View>
      </Pressable>
      {t.action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.action.label}
          hitSlop={8}
          onPress={() => {
            const run = t.action?.onPress;
            onClose();
            run?.();
          }}
          className="pr-3"
          contentClassName="rounded-full bg-onInk/10 px-3 py-2"
        >
          <Text variant="label" weight="semibold" tone="onInk">
            {t.action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// "Reduser bevegelse" (the phone's or Tilgjengelighet's): appear and leave in
// place. sonner only reads the phone's setting, so we pass these ourselves.
const STILL: EntryExitAnimationFunction = () => {
  "worklet";
  return { initialValues: {}, animations: {} };
};
const MOTION = {
  enter: FadeInUp.duration(duration.base),
  exit: FadeOutUp.duration(duration.fast),
};

export function ToastHost() {
  const reduced = useReducedMotion();
  const animation = useMemo(
    () => (reduced ? { enter: STILL, exit: STILL } : MOTION),
    [reduced],
  );
  return (
    <Toaster
      // No `offset`: with one, sonner drops the safe-area inset and the card
      // sits under the status bar. Its default is insets.top + 8.
      position="top-center"
      positionerStyle={POSITIONER}
      visibleToasts={1}
      enableStacking={false}
      swipeToDismissDirection="up"
      animation={animation}
    />
  );
}
