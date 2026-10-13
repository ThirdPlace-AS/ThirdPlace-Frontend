// Design tokens — PROVISIONAL (extracted 2026-10-12), NOT founder-approved.
//
// Values were extracted from DESIGN/ThirdPlace_All_Screens.pdf (the visual screen
// reference, per master spec §Phase 0) by rendering all 28 pages and sampling the
// colour histogram, then confirming usage visually. They are a faithful FIRST
// APPROXIMATION for founder review — see docs/design/DESIGN_TOKENS_PROVISIONAL.md
// and docs/design/tokens-comparison.html. Do NOT treat these as final brand
// values; the design system source (Figma) is the authority once confirmed.
//
// CommonJS so tailwind.config.js can require() it; typed re-export in index.ts.

/** @type {Record<string, string>} */
const colors = {
  // Surfaces (light theme)
  background: "#F8F8F8", // app background
  surface: "#FFFFFF", // cards / sheets / inputs
  surfaceMuted: "#F0F0F0", // secondary buttons / subtle fills
  line: "#E0E0E0", // borders / dividers

  // Text / ink
  ink: "#202020", // primary text; also the "ink" primary button (sign-in/confirm)
  onInk: "#FFFFFF",
  muted: "#6B6B6B", // secondary text / placeholders (WCAG AA ~5:1 on #F8F8F8)

  // Brand — "Ember" red (logo, primary CTAs, inline links)
  ember: "#D80000",
  onEmber: "#FFFFFF",

  // Secondary accent — green (maps / nature / success surfaces)
  success: "#387850",
  onSuccess: "#FFFFFF",

  // Status (LOW confidence — confirm with design source)
  danger: "#B5342B",
  warning: "#B05008",
};

/** @type {Record<string, string>} */
const radius = {
  none: "0px",
  sm: "8px",
  md: "12px", // primary buttons / inputs
  lg: "20px", // cards / logo mark
  full: "9999px", // pill chips
};

/** @type {Record<string, string>} */
const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  gutter: "16px", // screen side padding
  lg: "20px",
  xl: "24px",
};

module.exports = { colors, radius, spacing };
