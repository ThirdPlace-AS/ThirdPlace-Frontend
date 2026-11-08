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
  ember: "bg-emberStrong", // text on pink: the AA-safe pink
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
  kind = "tag",
}: {
  label: string;
  tone?: BadgeTone;
  /** "tag" = short uppercase marker (DEMO, LIVE); "status" = sentence-case
   *  state ("Venter på verifisering", "Godkjent"). */
  kind?: "tag" | "status";
}) {
  const status = kind === "status";
  return (
    <View
      className={`self-start rounded-full ${status ? "px-2.5 py-1" : "px-sm py-0.5"} ${SHELL[tone]}`}
    >
      <Text
        variant={status ? "caption" : "micro"}
        weight="semibold"
        tone={FG[tone]}
      >
        {label}
      </Text>
    </View>
  );
}
