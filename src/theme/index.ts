// Typed re-export of the placeholder design tokens.
// See tokens.js for the authority note (values are NOT brand-final).
// tokens.js stays CommonJS so tailwind.config.js (Node) can require() it.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tokens = require("./tokens.js") as {
  colors: Record<string, string>;
  radius: Record<string, string>;
  spacing: Record<string, string>;
};

export const colors = tokens.colors;
export const radius = tokens.radius;
export const spacing = tokens.spacing;
export default tokens;
