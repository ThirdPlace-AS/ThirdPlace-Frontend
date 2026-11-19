// Illustrations (docs/design/DESIGN_SYSTEM.md §6) — small hand-drawn scenes
// for empty, error and system states. One hand for all of them:
//   · 160 × 120 canvas, ground line at y 104
//   · ink outlines 2.5 px, round caps and joins
//   · flat fills only (surface, surfaceMuted, line) — no gradients
//   · ONE ember accent per scene; success green only for nature
//   · everyday Oslo objects (trikk, café cup, bench paint) instead of
//     generic blobs or faceless people
// Colours come from the theme, so every scene works in light and dark.
// Decorative: the state's title and text carry the meaning.
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";

import { useThemeColors } from "@/theme";

export type IllustrationName =
  | "offline"
  | "error"
  | "maintenance"
  | "update"
  | "emptySaved"
  | "emptyDeck"
  | "emptyPlans";

type Palette = {
  ink: string;
  surface: string;
  muted: string;
  fill: string;
  line: string;
  ember: string;
};

const W = 2.5;
const stroke = (color: string, width = W) =>
  ({
    stroke: color,
    strokeWidth: width,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }) as const;

function Ground({ p }: { p: Palette }) {
  return <Path d="M22 104h104m10 0h6" {...stroke(p.line, 2)} />;
}

/** Offline — a trikk with its pantograph down, under a broken wire. */
function Offline({ p }: { p: Palette }) {
  return (
    <>
      <Path d="M12 22h54m20 0h62" {...stroke(p.muted, 2)} />
      <Path d="M76 52 88 40l-10-6" {...stroke(p.ink)} fill="none" />
      <Rect x={34} y={52} width={92} height={44} rx={10} fill={p.surface} />
      <Rect x={34} y={80} width={92} height={7} fill={p.ember} />
      <Rect
        x={34}
        y={52}
        width={92}
        height={44}
        rx={10}
        fill="none"
        {...stroke(p.ink)}
      />
      {[44, 70, 96].map((x) => (
        <Rect
          key={x}
          x={x}
          y={60}
          width={20}
          height={14}
          rx={3}
          fill={p.fill}
          {...stroke(p.ink, 2)}
        />
      ))}
      <Circle cx={54} cy={99} r={5} fill={p.ink} />
      <Circle cx={106} cy={99} r={5} fill={p.ink} />
      <Ground p={p} />
    </>
  );
}

/** Error — a coffee cup tipped over on its saucer. */
function ErrorScene({ p }: { p: Palette }) {
  return (
    <>
      <Path d="M92 97c10 1 18 4 32 4 8 0 8 4 0 4H88z" fill={p.line} />
      <Circle cx={132} cy={97} r={2} fill={p.line} />
      <Ellipse
        cx={62}
        cy={100}
        rx={38}
        ry={4}
        fill={p.fill}
        {...stroke(p.ink, 2)}
      />
      <Path d="M54 71c0-13 19-14 18-3" fill="none" {...stroke(p.ink)} />
      <Path d="M40 72v22l48 6V64z" fill={p.surface} {...stroke(p.ink)} />
      <Path d="M77 66v31" {...stroke(p.ember, 3)} />
      <Ellipse
        cx={88}
        cy={82}
        rx={6}
        ry={18}
        fill={p.fill}
        {...stroke(p.ink)}
      />
      <Ground p={p} />
    </>
  );
}

/** Maintenance ("Vi pusser opp") — a paint bucket and a roller mid-stroke. */
function Maintenance({ p }: { p: Palette }) {
  return (
    <>
      <Rect
        x={96}
        y={18}
        width={42}
        height={34}
        rx={3}
        fill={p.ember}
        opacity={0.2}
      />
      <Path d="M50 74h30l-4 28H54z" fill={p.surface} {...stroke(p.ink)} />
      <Ellipse
        cx={65}
        cy={74}
        rx={15}
        ry={4}
        fill={p.ember}
        {...stroke(p.ink, 2)}
      />
      <Path d="M50 74c0-14 30-14 30 0" fill="none" {...stroke(p.ink, 2)} />
      <Rect
        x={98}
        y={44}
        width={38}
        height={13}
        rx={6.5}
        fill={p.ember}
        {...stroke(p.ink)}
      />
      <Path d="M117 57v7h-15v20" fill="none" {...stroke(p.ink)} />
      <Rect x={97} y={84} width={10} height={18} rx={4} fill={p.ink} />
      <Ground p={p} />
    </>
  );
}

