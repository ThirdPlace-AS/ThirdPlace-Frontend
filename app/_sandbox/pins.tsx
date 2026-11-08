// Dev-only: every interest's map pin (Phase 19), grouped by colour, for
// checking the glyphs on a device (thirdplace://_sandbox/pins). Uses the same
// paint and glyphs as the map; a release build redirects _sandbox to the map.
import { ScrollView, View } from "react-native";

import { PinGlyph, Screen, Text } from "@/components/ui";
import {
  MARKER_GLYPH_TONE,
  MARKER_LABEL,
  markerFill,
} from "@/components/map/services/markerCategory";
import type { MarkerGlyph } from "@/components/map/services/markerIcon";
import {
  INTEREST_CATEGORIES,
  interestsInCategory,
} from "@/fixtures/catalog/interests";
import { palette } from "@/theme";

const pin = palette.light;

export default function SandboxPins() {
  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 px-gutter py-4 pb-12">
        <Text variant="h2">Kartnåler</Text>
        {INTEREST_CATEGORIES.map((cat) => {
          const fill = markerFill(cat);
          const glyph =
            MARKER_GLYPH_TONE[cat] === "light" ? pin.surface : pin.ink;
          return (
            <View key={cat} className="gap-3">
              <Text variant="label" weight="semibold">
                {MARKER_LABEL[cat]}
              </Text>
              <View className="flex-row flex-wrap gap-4">
                {interestsInCategory(cat).map((i) => (
                  <View key={i.id} className="w-16 items-center gap-1">
                    <View
                      className="h-8 w-8 items-center justify-center rounded-full border-2"
                      style={{
                        backgroundColor: fill,
                        borderColor: pin.surface,
                      }}
                    >
                      <PinGlyph
                        name={i.glyph as MarkerGlyph}
                        size={16}
                        color={String(glyph)}
                      />
                    </View>
                    <Text variant="caption" tone="muted" numberOfLines={1}>
                      {i.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
