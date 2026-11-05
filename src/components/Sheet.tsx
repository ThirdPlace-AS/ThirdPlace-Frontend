import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";

import { useThemeColors } from "@/theme";

// Lightweight bottom sheet (Modal-based) for filters and detail panels.
// No external sheet lib — keeps the dependency surface small for Phase 1.
// The backdrop (tap-to-close) is a SIBLING behind the card, not its ancestor,
// so the card's Chips/Buttons are never nested inside a <button>. The opaque
// card sits on top of the backdrop, so taps on it don't reach the backdrop.
//
// `fullHeight` renders a tall card (~92%) with a header row (title left + X
// right) instead of the centered drag-handle, for the large "Filtre" sheet.
// Children then own their own scroll area + sticky footer inside a flex column.
export function Sheet({
  visible,
  onClose,
  title,
  tone = "light",
  surfaceTone = "default",
  fullHeight = false,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  // "dark" matches a dark overlay (e.g. the notifications screen); default light.
  tone?: "light" | "dark";
  // "muted" paints the sheet card light-gray so white content cards read against
  // it (the "Filtre" card-stack look). Default keeps the plain white sheet.
  surfaceTone?: "default" | "muted";
  fullHeight?: boolean;
  children: ReactNode;
}) {
  const colors = useThemeColors();
  const dark = tone === "dark";
  const lightBg = surfaceTone === "muted" ? "bg-surfaceMuted" : "bg-surface";
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Lukk"
          accessibilityRole="button"
          onPress={onClose}
          className={`absolute inset-0 ${dark ? "bg-black/60" : "bg-ink/40"}`}
        />
        <View
          className={`gap-4 rounded-t-xl p-gutter pb-8 ${
            dark ? "bg-ink" : lightBg
          } ${fullHeight ? "h-[92%]" : ""}`}
        >
          {fullHeight ? (
            <View className="flex-row items-center justify-between border-b border-line pb-3">
              <Text
                className={`text-lg font-bold ${dark ? "text-white" : "text-ink"}`}
              >
                {title}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Lukk"
                onPress={onClose}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={dark ? colors.onInk : colors.ink}
                />
              </Pressable>
            </View>
          ) : (
            <>
              <View
                className={`h-1 w-10 self-center rounded-full ${
                  dark ? "bg-white/20" : "bg-line"
                }`}
              />
              {title ? (
                <Text
                  className={`text-lg font-bold ${
                    dark ? "text-white" : "text-ink"
                  }`}
                >
                  {title}
                </Text>
              ) : null}
            </>
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
}
