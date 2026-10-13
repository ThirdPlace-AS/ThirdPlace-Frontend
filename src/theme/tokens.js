// Design tokens — PLACEHOLDER baseline for Phase 0 scaffolding.
//
// These are neutral development placeholders so the styling pipeline
// (NativeWind + Tailwind) is wired and testable. They are NOT the
// authoritative ThirdPlace brand values. The real palette/spacing/scale
// must be extracted from DESIGN/ThirdPlace_All_Screens.pdf (visual reference,
// per master spec §Phase 0) before any UI is treated as design-approved.
//
// CommonJS so tailwind.config.js can require() it; re-exported typed from
// src/theme/index.ts for app code.

/** @type {Record<string, string>} */
const colors = {
  // placeholder neutrals
  ink: "#0B0B0F",
  surface: "#15151C",
  muted: "#6B6B7B",
  line: "#2A2A36",
  // placeholder accent — replace from design system
  accent: "#6C5CE7",
  onAccent: "#FFFFFF",
  // status placeholders
  success: "#2ECC71",
  warning: "#F1C40F",
  danger: "#E74C3C",
};

/** @type {Record<string, string>} */
const radius = {
  none: "0px",
  sm: "6px",
  md: "12px",
  lg: "20px",
  full: "9999px",
};

/** @type {Record<string, string>} */
const spacing = {
  gutter: "16px",
};

module.exports = { colors, radius, spacing };
