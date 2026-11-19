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

/** "1 medlem", "34 medlemmer". */
export function membersLabel(n: number): string {
  return n === 1 ? "1 medlem" : `${n} medlemmer`;
}

/** A menu price (minor units plus currency, MASTER_SPEC's venue menus
 *  contract): 5400 → "54 kr", 14950 → "149,50 kr", 109500 → "1 095 kr"
 *  (thousands with a no-break space, so a price never wraps). Only NOK exists
 *  in the fixtures. */
export function formatMoney(m: {
  amountMinor: number;
  currency: "NOK";
}): string {
  const whole = Math.trunc(m.amountMinor / 100);
  const ore = Math.abs(m.amountMinor % 100);
  const NBSP = String.fromCharCode(0xa0);
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return ore === 0
    ? `${grouped} kr`
    : `${grouped},${String(ore).padStart(2, "0")} kr`;
}
