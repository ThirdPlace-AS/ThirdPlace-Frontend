import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, Switch, Text, View } from "react-native";

import { colors } from "@/theme";

// Shared building blocks for the Settings + Privacy routes. All inert/demo:
// toggles keep local state only and persist nothing (BLOCKED_CONTRACT_GAP — no
// settings/consent backend). Kept together so both routes read as one system.

export function SettingsSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-2">
      {title ? (
        <Text className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-lg bg-surface">{children}</View>
    </View>
  );
}

export function NavRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-line px-4 py-3.5 active:bg-surfaceMuted"
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? colors.ember : colors.ink}
      />
      <Text
        className={`flex-1 text-base ${danger ? "text-ember" : "text-ink"}`}
      >
        {label}
      </Text>
      {value ? <Text className="text-sm text-muted">{value}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

export function ToggleRow({
  icon,
  label,
  hint,
  value,
  onValueChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-3 border-b border-line px-4 py-3">
      <Ionicons name={icon} size={20} color={colors.ink} />
      <View className="flex-1">
        <Text className="text-base text-ink">{label}</Text>
        {hint ? <Text className="text-xs text-muted">{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.ember, false: colors.line }}
        thumbColor="#FFFFFF"
        accessibilityLabel={label}
      />
    </View>
  );
}
