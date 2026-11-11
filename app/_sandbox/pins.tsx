// Dev-only: the map's pin groups (user 2026-11-11, "familiar map colours")
// with every interest's pin in its group, for checking colours and glyphs on
// a device (thirdplace://_sandbox/pins). Uses the same paint and glyphs as the
// map; a release build redirects _sandbox to the map.
import { ScrollView, View } from "react-native";

import { PinGlyph, Screen, Text } from "@/components/ui";
import type { MarkerGlyph } from "@/components/map/services/markerIcon";
import {
  INTEREST_PIN_GROUP,
  PIN_GROUP_LABEL,
  PIN_GROUP_TONE,
  PIN_GROUPS,
  pinGroupFill,
} from "@/components/map/services/pinGroup";
import { INTERESTS, type Interest } from "@/fixtures/catalog/interests";
import { palette } from "@/theme";

const pin = palette.light;

export default function SandboxPins() {
  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 px-gutter py-4 pb-12">
        <Text variant="h2">Kartnåler</Text>
        {PIN_GROUPS.map((group) => {
          const fill = pinGroupFill(group);
          const glyph =
            PIN_GROUP_TONE[group] === "light" ? pin.surface : pin.ink;
          const interests = (INTERESTS as readonly Interest[]).filter(
            (i) => INTEREST_PIN_GROUP[i.id] === group,
          );
          return (
            <View key={group} className="gap-3">
              <Text variant="label" weight="semibold">
                {PIN_GROUP_LABEL[group]}
              </Text>
              <View className="flex-row flex-wrap gap-4">
                {interests.map((i) => (
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
