// Badge (docs/design/DESIGN_SYSTEM.md §4) — small non-interactive status tag
// ("DEMO", "Live", "Ny", "Venteliste"). Not for unread counts (IconButton badge).
import { View } from "react-native";

import { Text, type TextTone } from "./Text";

export type BadgeTone =
  | "neutral"
  | "ink"
  | "ember"
  | "success"
  | "warning"
  | "danger";

// Literal class names so Tailwind generates them.
const SHELL: Record<BadgeTone, string> = {
  neutral: "border border-line bg-surfaceMuted",
  ink: "bg-ink",
  ember: "bg-ember",
  success: "bg-success/15",
  warning: "bg-warning/15",
  danger: "bg-danger/15",
};
const FG: Record<BadgeTone, TextTone> = {
  neutral: "muted",
  ink: "inverse",
  ember: "onEmber",
  success: "success",
  warning: "warning",
  danger: "danger",
};

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: BadgeTone;
}) {
  return (
    <View className={`self-start rounded-full px-sm py-0.5 ${SHELL[tone]}`}>
      <Text variant="micro" weight="semibold" tone={FG[tone]}>
        {label}
      </Text>
    </View>
  );
}
