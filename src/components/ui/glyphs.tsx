// ThirdPlace glyphs (docs/design/DESIGN_SYSTEM.md §3 "Icons") — the few
// concepts Ionicons has no honest glyph for. Drawn on the 24 px grid with the
// shared stroke (iconStroke 1.75, round caps/joins) so they sit next to
// Ionicons outline icons. Rendered through <Icon name="tp-…">, never directly.
import Svg, { Circle, G, Path, Rect } from "react-native-svg";

import { iconStroke } from "@/theme";

type GlyphProps = { size: number; color: string };

function Frame({
  size,
  wide = 24,
  children,
}: {
  size: number;
  /** Width of the drawing grid; 24 = square. Height stays 24, so a wider
   *  grid draws a wider glyph at the same height. */
  wide?: number;
  children: React.ReactNode;
}) {
  return (
    <Svg
      width={(size * wide) / 24}
      height={size}
      viewBox={`0 0 ${wide} 24`}
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

/** Sveip — the founder's icon (sveip.svg, 2026-11-06): a stack of three
 * cards tilted -18°, the front one with a dot. Geometry and stroke (2) as
 * supplied; the other glyphs keep the shared 1.75. */
const swipeLine = (color: string) =>
  ({ ...line(color), strokeWidth: 2 }) as const;
const SWIPE_TILT = { rotation: -18, origin: "13.8, 11.5" } as const;
const SWIPE_BACK =
  "M5.1 7.3H4.6a1.6 1.6 0 0 0-1.6 1.6v9.3a1.6 1.6 0 0 0 1.6 1.6h.5";
const SWIPE_MIDDLE =
  "M7.6 5.2h-.7a1.7 1.7 0 0 0-1.7 1.7v11.2a1.7 1.7 0 0 0 1.7 1.7h.7";

function Swipe({ size, color }: GlyphProps) {
  return (
    <Frame size={size}>
      <G {...SWIPE_TILT}>
        <Path d={SWIPE_BACK} {...swipeLine(color)} />
        <Path d={SWIPE_MIDDLE} {...swipeLine(color)} />
        <Rect
          x={8}
          y={2.4}
          width={11.4}
          height={17.2}
          rx={1.4}
          {...swipeLine(color)}
        />
        <Circle cx={11.1} cy={5.9} r={0.65} fill={color} />
      </G>
    </Frame>
  );
}

/** Active tab: the front card filled (the dot would need a background colour,
 * which a glyph does not get, so it is left out — as before). */
function SwipeFilled({ size, color }: GlyphProps) {
  return (
    <Frame size={size}>
      <G {...SWIPE_TILT}>
        <Path d={SWIPE_BACK} {...swipeLine(color)} />
        <Path d={SWIPE_MIDDLE} {...swipeLine(color)} />
        <Rect
          x={8}
          y={2.4}
          width={11.4}
          height={17.2}
          rx={1.4}
          fill={color}
          {...swipeLine(color)}
        />
      </G>
    </Frame>
  );
}

/** Legg til (centre tab, founder 2026-11-07: like the other tabs) — a plus
 * in a rounded rectangle, wider than the other glyphs (founder 2026-11-08:
 * on a 36 × 24 grid, so it is 1.5 times as wide at the same height). Idle:
 * outline with the shared stroke. */
const ADD_WIDE = 36;
function Add({ size, color }: GlyphProps) {
  return (
    <Frame size={size} wide={ADD_WIDE}>
      <Rect x={3.5} y={3.5} width={29} height={17} rx={5} {...line(color)} />
      <Path d="M18 8.25v7.5M14.25 12h7.5" {...line(color)} />
    </Frame>
  );
}

// Active: the rectangle filled to the outline's outer edge (x 2.625–33.375,
// y 2.625–21.375) with the plus cut out (evenodd), so the bar shows through
// it; a glyph gets no background colour to draw the plus with. The cut-out
// keeps the outline's round ends (arcs of half the stroke).
const ADD_FILLED =
  "M8.5 2.625h19A5.875 5.875 0 0 1 33.375 8.5v7A5.875 5.875 0 0 1 27.5 21.375H8.5A5.875 5.875 0 0 1 2.625 15.5V8.5A5.875 5.875 0 0 1 8.5 2.625z" +
  "M17.125 8.25a.875.875 0 0 1 1.75 0v2.875h2.875a.875.875 0 0 1 0 1.75h-2.875v2.875a.875.875 0 0 1-1.75 0v-2.875H14.25a.875.875 0 0 1 0-1.75h2.875z";

function AddFilled({ size, color }: GlyphProps) {
  return (
    <Frame size={size} wide={ADD_WIDE}>
      <Path d={ADD_FILLED} fill={color} fillRule="evenodd" />
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
  "tp-add": Add,
  "tp-add-filled": AddFilled,
  "tp-arrival": Arrival,
  "tp-business": Business,
} as const;

export type GlyphName = keyof typeof glyphs;

export function isGlyph(name: string): name is GlyphName {
  return name in glyphs;
}
