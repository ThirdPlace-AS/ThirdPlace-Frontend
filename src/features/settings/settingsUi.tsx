import { useState, type ReactNode } from "react";
import { View } from "react-native";
import {
  Icon,
  ListRow,
  type IconName,
  Text,
  Pressable as UIPressable,
} from "@/components/ui";
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
      <View className="overflow-hidden rounded-lg border border-line bg-surface">
        {children}
      </View>
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
    <UIPressable
      accessible={false}
      haptic="selection"
      onPress={() => onValueChange(!value)}
      contentClassName="flex-row items-center gap-3 border-b border-line px-4 py-3"
      pressedScale={0.99}
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
    </UIPressable>
  );
}

/** A card of toggle rows with local state (settings pages, export sheet). */
export function ToggleList({
  items,
  initial,
}: {
  items: { label: string; hint?: string; icon: IconName }[];
  initial: Record<string, boolean>;
}) {
  const [state, setState] = useState(initial);
  return (
    <View className="overflow-hidden rounded-lg border border-line bg-surface">
      {items.map((i) => (
        <ToggleRow
          key={i.label}
          icon={i.icon}
          label={i.label}
          hint={i.hint}
          value={!!state[i.label]}
          onValueChange={(v) => setState((st) => ({ ...st, [i.label]: v }))}
        />
      ))}
    </View>
  );
}
