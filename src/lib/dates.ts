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
