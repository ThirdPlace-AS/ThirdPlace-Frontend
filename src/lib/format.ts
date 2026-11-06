// Number formatting for display (nb-NO style: decimal comma). Founder
// decision 2026-11-06: ratings and distances read "4,8" and "1,1 km", not
// "4.8". Deterministic on purpose (no Intl dependency on Hermes); the design
// guard keeps `toFixed(` in this file only.

/** 4.8 → "4,8"; digits defaults to 1. */
export function formatDecimal(n: number, digits = 1): string {
  return n.toFixed(digits).replace(".", ",");
}

/** Star rating with one decimal: 4.75 → "4,8". */
export function formatRating(n: number): string {
  return formatDecimal(n, 1);
}

/** Threshold label for rating filters: 4 → "4", 4.5 → "4,5". */
export function formatThreshold(n: number): string {
  return Number.isInteger(n) ? String(n) : formatDecimal(n, 1);
}
