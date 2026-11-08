// Icon sizes (docs/design/DESIGN_SYSTEM.md §3). Outline by default, filled when
// selected/active. Custom glyphs: 24 px grid, 1.75 px stroke, rounded caps/joins.
export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  /** Display glyphs (empty states, hero icons). */
  "2xl": 44,
  "3xl": 64,
} as const;

export type IconSize = keyof typeof iconSize;

export const iconStroke = 1.75;
