// Switch — themed on/off toggle. Ink when on (founder decision 2026-11-06:
// ember is kept for brand moments); the thumb changes colour with the state so
// it stays visible on both tracks in light and dark. In dark mode the off
// track was the border grey (#3A3A3A, about 1.5:1 on the page, 0467), so
// there it is the muted grey with a surface-coloured thumb.
// `label` is required: the switch is announced as "<label>, på/av".
import { Switch as RNSwitch } from "react-native";

import { useScheme, useThemeColors } from "@/theme";

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
  const dark = useScheme() === "dark";
  const offTrack = dark ? c.muted : c.line;
  const offThumb = dark ? c.surface : c.muted;
  return (
    <RNSwitch
      value={value}
      onValueChange={(next) => {
        onValueChange(next);
      }}
      disabled={disabled}
      trackColor={{ true: c.ink, false: offTrack }}
      thumbColor={value ? c.onInk : offThumb}
      ios_backgroundColor={offTrack}
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
    />
  );
}
