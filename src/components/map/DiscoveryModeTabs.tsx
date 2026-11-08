import { memo } from "react";
import { elevation } from "@/theme";
import { Pressable, ScrollView } from "react-native";

import {
  DISCOVERY_MODE_LABELS,
  DISCOVERY_MODES,
  type DiscoveryMode,
} from "./types/mapPresentation";
import { Text } from "@/components/ui";

// Horizontal discovery-mode selector styled as Google-Maps-style floating chips:
// each mode is its own rounded pill with a shadow (so it reads as floating over
// the map). Selected = filled (ink bg, light text); unselected = white surface
// with a hairline border. `role="tab"` + selected state announced for screen
// readers. memo'd: re-renders only when the mode changes.
export const DiscoveryModeTabs = memo(function DiscoveryModeTabs({
  mode,
  onChange,
}: {
  mode: DiscoveryMode;
  onChange: (m: DiscoveryMode) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="items-center gap-2 px-gutter py-1"
      accessibilityRole="tablist"
    >
      {DISCOVERY_MODES.map((m) => {
        const selected = m === mode;
        return (
          <Pressable
            key={m}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={DISCOVERY_MODE_LABELS[m]}
            onPress={() => onChange(m)}
            style={elevation.e1}
            className={`flex-row items-center gap-1.5 rounded-full border px-4 py-2 ${
              selected ? "border-ink bg-ink" : "border-line bg-surface"
            }`}
          >
            <Text
              variant="label"
              weight={selected ? "semibold" : "medium"}
              tone={selected ? "onInk" : "ink"}
            >
              {DISCOVERY_MODE_LABELS[m]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});