/** Update — a phone with a fresh arrow. */
function Update({ p }: { p: Palette }) {
  return (
    <>
      <Rect
        x={58}
        y={20}
        width={44}
        height={82}
        rx={9}
        fill={p.surface}
        {...stroke(p.ink)}
      />
      <Rect x={64} y={31} width={32} height={60} rx={3} fill={p.fill} />
      <Path d="M75 26h10" {...stroke(p.ink, 2)} />
      <Circle cx={80} cy={61} r={12} fill={p.ember} />
      <Path d="M80 67V55m-5 5 5-5 5 5" fill="none" {...stroke(p.surface)} />
      <Ground p={p} />
    </>
  );
}

/** Nothing saved yet — a café table, a warm cup, an empty bookmark. */
function EmptySaved({ p }: { p: Palette }) {
  return (
    <>
      <Path
        d="M66 54c-2-3 2-5 0-8m7 8c-2-3 2-5 0-8"
        fill="none"
        {...stroke(p.muted, 2)}
      />
      <Path
        d="M60 60h20v10a7 7 0 0 1-7 7h-6a7 7 0 0 1-7-7z"
        fill={p.surface}
        {...stroke(p.ink)}
      />
      <Path
        d="M80 63h3a3.5 3.5 0 0 1 0 7h-3"
        fill="none"
        {...stroke(p.ink, 2)}
      />
      <Path d="M94 48h18v30l-9-7-9 7z" fill={p.surface} {...stroke(p.ink)} />
      <Path d="M103 48v-6" {...stroke(p.ember, 3)} />
      <Path d="M34 78h92" {...stroke(p.ink, 3)} />
      <Path d="M46 78v24m68-24v24" {...stroke(p.ink)} />
      <Ground p={p} />
    </>
  );
}

/** Seen them all — a fanned stack with a check on top. */
function EmptyDeck({ p }: { p: Palette }) {
  return (
    <>
      <Rect
        x={56}
        y={22}
        width={48}
        height={68}
        rx={8}
        fill={p.fill}
        transform="rotate(-12 80 56)"
        {...stroke(p.ink, 2)}
      />
      <Rect
        x={56}
        y={22}
        width={48}
        height={68}
        rx={8}
        fill={p.fill}
        transform="rotate(9 80 56)"
        {...stroke(p.ink, 2)}
      />
      <Rect
        x={56}
        y={22}
        width={48}
        height={68}
        rx={8}
        fill={p.surface}
        {...stroke(p.ink)}
      />
      <Path d="m69 57 8 8 15-16" fill="none" {...stroke(p.ember, 3.5)} />
      <Ground p={p} />
    </>
  );
}

/** No plans yet — a calendar page with every day still open. */
function EmptyPlans({ p }: { p: Palette }) {
  const days = [60, 73, 86, 99];
  return (
    <>
      <Rect
        x={48}
        y={30}
        width={64}
        height={66}
        rx={8}
        fill={p.surface}
        {...stroke(p.ink)}
      />
      <Path
        d="M48 47v-9a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v9z"
        fill={p.ember}
        {...stroke(p.ink)}
      />
      <Path d="M62 24v12m36-12v12" {...stroke(p.ink, 3)} />
      {[59, 71, 83].map((y) =>
        days.map((x) => (
          <Circle key={`${x}-${y}`} cx={x} cy={y} r={2.5} fill={p.line} />
        )),
      )}
      <Ground p={p} />
    </>
  );
}

const SCENES: Record<
  IllustrationName,
  (props: { p: Palette }) => React.JSX.Element
> = {
  offline: Offline,
  error: ErrorScene,
  maintenance: Maintenance,
  update: Update,
  emptySaved: EmptySaved,
  emptyDeck: EmptyDeck,
  emptyPlans: EmptyPlans,
};

export function Illustration({
  name,
  width = 160,
}: {
  name: IllustrationName;
  /** Rendered width; height keeps the 4:3 canvas. */
  width?: number;
}) {
  const c = useThemeColors();
  const p: Palette = {
    ink: String(c.ink),
    surface: String(c.surface),
    muted: String(c.muted),
    fill: String(c.surfaceMuted),
    line: String(c.line),
    ember: String(c.ember),
  };
  const Scene = SCENES[name];
  return (
    <Svg
      width={width}
      height={(width * 120) / 160}
      viewBox="0 0 160 120"
      fill="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Scene p={p} />
    </Svg>
  );
}
