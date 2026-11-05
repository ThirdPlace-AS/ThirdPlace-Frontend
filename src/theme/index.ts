// Typed re-export of the design tokens (see tokens.js and docs/design/DESIGN_SYSTEM.md).
// tokens.js stays CommonJS so tailwind.config.js (Node) can require() it.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tokens = require("./tokens.js") as {
  palette: { light: Record<string, string>; dark: Record<string, string> };
  colors: Record<string, string>;
  radius: Record<string, string>;
  spacing: Record<string, string>;
};

export const palette = tokens.palette;
/** Light hex values (back-compat). Prefer `useThemeColors()` for native colour props. */
export const colors = tokens.colors;
export const radius = tokens.radius;
export const spacing = tokens.spacing;
export default tokens;

// Motion tokens (see motion.ts) — re-exported for `import { motion } from "@/theme"`.
export {
  motion,
  duration,
  spring,
  easing,
  presentation,
  gesture,
} from "./motion";
export { elevation, type ElevationLevel } from "./elevation";
export { iconSize, iconStroke, type IconSize } from "./icons";
export {
  useScheme,
  useThemeColors,
  useSchemePreference,
  setSchemePreference,
  getSchemePreference,
  type Scheme,
  type SchemePreference,
  type ThemeColors,
} from "./scheme";
export { media } from "./media";
