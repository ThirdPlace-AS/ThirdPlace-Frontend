// FilterPills (docs/design/DESIGN_SYSTEM.md §4): one horizontal row of single-
// select `Chip`s under a list's search or title, edge to edge so the pills
// scroll under the screen edge (`bleed` inside a page body that already has
// the gutter). Shared by Chat (0459) and Varsler (0460).
// Chips stay silent (no haptics, per the haptics rule).
import { memo } from "react";
import { ScrollView } from "react-native";

import { gutterPx } from "@/theme";

import { Chip } from "./Chip";

export type FilterPill<K extends string> = { key: K; label: string };

function FilterPillsInner<K extends string>({
  pills,
  value,
  onChange,
  bleed = false,
}: {
  pills: readonly FilterPill<K>[];
  value: K;
  onChange: (key: K) => void;
  /** Inside a page body that already has the gutter: reach the screen edges. */
  bleed?: boolean;
}) {
  return (
    <ScrollView
      horizontal
      style={bleed ? { marginHorizontal: -gutterPx, flexGrow: 0 } : undefined}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="gap-2 py-2"
      contentContainerStyle={{ paddingHorizontal: gutterPx }}
    >
      {pills.map((p) => (
        <Chip
          key={p.key}
          label={p.label}
          accessibilityLabel={`Filter: ${p.label}`}
          selected={p.key === value}
          onPress={() => onChange(p.key)}
        />
      ))}
    </ScrollView>
  );
}

export const FilterPills = memo(FilterPillsInner) as typeof FilterPillsInner;
