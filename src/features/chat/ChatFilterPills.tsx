// The pill row under the Chat search (0459): one horizontal row of `Chip`s,
// edge to edge so the pills scroll under the screen edge, single select.
// Chips stay silent (no haptics, per the haptics rule).
import { memo } from "react";
import { ScrollView } from "react-native";

import { Chip } from "@/components/ui";
import { gutterPx } from "@/theme";

import type { ChatFilter, ChatFilterKey } from "./chatFilters";

export const ChatFilterPills = memo(function ChatFilterPills({
  pills,
  value,
  onChange,
}: {
  pills: readonly ChatFilter[];
  value: ChatFilterKey;
  onChange: (key: ChatFilterKey) => void;
}) {
  return (
    <ScrollView
      horizontal
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
});
