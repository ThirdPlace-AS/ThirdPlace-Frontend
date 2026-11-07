// Norwegian date labels for experience sessions (Phase 12 H4b). Pure and
// deterministic (no Intl dependency on Hermes): pass `now` to compare days.

const DAYS = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
];
const MONTHS = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];
const MONTHS_SHORT = [
  "jan.",
  "feb.",
  "mars",
  "apr.",
  "mai",
  "juni",
  "juli",
  "aug.",
  "sep.",
  "okt.",
  "nov.",
  "des.",
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const two = (n: number) => String(n).padStart(2, "0");

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** "09:00" */
export function clock(d: Date): string {
  return `${two(d.getHours())}:${two(d.getMinutes())}`;
}

/** "09:00–10:00" */
export function timeRange(start: Date, end: Date): string {
  return `${clock(start)}–${clock(end)}`;
}

/** "I dag, 6. november" / "I morgen, 7. november" / "Onsdag 11. november". */
export function dayLabel(d: Date, now: Date): string {
  const date = `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
  if (sameDay(d, now)) return `I dag, ${date}`;
  if (sameDay(d, addDays(now, 1))) return `I morgen, ${date}`;
  return `${cap(DAYS[d.getDay()] ?? "")} ${date}`;
}

/** Compact, for the join card: "I dag 11:00" / "I morgen 19:00" / "ons. 11. nov. 09:00". */
export function shortSessionLabel(d: Date, now: Date): string {
  if (sameDay(d, now)) return `I dag ${clock(d)}`;
  if (sameDay(d, addDays(now, 1))) return `I morgen ${clock(d)}`;
  const day = (DAYS[d.getDay()] ?? "").slice(0, 3);
  return `${day}. ${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]} ${clock(d)}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Countdown for a plan (Phase 16, after the section benchmark): "I kveld"
 *  (today from 17:00), "I dag", "I morgen", "Om 3 dager". Null once it has
 *  started. Calendar days, so 23:00 tonight → 08:00 tomorrow is "I morgen". */
export function countdownLabel(start: Date, now: Date): string | null {
  if (start.getTime() <= now.getTime()) return null;
  const days = Math.round(
    (startOfDay(start).getTime() - startOfDay(now).getTime()) / 86_400_000,
  );
  if (days === 0) return start.getHours() >= 17 ? "I kveld" : "I dag";
  if (days === 1) return "I morgen";
  return `Om ${days} dager`;
}

// ── Month view (Phase 18, Mine planer) ──

/** "2026-11-12" in local time. */
export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}

/** "November 2026". */
export function monthTitle(d: Date): string {
  return `${cap(MONTHS[d.getMonth()] ?? "")} ${d.getFullYear()}`;
}

/** "12. november" (read out for a day in the month view). */
export function dayMonthLabel(d: Date): string {
  return `${d.getDate()}. ${MONTHS[d.getMonth()] ?? ""}`;
}

/** The weeks of the month of `d`, Monday first; null pads the edges. */
export function monthWeeks(d: Date): (Date | null)[][] {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday = 0
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let i = 1; i <= days; i++)
    cells.push(new Date(d.getFullYear(), d.getMonth(), i));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** "12. nov" for a "yyyy-mm-dd" day (Filtre's chips). */
export function shortDayMonth(iso: string): string {
  const [, m, day] = iso.split("-").map(Number);
  // As Filtre writes it ("12. nov"), without the abbreviation dot.
  return `${day ?? ""}. ${(MONTHS_SHORT[(m ?? 1) - 1] ?? "").replace(/.$/, "")}`;
}
