// Design tokens — see docs/design/DESIGN_SYSTEM.md (the rulebook).
//
// Palette: Airbnb's colours (founder decision 2026-11-06, replaces the PDF's
// provisional ember #D80000 / ink #202020). Values checked against airbnb.com
// (brand #FF385C, text #222222, link #DA1249, button gradient #E61E4D →
// #E31C5F → #D70466). Dark is Airbnb-style (near-black, white text).
//
// How theming works:
//   - `palette.light` / `palette.dark` hold the hex values per semantic key.
//   - Tailwind colours resolve to `rgb(var(--c-<key>) / <alpha-value>)`, so
//     `bg-surface`, `text-ink`, `bg-danger/15` … follow the active scheme and
//     support opacity modifiers.
//   - The variables are set by `ThemeRoot` (src/theme/ThemeRoot.tsx) via
//     NativeWind `vars()`; global.css carries the light set as a fallback.
//   - `colors` (light hex) stays for back-compat; native colour props should
//     move to `useThemeColors()` as screens are upgraded.
//
// CommonJS so tailwind.config.js can require() it; typed re-export in index.ts.

/** Semantic keys → hex, per scheme. Keep both maps on the same keys. */
const palette = {
  light: {
    background: "#FFFFFF", // app background (Airbnb white)
    surface: "#FFFFFF", // cards / sheets / inputs
    surfaceRaised: "#FFFFFF", // floating controls, sheets over content
    surfaceMuted: "#F7F7F7", // secondary buttons / subtle fills
    line: "#DDDDDD", // borders / dividers
    ink: "#222222", // primary text; ink primary button; selection
    onInk: "#FFFFFF",
    muted: "#6A6A6A", // secondary text / placeholders
    // #FF385C: fills WITHOUT text — hearts, active tab, dots, map selection,
    // logo, FAB glyph discs (white icon on it = 3.5:1, fine for icons only).
    ember: "#FF385C",
    onEmber: "#FFFFFF",
    // Pink fills that carry text (number badges, Live tags): white = 4.6:1.
    emberStrong: "#E31C5F",
    success: "#008A05",
    onSuccess: "#FFFFFF",
    danger: "#C13515",
    // Text on a danger fill (a solid "Stengt" badge): white = 5.5:1.
    onDanger: "#FFFFFF",
    warning: "#B05008",
    scrim: "#000000", // use with an opacity modifier, e.g. bg-scrim/40
    onMedia: "#FFFFFF", // content over photos/video (with a scrim), any scheme
    // Status colours as TEXT on surfaces (fills keep the base keys above).
    emberText: "#DA1249", // Airbnb's link pink
    successText: "#008A05",
    dangerText: "#C13515",
    warningText: "#B05008",
  },
  dark: {
    background: "#121212",
    surface: "#1E1E1E",
    surfaceRaised: "#262626",
    surfaceMuted: "#2E2E2E",
    line: "#3A3A3A",
    ink: "#FFFFFF",
    onInk: "#222222",
    muted: "#B0B0B0",
    ember: "#FF385C",
    onEmber: "#FFFFFF",
    emberStrong: "#E31C5F",
    success: "#008A05",
    onSuccess: "#FFFFFF",
    danger: "#C13515",
    onDanger: "#FFFFFF",
    warning: "#B05008",
    scrim: "#000000",
    onMedia: "#FFFFFF",
    // Brighter on dark surfaces so text stays AA (fills keep the base keys).
    emberText: "#FF6B85",
    successText: "#4CC665",
    dangerText: "#FF8A80",
    warningText: "#F3A35E",
  },
};

/**
 * Map art. Pin fills by pin group (user 2026-11-11: "familiar map colours",
 * like Apple and Google Maps; supersedes Phase 12 H3b's category colours):
 * what a pin is, a place by its kind and an experience by its activity
 * (src/components/map/services/pinGroup.ts). Tested for glyph contrast and
 * for colour-vision deficiencies; the same in light and dark. Never pink or
 * red, which mark the selected pin. `pinShadow`: the soft edge under every
 * pin. `label*`: pin titles, light on dusk/night maps.
 */
const mapPalette = {
  eat: "#E8590C",
  night: "#7048E8",
  social: "#FAB005",
  nature: "#2F9E44",
  water: "#1971C2",
  sport: "#4DABF7",
  culture: "#9C36B5",
  wellness: "#0C8599",
  pinShadow: "#000000",
  labelLight: "#F7F7F7",
  labelHaloDark: "#121212",
  // Terreng (hill shading + contour lines over the Standard style).
  hillShadow: "#4A3D30",
  hillHighlight: "#FFFFFF",
  hillAccent: "#6B5A48",
  contour: "#A0825F",
  contourLabel: "#6E5840",
  contourLabelNight: "#E8DCCB",
};

/** Airbnb's primary-button gradient (left → right). White text passes AA
 * on every stop. Used by Button variant "ember" (expo-linear-gradient). */
const brandGradient = ["#E61E4D", "#E31C5F", "#D70466"];

/** "#RRGGBB" → "R G B" (space-separated channels for rgb(var() / alpha)). */
function channels(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** camelCase → kebab-case for CSS variable names. */
function kebab(key) {
  return key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

/** CSS variable name for a semantic colour key, e.g. surfaceMuted → --c-surface-muted. */
function cssVar(key) {
  return `--c-${kebab(key)}`;
}

/** Map of CSS variables for one scheme, ready for NativeWind `vars()`. */
function cssVars(scheme) {
  const map = palette[scheme];
  /** @type {Record<string, string>} */
  const out = {};
  for (const key of Object.keys(map)) out[cssVar(key)] = channels(map[key]);
  return out;
}

/** Tailwind colour config: every key reads its CSS variable. */
const themeColors = Object.fromEntries(
  Object.keys(palette.light).map((key) => [
    key,
    `rgb(var(${cssVar(key)}) / <alpha-value>)`,
  ]),
);

/** Back-compat: light hex values for native colour props. */
const colors = palette.light;

/** Corner radius. Cards lg · inputs md · sheet tops 2xl · buttons/chips full. */
const radius = {
  none: "0px",
  xs: "6px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "28px",
  full: "9999px",
};

/** Named spacing (Tailwind's numeric scale stays available alongside). */
const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  gutter: "16px", // screen side padding
  lg: "20px",
  xl: "24px",
  section: "32px",
};

/** Type scale: [size, { lineHeight, letterSpacing? }] — Tailwind fontSize form. */
const fontSize = {
  display: ["30px", { lineHeight: "36px" }],
  h1: ["24px", { lineHeight: "30px" }],
  h2: ["20px", { lineHeight: "26px" }],
  title: ["17px", { lineHeight: "22px" }],
  body: ["16px", { lineHeight: "22px" }],
  label: ["15px", { lineHeight: "20px" }],
  caption: ["13px", { lineHeight: "18px" }],
  micro: ["11px", { lineHeight: "14px", letterSpacing: "0.4px" }],
};

/** DM Sans family name per weight (loaded in app/_layout via src/theme/fonts.ts). */
const fontFamily = {
  regular: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semibold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
};

module.exports = {
  palette,
  brandGradient,
  mapPalette,
  fontFamily,
  colors,
  themeColors,
  cssVars,
  cssVar,
  channels,
  radius,
  spacing,
  fontSize,
};
