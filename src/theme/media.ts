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
  /** Photo placeholder while an image loads. */
  placeholder: "#3A3A3A",
  /** Dark sheet floating over media. */
  sheet: "rgba(14,16,18,0.96)",
  /** Translucent dark glass control (resting / pressed). */
  glass: "rgba(20,22,24,0.55)",
  glassPressed: "rgba(20,22,24,0.72)",
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
  /** Dark glyph when the control sits on a light fill. */
  inkOnLight: palette.light.ink,
  /** Brand ember (like/join) — same in every scheme. */
  ember: palette.light.ember,
  /** Flash overlays (swipe commit wash). */
  black: "#000000",
  white: "#FFFFFF",
  /** Gradient stops: top fade (status-bar legibility) and bottom card fade. */
  gradientTop: ["rgba(14,17,19,0.6)", "rgba(14,17,19,0)"] as const,
  gradientBottom: [
    "rgba(10,12,14,0)",
    "rgba(10,12,14,0.16)",
    "rgba(10,12,14,0.3)",
  ] as const,
} as const;
