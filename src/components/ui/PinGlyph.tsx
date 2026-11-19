// Pin glyphs (Phase 19, founder 2026-11-08): every interest has its own map
// pin icon. Material Community Icons ship inside @expo/vector-icons and are
// filled shapes that read at pin size; Strikking's yarn ball is drawn here
// because the set has none. Pins only (the map, SoftMap and the dev pin
// sheet): the rest of the app keeps <Icon>. The font is preloaded behind the
// root font gate (app/_layout.tsx), so a pin image is never copied before
// its glyph can draw.
// raw-icon: pin glyphs come from a second icon family that <Icon> doesn't
// carry; this component is that family's single entry point.
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle, Path } from "react-native-svg";

export type PinGlyphName =
  | keyof typeof MaterialCommunityIcons.glyphMap
  | "yarn";

export function isPinGlyph(name: string): name is PinGlyphName {
  return name === "yarn" || name in MaterialCommunityIcons.glyphMap;
}

function Yarn({ size, color }: { size: number; color: string }) {
  const line = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    fill: "none",
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={11} cy={11} r={7.6} {...line} />
      <Path d="M4.6 13.6c3.6-.6 7-3.6 8.4-9.8" {...line} />
      <Path d="M7 17.6c3-1.9 7-5.8 9.7-10.8" {...line} />
      <Path d="M12.4 18.5c1-2.7 2.9-5 5.9-6.4" {...line} />
      <Path d="M17.4 16.6c1.5 1.1 2.6 2.4 3.4 4.2" {...line} />
    </Svg>
  );
}

export function PinGlyph({
  name,
  size,
  color,
}: {
  name: PinGlyphName;
  size: number;
  color: string;
}) {
  if (name === "yarn") return <Yarn size={size} color={color} />;
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}

/** The font to preload with the app's other fonts. */
export const PIN_GLYPH_FONT = MaterialCommunityIcons.font;
