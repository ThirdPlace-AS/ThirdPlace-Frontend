// CategoryArt (docs/design/ASSET_SPEC_3D.md) — 3D-styled category objects.
//
// Hand-built SVG in a toon style so the set reads as one family and never as
// generic "AI 3D": every object is a recognisable thing (cup, mug, plate, tree,
// hammer, record …), lit from the top-left, built from
//   · a flat face colour
//   · ONE shade (the same colour, darker) for the side facing away
//   · ONE hard-edged highlight (lighter) on the lit side
//   · an extrusion of 3–4 px straight down for thickness (¾ view)
//   · a flat contact-shadow ellipse
// No gradients. Colours come from the light palette tokens and stay the same
// in dark mode (like photos). When a real 3D render is delivered for a key,
// list it in src/assets/3d/manifest.ts and it replaces the SVG — no call site
// changes.
import { Image } from "expo-image";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

import { artFiles, CATEGORY_ART, type ArtKey } from "@/assets/3d/manifest";
import { palette } from "@/theme";

type ArtTokens = Record<
  | "surface"
  | "ink"
  | "ember"
  | "success"
  | "warning"
  | "muted"
  | "surfaceMuted",
  string
>;
const L = palette.light as unknown as ArtTokens;

function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return (
    "#" +
    pa
      .map((v, i) => Math.round(v + ((pb[i] ?? v) - v) * t))
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}
const WHITE = L.surface;
const BLACK = L.ink;
const luminance = (c: string) =>
  [1, 3, 5].reduce((sum, i) => sum + parseInt(c.slice(i, i + 2), 16), 0) / 765;
// Light faces get a softer shade so they do not turn muddy.
const shade = (c: string) => mix(c, BLACK, luminance(c) > 0.8 ? 0.13 : 0.28);
const tint = (c: string) => mix(c, WHITE, 0.45);

// Art colours: tokens, plus two mixes for wood and coffee (no new hex).
const C = {
  // "White" objects (ceramic, plaster, a ball) are paper-grey so they still
  // read on white cards; pure white is only for small details.
  white: mix(L.muted, WHITE, 0.84),
  pure: WHITE,
  ink: L.ink,
  ember: L.ember,
  green: L.success,
  amber: L.warning,
  grey: mix(L.muted, WHITE, 0.45),
  fill: L.surfaceMuted,
  wood: mix(L.warning, L.ink, 0.25),
  coffee: mix(L.warning, L.ink, 0.6),
  lightWood: mix(L.warning, WHITE, 0.55),
};

function Shadow({ rx = 20, cy = 58 }: { rx?: number; cy?: number }) {
  return (
    <Ellipse cx={32} cy={cy} rx={rx} ry={3.2} fill={BLACK} opacity={0.12} />
  );
}

/** A face with a straight-down extrusion in its own shade. */
function Solid({
  d,
  fill,
  depth = 3,
}: {
  d: string;
  fill: string;
  depth?: number;
}) {
  return (
    <>
      <Path d={d} fill={shade(fill)} transform={`translate(0 ${depth})`} />
      <Path d={d} fill={fill} />
    </>
  );
}

const hiStroke = (c: string, w = 2.5) =>
  ({
    stroke: tint(c),
    strokeWidth: w,
    strokeLinecap: "round",
    fill: "none",
  }) as const;

