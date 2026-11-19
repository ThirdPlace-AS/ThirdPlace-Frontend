// "Åpent nå" from a place's opening hours, read at the moment it is shown.
// The hours are the Norwegian text the fixtures and Legg til write:
//   "Man–fre 07–18 · Lør–søn 09–17", "Hver dag 10–22", "Tir og tor 18–22",
//   "Tir–tor 16–00" (until midnight), "Fre–lør 16–02" (past midnight),
//   "Man og ons 19–20.30", "Første fredag i måneden 19–22", "Alltid åpent".
// Special hours such as "Stengt 17. mai" close the place on that date.
// `isOpenAt` returns null for text it can't read, so the caller can fall
// back to the place's own `openNow` flag (places made in Legg til).

const DAYS = ["man", "tir", "ons", "tor", "fre", "lør", "søn"]; // Monday first
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

/** 0 = Monday … 6 = Sunday. */
const weekday = (d: Date) => (d.getDay() + 6) % 7;

type DayTest = (d: Date) => boolean;

function dayIndex(word: string): number | null {
  const i = DAYS.indexOf(word.trim().slice(0, 3));
  return i < 0 ? null : i;
}

function readDays(text: string): DayTest | null {
  const t = text.trim().toLowerCase();
  if (t === "hver dag" || t === "daglig") return () => true;
  // "Første fredag i måneden": that weekday, in the month's first seven days.
  const first = /^første (\p{L}+) i måneden$/u.exec(t);
  if (first) {
    const day = dayIndex(first[1]!);
    if (day === null) return null;
    return (d) => weekday(d) === day && d.getDate() <= 7;
  }
  const days = new Set<number>();
  for (const part of t.split(/\s+og\s+|,\s*/)) {
    const range = part.split(/\s*[–-]\s*/);
    if (range.length === 1) {
      const day = dayIndex(range[0]!);
      if (day === null) return null;
      days.add(day);
    } else if (range.length === 2) {
      const from = dayIndex(range[0]!);
      const to = dayIndex(range[1]!);
      if (from === null || to === null) return null;
      for (let i = from; ; i = (i + 1) % 7) {
        days.add(i);
        if (i === to) break;
      }
    } else return null;
  }
  return days.size > 0 ? (d) => days.has(weekday(d)) : null;
}

/** "07", "19.30", "19:30" → minutes after midnight. */
function readTime(text: string): number | null {
  const m = /^(\d{1,2})(?:[.:](\d{2}))?$/.exec(text);
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  return h <= 24 && min < 60 ? h * 60 + min : null;
}

type Span = { days: DayTest; start: number; end: number };

function readSpan(text: string): Span | null {
  const m =
    /^(.+?)\s+(\d{1,2}(?:[.:]\d{2})?)\s*[–-]\s*(\d{1,2}(?:[.:]\d{2})?)$/.exec(
      text.trim(),
    );
  if (!m) return null;
  const days = readDays(m[1]!);
  const start = readTime(m[2]!);
  const end = readTime(m[3]!);
  if (!days || start === null || end === null) return null;
  // "16–00" runs to midnight; "16–02" runs past it into the next day.
  return { days, start, end: end === 0 ? 24 * 60 : end };
}

// Each hours text is read once (speed pass 0347): the map's list asks for
// every place's open state on each filter, mode or origin change, and the
// parse (regexes, day sets) was most of that cost. Only the parse is kept;
// the open state is still worked out for the moment asked.
type Parsed = "always" | readonly Span[] | null;
const parsedHours = new Map<string, Parsed>();

function parseHours(hours: string): Parsed {
  const hit = parsedHours.get(hours);
  if (hit !== undefined) return hit;
  let parsed: Parsed;
  const text = hours.trim();
  if (/^alltid åpen/i.test(text)) parsed = "always";
  else if (text === "") parsed = null;
  else {
    const spans: Span[] = [];
    for (const part of text.split("·")) {
      const span = readSpan(part);
      if (!span) {
        spans.length = 0;
        break;
      }
      spans.push(span);
    }
    parsed = spans.length > 0 ? spans : null;
  }
  // Hours texts are few (one per place, plus Legg til's); a runaway list of
  // new ones only empties the cache.
  if (parsedHours.size > 2000) parsedHours.clear();
  parsedHours.set(hours, parsed);
  return parsed;
}

export function isOpenAt(hours: string, now: Date): boolean | null {
  const parsed = parseHours(hours);
  if (parsed === "always") return true;
  if (parsed === null) return null;
  const spans = parsed;
  const minute = now.getHours() * 60 + now.getMinutes();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return spans.some(({ days, start, end }) => {
    if (end > start) return days(now) && minute >= start && minute < end;
    // Past midnight: open from `start` today, or until `end` after a day
    // that opened.
    return (days(now) && minute >= start) || (days(yesterday) && minute < end);
  });
}

/** "Stengt 17. mai" (several may be listed with "·") closes that date. */
export function closedBySpecialHours(special: string, now: Date): boolean {
  for (const m of special.matchAll(/stengt\s+(\d{1,2})\.\s*(\p{L}+)/giu)) {
    const month = MONTHS.indexOf(m[2]!.toLowerCase());
    if (month === now.getMonth() && Number(m[1]) === now.getDate()) return true;
  }
  return false;
}

/** Whether a place is open now, from its hours; `openNow` only when the
 *  hours can't be read. */
export function isPlaceOpen(
  p: { hours: string; specialHours?: string; openNow: boolean },
  now: Date = new Date(),
): boolean {
  const open = isOpenAt(p.hours, now);
  if (open === null) return p.openNow;
  if (open && p.specialHours && closedBySpecialHours(p.specialHours, now))
    return false;
  return open;
}
