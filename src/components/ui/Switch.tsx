// Switch — themed on/off toggle. Ink when on (founder decision 2026-11-06:
// ember is kept for brand moments); the thumb changes colour with the state so
// it stays visible on both tracks in light and dark.
// `label` is required: the switch is announced as "<label>, på/av".
import { Switch as RNSwitch } from "react-native";

import { useThemeColors } from "@/theme";

export function Switch({
  value,
  onValueChange,
  label,
  disabled,
}: {
  value: boolean;
  onValueChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  const c = useThemeColors();
  return (
    <RNSwitch
      value={value}
      onValueChange={(next) => {
        onValueChange(next);
      }}
      disabled={disabled}
      trackColor={{ true: c.ink, false: c.line }}
      thumbColor={value ? c.onInk : c.muted}
      ios_backgroundColor={c.line}
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
    />
  );
}
