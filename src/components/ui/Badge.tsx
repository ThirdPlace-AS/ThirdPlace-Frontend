// Badge (docs/design/DESIGN_SYSTEM.md §4) — small non-interactive status tag
// ("DEMO", "Live", "Ny", "Venteliste"). Not for unread counts (IconButton badge).
// Shell and label tables: base/badge.
import { View } from "react-native";

import { badgeClass, badgeFill, badgeTone, type BadgeTone } from "./base/badge";
import { Text } from "./Text";

export type { BadgeTone };

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
  const fill = badgeFill(tone, solid);
  return (
    <View className={badgeClass({ kind, fill })}>
      <Text
        variant={kind === "status" ? "caption" : "micro"}
        weight="semibold"
        tone={badgeTone[fill]}
      >
        {label}
      </Text>
    </View>
  );
}
