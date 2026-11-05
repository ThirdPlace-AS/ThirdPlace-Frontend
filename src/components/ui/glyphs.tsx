// ThirdPlace glyphs (docs/design/DESIGN_SYSTEM.md §3 "Icons") — the few
// concepts Ionicons has no honest glyph for. Drawn on the 24 px grid with the
// shared stroke (iconStroke 1.75, round caps/joins) so they sit next to
// Ionicons outline icons. Rendered through <Icon name="tp-…">, never directly.
import Svg, { Path, Rect } from "react-native-svg";

import { iconStroke } from "@/theme";

type GlyphProps = { size: number; color: string };

function Frame({
  size,
  children,
}: {
  size: number;
  children: React.ReactNode;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </Svg>
  );
}

const line = (color: string) =>
  ({
    stroke: color,
    strokeWidth: iconStroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }) as const;

/** Opplevelser — a ticket stub with a torn perforation. */
function Experience({ size, color }: GlyphProps) {
  return (
    <Frame size={size}>
      <Path
        d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-2a2.5 2.5 0 0 0 0-5z"
        {...line(color)}
      />
      <Path d="M14.5 8.5v1.2M14.5 11.4v1.2M14.5 14.3v1.2" {...line(color)} />
    </Frame>
  );
}

/** Sveip — a card with another tilted behind it. */
function Swipe({ size, color }: GlyphProps) {
  return (
    <Frame size={size}>
      <Path
        d="M7.5 6.7 5.3 7.3a1.5 1.5 0 0 0-1.06 1.84l2.33 8.7a1.5 1.5 0 0 0 .93 1.02"
        {...line(color)}
      />
      <Rect x={7.5} y={4} width={12.5} height={16} rx={2.4} {...line(color)} />
      <Path d="M10.75 15.75h6" {...line(color)} />
    </Frame>
  );
}

function SwipeFilled({ size, color }: GlyphProps) {
  return (
    <Frame size={size}>
      <Path
        d="M7.5 6.7 5.3 7.3a1.5 1.5 0 0 0-1.06 1.84l2.33 8.7a1.5 1.5 0 0 0 .93 1.02"
        {...line(color)}
      />
      <Rect
        x={7.5}
        y={4}
        width={12.5}
        height={16}
        rx={2.4}
        fill={color}
        {...line(color)}
      />
    </Frame>
  );
}

/** GPS-ankomst — a pin with a check: "you are here". */
function Arrival({ size, color }: GlyphProps) {
  return (
    <Frame size={size}>
      <Path
        d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"
        {...line(color)}
      />
      <Path d="m9.4 10.1 1.8 1.8 3.5-3.6" {...line(color)} />
    </Frame>
  );
}

/** Bedrift — a shop front with a scalloped awning. */
function Business({ size, color }: GlyphProps) {
  return (
    <Frame size={size}>
      <Path
        d="M4 9 5.2 4.8A1 1 0 0 1 6.2 4h11.6a1 1 0 0 1 1 .8L20 9"
        {...line(color)}
      />
      <Path
        d="M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"
        {...line(color)}
      />
      <Path
        d="M5.5 11.2V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-7.8"
        {...line(color)}
      />
      <Path d="M10 20v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4" {...line(color)} />
    </Frame>
  );
}

export const glyphs = {
  "tp-experience": Experience,
  "tp-swipe": Swipe,
  "tp-swipe-filled": SwipeFilled,
  "tp-arrival": Arrival,
  "tp-business": Business,
} as const;

export type GlyphName = keyof typeof glyphs;

export function isGlyph(name: string): name is GlyphName {
  return name in glyphs;
}
