import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Icon, ListRow } from "@/components/ui";
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
    <View className="border-b border-line">
      <ListRow
        icon={icon}
        title={label}
        value={value}
        onPress={onPress}
        danger={danger}
      />
    </View>
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