const ART: Record<ArtKey, () => React.JSX.Element> = {
  cafe: () => (
    <>
      <Shadow />
      <Ellipse cx={32} cy={51} rx={20} ry={5} fill={shade(C.white)} />
      <Ellipse cx={32} cy={49} rx={20} ry={5} fill={C.white} />
      <Path
        d="M45 32c8 0 8 11 0 11"
        stroke={shade(C.white)}
        strokeWidth={4}
        fill="none"
      />
      <Path d="M18 28h28v10a14 12 0 0 1-28 0z" fill={C.white} />
      <Path d="M37 28h9v10a14 12 0 0 1-9 11z" fill={shade(C.white)} />
      <Path d="M18 34h28v3H18z" fill={C.ember} />
      <Ellipse cx={32} cy={28} rx={14} ry={4} fill={C.coffee} />
      <Path
        d="M22 39v2.5a9 8 0 0 0 3 5"
        {...hiStroke(C.fill, 2)}
        stroke={C.white}
      />
    </>
  ),
  bar: () => (
    <>
      <Shadow rx={15} />
      <Path
        d="M41 26c9 0 9 15 0 15"
        stroke={shade(C.amber)}
        strokeWidth={4}
        fill="none"
      />
      <Path d="M20 24h22v28a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3z" fill={C.amber} />
      <Path d="M35 24h7v28a3 3 0 0 1-3 3h-4z" fill={shade(C.amber)} />
      <Path d="M24 30v18" {...hiStroke(C.amber)} />
      <Path
        d="M18 25q1-7 7-6 3-5 9-2 7-2 9 5 2 3-1 4H19q-2 0-1-1z"
        fill={C.white}
      />
      <Path d="M23 20q2-2 5-1" {...hiStroke(C.white, 2)} stroke={C.fill} />
    </>
  ),
  restaurant: () => (
    <>
      <Shadow rx={22} />
      <Ellipse cx={32} cy={46} rx={23} ry={9} fill={shade(C.white)} />
      <Ellipse cx={32} cy={43} rx={23} ry={9} fill={C.white} />
      <Ellipse cx={32} cy={43} rx={15} ry={5.5} fill={C.fill} />
      <Circle cx={27} cy={40} r={5} fill={C.ember} />
      <Path d="M24.5 38a3 3 0 0 1 3-2" {...hiStroke(C.ember, 1.8)} />
      <Ellipse cx={36} cy={41.5} rx={6} ry={3} fill={C.green} />
      <Path d="M31 42.5h10" stroke={shade(C.green)} strokeWidth={1.2} />
    </>
  ),
  outdoors: () => (
    <>
      <Shadow rx={16} />
      <Solid d="M29 36h6v18h-6z" fill={C.wood} depth={2} />
      <Circle cx={32} cy={27} r={15} fill={shade(C.green)} />
      <Circle cx={30} cy={25} r={14} fill={C.green} />
      <Path d="M21 21a10 10 0 0 1 8-6" {...hiStroke(C.green, 3)} />
    </>
  ),
  culture: () => (
    <>
      <Shadow rx={22} />
      <Solid d="M12 48h40v6H12z" fill={C.white} depth={2} />
      {[16, 28.5, 41].map((x) => (
        <G key={x}>
          <Path d={`M${x} 28h7v20h-7z`} fill={C.white} />
          <Path d={`M${x + 4.5} 28h2.5v20h-2.5z`} fill={shade(C.white)} />
        </G>
      ))}
      <Solid d="M10 28 32 14l22 14z" fill={C.ember} depth={3} />
      <Path d="M18 25 30 17.5" {...hiStroke(C.ember)} />
    </>
  ),
  workshop: () => (
    <>
      <Shadow rx={18} />
      <Solid d="m17 49 4 4 21-21-4-4z" fill={C.wood} depth={2} />
      <Path d="m20 47 18-18" {...hiStroke(C.wood, 1.8)} />
      <Solid d="m35 15 15 15-7 7-15-15z" fill={C.ink} depth={3} />
      <Path
        d="m35 19 4-4"
        stroke={mix(C.ink, WHITE, 0.4)}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </>
  ),
  tasting: () => (
    <>
      <Shadow rx={11} />
      <Ellipse cx={32} cy={52} rx={9} ry={2.8} fill={shade(C.white)} />
      <Rect x={30.8} y={36} width={2.4} height={15} fill={shade(C.white)} />
      <Path
        d="M20 13h24q1 21-12 24-13-3-12-24z"
        fill={C.white}
        opacity={0.95}
      />
      <Path d="M21 22h22q-1 13-11 14-10-1-11-14z" fill={C.ember} />
      <Path d="M36 22h7q-1 13-11 14 3-3 4-14z" fill={shade(C.ember)} />
      <Path d="M24 16q0 10 3 14" {...hiStroke(C.fill, 2)} stroke={C.white} />
    </>
  ),
  music: () => (
    <>
      <Shadow rx={18} />
      <Circle cx={32} cy={34} r={19} fill={shade(C.ink)} />
      <Circle cx={32} cy={31} r={19} fill={C.ink} />
      <Circle
        cx={32}
        cy={31}
        r={13.5}
        stroke={mix(C.ink, WHITE, 0.15)}
        strokeWidth={1.5}
        fill="none"
      />
      <Circle cx={32} cy={31} r={6.5} fill={C.ember} />
      <Circle cx={32} cy={31} r={1.6} fill={C.pure} />
      <Path
        d="M18 23a16 16 0 0 1 8-7"
        stroke={mix(C.ink, WHITE, 0.45)}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
  hiking: () => (
    <>
      <Shadow rx={24} />
      <Solid d="M7 52 26 20l10 15 7-9 14 26z" fill={C.grey} depth={3} />
      <Path d="M26 20 36 35 30 52H7z" fill={tint(C.grey)} opacity={0.35} />
      <Path d="m26 20 6 9-4-2-4 3-3-2z" fill={C.white} />
      <Path d="M5 52h54v3H5z" fill={C.green} />
    </>
  ),
  art: () => (
    <>
      <Shadow rx={20} />
      <Solid
        d="M12 34c0-12 12-19 23-17 11 2 17 10 15 17-2 5-8 3-10 7-2 4 3 8-4 10-11 2-24-5-24-17z"
        fill={C.lightWood}
        depth={3}
      />
      <Ellipse cx={39} cy={41} rx={3.5} ry={2.8} fill={shade(C.lightWood)} />
      <Circle cx={22} cy={30} r={4} fill={C.ember} />
      <Circle cx={31} cy={23.5} r={4} fill={C.green} />
      <Circle cx={41} cy={27} r={3.5} fill={C.ink} />
      <Circle cx={22} cy={40} r={3.5} fill={C.amber} />
      <Path d="M17 28c1-4 4-7 8-8" {...hiStroke(C.lightWood, 2)} />
    </>
  ),
  sport: () => (
    <>
      <Shadow rx={17} />
      <Circle cx={32} cy={34} r={18} fill={shade(C.white)} />
      <Circle cx={32} cy={31} r={18} fill={C.white} />
      <Path d="M32 24.5 38 29l-2.3 7h-7.4L26 29z" fill={C.ink} />
      <Path
        d="M32 24.5V14M38 29l9.5-3M35.7 36l6 8M28.3 36l-6 8M26 29l-9.5-3"
        stroke={C.ink}
        strokeWidth={1.6}
      />
      <Path
        d="M44 22a16 16 0 0 1 4 12"
        stroke={shade(C.white)}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M18 25a15 15 0 0 1 6-7"
        {...hiStroke(C.fill, 2)}
        stroke={C.fill}
      />
    </>
  ),
  social: () => (
    <>
      <Shadow rx={20} />
      <Solid
        d="M10 18a7 7 0 0 1 7-7h16a7 7 0 0 1 7 7v6a7 7 0 0 1-7 7H20l-6 5v-6a7 7 0 0 1-4-6z"
        fill={C.ember}
        depth={3}
      />
      <Path d="M14 16a4 4 0 0 1 3-2" {...hiStroke(C.ember)} />
      <Solid
        d="M24 34a7 7 0 0 1 7-7h16a7 7 0 0 1 7 7v6a7 7 0 0 1-4 6v6l-6-5H31a7 7 0 0 1-7-7z"
        fill={C.white}
        depth={3}
      />
      {[33, 39, 45].map((x) => (
        <Circle key={x} cx={x} cy={37.5} r={1.8} fill={C.ink} />
      ))}
    </>
  ),
  place: () => (
    <>
      <Shadow rx={20} />
      <Solid
        d="M12 26a5 5 0 0 1 5-5h30a5 5 0 0 1 5 5v19a5 5 0 0 1-5 5H17a5 5 0 0 1-5-5z"
        fill={C.fill}
        depth={4}
      />
      <Path
        d="M14 40c6-6 12-2 16-6s4-9 10-9"
        stroke={C.pure}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx={42} cy={41} rx={7} ry={4.5} fill={C.green} />
      <Path
        d="M32 8c-6 0-10 4-10 9 0 7 10 16 10 16s10-9 10-16c0-5-4-9-10-9z"
        fill={shade(C.ember)}
        transform="translate(1.5 1.5)"
      />
      <Path
        d="M32 8c-6 0-10 4-10 9 0 7 10 16 10 16s10-9 10-16c0-5-4-9-10-9z"
        fill={C.ember}
      />
      <Circle cx={32} cy={17} r={3.4} fill={C.pure} />
      <Path d="M25.5 14a7 7 0 0 1 3.5-3.5" {...hiStroke(C.ember, 2)} />
    </>
  ),
  experience: () => (
    <>
      <Shadow rx={20} />
      <Solid
        d="M10 22a3 3 0 0 1 3-3h38a3 3 0 0 1 3 3v6a5 5 0 0 0 0 10v6a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3v-6a5 5 0 0 0 0-10z"
        fill={C.ember}
        depth={4}
      />
      {[24, 29.5, 35, 40.5].map((y) => (
        <Rect
          key={y}
          x={39.3}
          y={y}
          width={1.6}
          height={3}
          rx={0.8}
          fill={tint(C.ember)}
        />
      ))}
      <Path d="M15 24h14" {...hiStroke(C.ember, 3)} />
      <Path
        d="M15 30h9"
        stroke={tint(C.ember)}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </>
  ),
  location: () => (
    <>
      <Shadow rx={23} cy={60} />
      <Rect x={7} y={9} width={50} height={50} rx={13} fill={shade(C.pure)} />
      <Rect x={7} y={6} width={50} height={50} rx={13} fill={C.pure} />
      <Rect x={12} y={11} width={40} height={40} rx={9} fill={C.fill} />
      <Ellipse cx={42} cy={40} rx={9} ry={7} fill={C.green} opacity={0.55} />
      <Path d="M12 29h40M26 11v40" stroke={C.pure} strokeWidth={3} />
      <Circle
        cx={33}
        cy={30}
        r={8.5}
        fill={shade(C.ink)}
        transform="translate(0 1.5)"
      />
      <Circle cx={33} cy={30} r={8.5} fill={C.ink} />
      <Circle cx={33} cy={30} r={3} fill={C.pure} />
    </>
  ),
};

export function CategoryArt({
  name,
  size = 40,
}: {
  /** A category label ("Kafé", "Musikk", …) or an art key ("place"). */
  name: string;
  size?: number;
}) {
  const key: ArtKey | undefined =
    (name in ART ? (name as ArtKey) : undefined) ?? CATEGORY_ART[name];
  if (!key) return null;
  const file = artFiles[key];
  if (file) {
    return (
      <Image
        source={file}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessible={false}
      />
    );
  }
  const Art = ART[key];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Art />
    </Svg>
  );
}

/** True when a category label has art (for callers that fall back to Icon). */
export function hasCategoryArt(name: string): boolean {
  return name in ART || name in CATEGORY_ART;
}
