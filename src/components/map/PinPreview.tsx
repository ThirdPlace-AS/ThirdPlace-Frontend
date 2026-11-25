// How a new business will sit on the map (review 2026-11-18 PR-09, 0527:
// business onboarding ends on its pin). A small drawn map tile with the
// business's own pin, painted and iconed like the map's place pins
// (placeGlyph.ts: by its kind of place; an unknown kind gets the place
// fallback), and its name under it like the map's pin titles. Nothing is
// put on the map: the business is hidden until it is verified (founder
// answer 20).
import { View } from "react-native";

import { PinGlyph, Text } from "@/components/ui";
import { palette, useThemeColors } from "@/theme";

import { PIN_GROUP_TONE, pinGroupFill } from "./services/pinGroup";
import { FALLBACK_GLYPH } from "./services/markerIcon";
import { placeKindGlyph, placeKindGroup } from "./services/placeGlyph";

// The map's pins use the light palette in every theme.
const PIN = palette.light as unknown as { ink: string; surface: string };
const SIZE = 34;

export function PinPreview({
  name,
  category,
}: {
  name: string;
  category: string | null;
}) {
  const c = useThemeColors();
  const group = placeKindGroup(category ?? undefined) ?? "social";
  const glyph = placeKindGlyph(category ?? undefined) ?? FALLBACK_GLYPH.place;
  const glyphColor = PIN_GROUP_TONE[group] === "light" ? PIN.surface : PIN.ink;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${name} på kartet`}
      style={{ height: 160 }}
      className="items-center justify-center overflow-hidden rounded-md border border-line bg-surfaceMuted"
    >
      {/* A few streets, so the tile reads as a map. */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "30%",
          height: 10,
          backgroundColor: c.surface,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "68%",
          width: 10,
          backgroundColor: c.surface,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "18%",
          width: 6,
          backgroundColor: c.surface,
          transform: [{ rotate: "24deg" }],
        }}
      />
      <View className="items-center gap-1">
        <View
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: 2,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pinGroupFill(group),
            borderColor: PIN.surface,
          }}
        >
          <PinGlyph name={glyph} size={19} color={glyphColor} />
        </View>
        <View className="rounded-full bg-surface px-2 py-1">
          <Text variant="caption" weight="semibold" numberOfLines={1}>
            {name}
          </Text>
        </View>
      </View>
    </View>
  );
}
