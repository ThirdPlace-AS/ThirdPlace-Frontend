import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Icon, ListRow, type IconName, Text } from "@/components/ui";
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
        <Text variant="micro" weight="semibold" tone="muted" className="px-1">
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
  icon: IconName;
  label: string;
  value?: string;
  /** Without onPress the row is plain text (no chevron, no press). */
  onPress?: () => void;
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
  icon: IconName;
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    // The whole row toggles (the switch alone was a 27 dp target); the
    // Switch stays the one accessible control, so the row is not focusable.
    <Pressable
      accessible={false}
      onPress={() => onValueChange(!value)}
      className="flex-row items-center gap-3 border-b border-line px-4 py-3"
    >
      <Icon name={icon} size="md" tone="ink" />
      <View className="flex-1">
        <Text variant="body">{label}</Text>
        {hint ? (
          <Text variant="caption" tone="muted">
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} label={label} />
    </Pressable>
  );
}
