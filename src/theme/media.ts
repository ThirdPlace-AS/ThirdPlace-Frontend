// Media palette (docs/design/DESIGN_SYSTEM.md §3) — colours for UI that sits
// ON photos/video (swipe deck, photo viewer, full-bleed cards). Deliberately
// scheme-independent: a dark glass button over a photo looks the same in light
// and dark mode. Use these instead of rgba()/hex literals in media surfaces.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { palette } = require("./tokens.js") as {
  palette: { light: { ink: string; ember: string } };
};

export const media = {
  /** Solid dark base behind media (expanded card, photo viewer). */
  base: "#141618",
  /** Sveip's deck and the card's solid foot under the action row (measured
   *  on the reference, 2026-11-18). */
  deck: "#0E0F12",
  /** Photo placeholder while an image loads. */
  placeholder: "#3A3A3A",
  /** Dark sheet floating over media. */
  sheet: "rgba(14,16,18,0.96)",
  /** Translucent dark glass control (resting / pressed). */
  glass: "rgba(20,22,24,0.55)",
  glassPressed: "rgba(20,22,24,0.72)",
  /** Opaque action disc on the swipe card's dark footer (resting / pressed). */
  disc: "#2A2C2F",
  discPressed: "#36393D",
  /** Black scrims for legibility over photos. */
  scrimSoft: "rgba(0,0,0,0.35)",
  scrim: "rgba(0,0,0,0.5)",
  scrimStrong: "rgba(0,0,0,0.6)",
  /** Text shadow for labels over photos. */
  textShadow: "rgba(0,0,0,0.45)",
  /** Light fills/hairlines over dark media. */
  fillSubtle: "rgba(255,255,255,0.12)",
  hairline: "rgba(255,255,255,0.12)",
  hairlineStrong: "rgba(255,255,255,0.25)",
  /** Light surface over media (e.g. a committed "save" disc). */
  surface: "rgba(255,255,255,0.92)",
  /** Content over media. */
  onMedia: "#FFFFFF",
  onMediaMuted: "rgba(255,255,255,0.4)",
  /** A glyph that can't be used right now (Sveip's rewind with nothing to
   *  undo): ~#716A6C on the disc, as measured on the reference. */
  onMediaDisabled: "rgba(255,255,255,0.3)",
  /** Dark glyph when the control sits on a light fill. */
  inkOnLight: palette.light.ink,
  /** Brand ember (like/join) — same in every scheme. */
  ember: palette.light.ember,
  /** Flash overlays (swipe commit wash). */
  black: "#000000",
  white: "#FFFFFF",
  /** Swipe card foot: the photo fades into `deck`, which then stays solid
   *  down behind the action row (the shadow is the card's, not a panel's). */
  gradientFoot: [
    "rgba(14,15,18,0)",
    "rgba(14,15,18,0.3)",
    "rgba(14,15,18,0.7)",
    "#0E0F12",
    "#0E0F12",
  ] as const,
} as const;

/** How much of the photo's brightness the head band keeps (the reference
 *  measured 0.56–0.63 per channel on three photos, 2026-11-18; lightened to
 *  0.78 at the user's word, 2026-11-21, so more of the photo shows). */
const HEAD_BAND_KEEP = 0.78;

/** Swipe card head band: solid in the shown photo's own colour, darkened,
 *  behind the status bar and the filter bar, then fading into the photo
 *  (user 2026-11-18). `tint` is the photo's top colour (#rrggbb); without one
 *  the band takes the deck colour. Three stops: solid, solid, clear. */
export function headBandColors(
  tint: string | undefined,
): readonly [string, string, string] {
  const m = tint
    ? /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(tint)
    : null;
  const [r, g, b] = m
    ? [m[1], m[2], m[3]].map((h) =>
        Math.round(parseInt(h ?? "0", 16) * HEAD_BAND_KEEP),
      )
    : [14, 15, 18];
  const solid = `rgb(${r},${g},${b})`;
  return [solid, solid, `rgba(${r},${g},${b},0)`] as const;
}
