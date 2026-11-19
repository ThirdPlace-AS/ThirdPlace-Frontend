import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";

// Lightweight bottom sheet (Modal-based) for filters and detail panels.
// No external sheet lib — keeps the dependency surface small for Phase 1.
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
      <Pressable
        accessibilityLabel="Lukk"
        accessibilityRole="button"
        onPress={onClose}
        className="flex-1 justify-end bg-ink/40"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="gap-4 rounded-t-lg bg-surface p-gutter pb-8"
        >
          <View className="h-1 w-10 self-center rounded-full bg-line" />
          {title ? (
            <Text className="text-lg font-bold text-ink">{title}</Text>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
