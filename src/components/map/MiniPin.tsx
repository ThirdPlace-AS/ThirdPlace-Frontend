// A small copy of an item's map pin (user 2026-11-11: with no colour key on
// the map, the detail sheet shows the pin's colour and icon by its type label,
// "a green tree before Park"). Same paint and glyph as the map's pins
// (pinStyle.ts, markerIcon.ts); decorative, the label says it in words.
import { View } from "react-native";

import { PinGlyph } from "@/components/ui";
import { palette } from "@/theme";

import { markerPaint } from "./pinStyle";
import { markerIcon } from "./services/markerIcon";
import type { SheetTarget } from "./sheetTypes";

// The map's pins use the light palette in every theme.
const PIN = palette.light as unknown as {
  ink: string;
  surface: string;
  onInk: string;
};
const SIZE = 22;

export function MiniPin({ target }: { target: SheetTarget | undefined }) {
  if (!target || (target.kind !== "place" && target.kind !== "experience"))
    return null;
  const item = { kind: target.kind, id: target.id };
  const look = markerPaint(item, PIN);
  return (
    <View
      testID="mini-pin"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: look.fill,
        borderColor: look.ring,
      }}
    >
      <PinGlyph name={markerIcon(item)} size={13} color={look.glyph} />
    </View>
  );
}
