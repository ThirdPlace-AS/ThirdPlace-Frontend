// Orders the workspace calendar's "Kommende" list by start time (fresh-eyes
// review H3: the list read Ons, Søn, Tor, Tir, I morgen, I dag). Fixture times
// are relative labels ("I dag 11:00", "I morgen 19:00", "Tor 19:00"); a weekday
// means its next occurrence after tomorrow. Pure, so `today` is injected.
const WEEKDAYS = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];

/** Minutes from the start of `today` until the labelled start; Infinity if unknown. */
export function minutesAhead(when: string, today: Date): number {
  const m = /^(.*?)\s*(\d{1,2}):(\d{2})$/.exec(when.trim());
  if (!m) return Infinity;
  const day = (m[1] ?? "").toLowerCase();
  const minutes = Number(m[2]) * 60 + Number(m[3]);
  let offset: number;
  if (day === "i dag") offset = 0;
  else if (day === "i morgen") offset = 1;
  else {
    const target = WEEKDAYS.indexOf(day.slice(0, 3));
    if (target < 0) return Infinity;
    offset = (target - today.getDay() + 7) % 7;
    if (offset < 2) offset += 7; // today/tomorrow have their own labels
  }
  return offset * 24 * 60 + minutes;
}

export function byStart<T extends { when: string }>(
  items: readonly T[],
  today: Date = new Date(),
): T[] {
  return [...items].sort(
    (a, b) => minutesAhead(a.when, today) - minutesAhead(b.when, today),
  );
}
