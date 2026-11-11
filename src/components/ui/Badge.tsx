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

// Solid fills for a badge over a photo, where a 15 % tint would not read as
// green or red (the browse card's "Åpent" / "Stengt", 2026-11-09). White on
// success is 4.5:1, on danger 5.5:1, the same in both schemes.
const SOLID_SHELL: Partial<Record<BadgeTone, string>> = {
  success: "bg-success",
  danger: "bg-danger",
};
const SOLID_FG: Partial<Record<BadgeTone, TextTone>> = {
  success: "onSuccess",
  danger: "onDanger",
};

export function Badge({
  label,
  tone = "neutral",
  kind = "tag",
  solid = false,
}: {
  label: string;
  tone?: BadgeTone;
  /** "tag" = short uppercase marker (DEMO, LIVE); "status" = sentence-case
   *  state ("Venter på verifisering", "Godkjent"). */
  kind?: "tag" | "status";
  /** success / danger only: a solid fill with white text, for a badge over a
   *  photo. Other tones ignore it. */
  solid?: boolean;
}) {
  const status = kind === "status";
  const shell = (solid && SOLID_SHELL[tone]) || SHELL[tone];
  const fg = (solid && SOLID_FG[tone]) || FG[tone];
  return (
    <View
      className={`self-start rounded-full ${status ? "px-2.5 py-1" : "px-sm py-0.5"} ${shell}`}
    >
      <Text variant={status ? "caption" : "micro"} weight="semibold" tone={fg}>
        {label}
      </Text>
    </View>
  );
}
