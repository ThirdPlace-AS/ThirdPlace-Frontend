// Switch — themed on/off toggle (ember when on, as in the PDF settings).
// `label` is required: the switch is announced as "<label>, på/av".
import { Switch as RNSwitch } from "react-native";

import { haptics } from "@/lib/haptics";
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
        haptics.selection();
        onValueChange(next);
      }}
      disabled={disabled}
      trackColor={{ true: c.ember, false: c.line }}
      thumbColor={c.onEmber}
      ios_backgroundColor={c.line}
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
    />
  );
}
