import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Icon } from "@/components/ui";
import { Switch } from "@/components/ui/Switch";

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
      <Icon name={icon} size="md" tone={danger ? "ember" : "ink"} />
      <Text
        className={`font-normal flex-1 text-base ${danger ? "text-emberText" : "text-ink"}`}
      >
        {label}
      </Text>
      {value ? (
        <Text className="text-sm text-muted font-normal">{value}</Text>
      ) : null}
      <Icon name="chevron-forward" size="md" tone="muted" />
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
      <Icon name={icon} size="md" tone="ink" />
      <View className="flex-1">
        <Text className="text-base text-ink font-normal">{label}</Text>
        {hint ? (
          <Text className="text-xs text-muted font-normal">{hint}</Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} label={label} />
    </View>
  );
}
