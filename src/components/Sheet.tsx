import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";

// Lightweight bottom sheet (Modal-based) for filters and detail panels.
// No external sheet lib — keeps the dependency surface small for Phase 1.
// The backdrop (tap-to-close) is a SIBLING behind the card, not its ancestor,
// so the card's Chips/Buttons are never nested inside a <button>. The opaque
// card sits on top of the backdrop, so taps on it don't reach the backdrop.
export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
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
          className="absolute inset-0 bg-ink/40"
        />
        <View className="gap-4 rounded-t-lg bg-surface p-gutter pb-8">
          <View className="h-1 w-10 self-center rounded-full bg-line" />
          {title ? (
            <Text className="text-lg font-bold text-ink">{title}</Text>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}
