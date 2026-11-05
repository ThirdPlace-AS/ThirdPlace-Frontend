// Design tokens — see docs/design/DESIGN_SYSTEM.md (the rulebook).
//
// Palette values are still PROVISIONAL (extracted 2026-10-12 from
// DESIGN/ThirdPlace_All_Screens.pdf; see docs/design/DESIGN_TOKENS_PROVISIONAL.md).
// The dark palette (2026-11-05) is a first proposal awaiting founder sign-off.
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
    background: "#F8F8F8", // app background
    surface: "#FFFFFF", // cards / sheets / inputs
    surfaceRaised: "#FFFFFF", // floating controls, sheets over content
    surfaceMuted: "#F0F0F0", // secondary buttons / subtle fills
    line: "#E0E0E0", // borders / dividers
    ink: "#202020", // primary text; ink primary button; selection
    onInk: "#FFFFFF",
    muted: "#6B6B6B", // secondary text / placeholders
    ember: "#D80000", // brand moments only (heart, acquisition CTA, badges)
    onEmber: "#FFFFFF",
    success: "#387850",
    onSuccess: "#FFFFFF",
    danger: "#B5342B", // LOW confidence
    warning: "#B05008", // LOW confidence
    scrim: "#000000", // use with an opacity modifier, e.g. bg-scrim/40
    onMedia: "#FFFFFF", // content over photos/video (with a scrim), any scheme
    // Status colours as TEXT on surfaces (fills keep the base keys above).
    emberText: "#D80000",
    successText: "#387850",
    dangerText: "#B5342B",
    warningText: "#B05008",
  },
  dark: {
    background: "#111111",
    surface: "#1B1B1B",
    surfaceRaised: "#242424",
    surfaceMuted: "#2A2A2A",
    line: "#353535",
    ink: "#F2F2F2",
    onInk: "#161616",
    muted: "#A3A3A3",
    ember: "#D80000", // brand fill unchanged; white-on-ember stays AA
    onEmber: "#FFFFFF",
    success: "#387850",
    onSuccess: "#FFFFFF",
    danger: "#B5342B",
    warning: "#B05008",
    scrim: "#000000",
    onMedia: "#FFFFFF",
    // Brighter on dark surfaces so text stays AA (fills keep the base keys).
    emberText: "#FF6B61",
    successText: "#6CC28C",
    dangerText: "#FF8A80",
    warningText: "#F3A35E",
  },
};

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
