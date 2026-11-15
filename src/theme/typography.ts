// Typography numbers for places that need a raw value. The typeface is Inter
// (src/theme/fonts.ts, one family per weight in tokens.js fontFamily); prefer
// the Text primitive's variants and the text-* classes.

// Mirrors tokens.js fontSize (Tailwind: text-display … text-micro).
export const fontSize = {
  display: 28,
  h1: 22,
  h2: 20,
  title: 16,
  body: 16,
  label: 14,
  caption: 13,
  micro: 11,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;
