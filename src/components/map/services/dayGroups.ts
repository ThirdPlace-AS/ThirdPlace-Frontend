// The browse list grouped by day once a day or period is picked in Filtre's
// Når (review 2026-11-18 PR-04, option B, user 2026-11-25). Without a picked
// date the list stays nearest first, places and experiences mixed
// (orderItems); no date chips on the map (founder 2026-11-08). Pure.
import { experienceById, sessionsFor } from "@/fixtures";
import { dayHeader, isoDay } from "@/lib/dates";

import type { DiscoveryItem } from "../types/mapPresentation";

export type DayHeaderRow = {
  type: "header";
  key: string;
  title: string;
  subtitle?: string;
};
export type BrowseRow = DayHeaderRow | DiscoveryItem;

export function isHeaderRow(r: BrowseRow): r is DayHeaderRow {
  return (r as DayHeaderRow).type === "header";
}

/** The experience's first time inside the window, else its next time. */
function startIn(
  item: DiscoveryItem,
  window: [Date, Date],
  now: Date,
): Date | null {
  if (item.kind !== "experience") return null;
  const exp = experienceById(item.id);
  if (!exp) return null;
  const sessions = sessionsFor(exp, now, 8);
  const inside = sessions.find(
    (s) => s.start >= window[0] && s.start <= window[1],
  );
  return (inside ?? sessions[0])?.start ?? null;
}

/**
 * Rows for the list: a header per day ("I kveld" · "onsdag 18. nov."), that
 * day's experiences by start time (nearest first on a tie), then the places
 * under "Steder" (they have opening hours, not times). Null window: the items
 * as they are, no headers.
 */
export function groupByDay(
  items: readonly DiscoveryItem[],
  window: [Date, Date] | null,
  now: Date,
  evening = false,
): BrowseRow[] {
  if (!window || items.length === 0) return items as BrowseRow[];
  const days = new Map<string, { day: Date; rows: [DiscoveryItem, Date][] }>();
  const places: DiscoveryItem[] = [];
  for (const item of items) {
    const start = startIn(item, window, now);
    if (!start) {
      places.push(item);
      continue;
    }
    const key = isoDay(start);
    const group = days.get(key) ?? { day: start, rows: [] };
    group.rows.push([item, start]);
    days.set(key, group);
  }
  const rows: BrowseRow[] = [];
  for (const key of [...days.keys()].sort()) {
    const { day, rows: dayRows } = days.get(key)!;
    rows.push({
      type: "header",
      key: `day:${key}`,
      ...dayHeader(day, now, evening),
    });
    dayRows
      .sort(
        ([a, sa], [b, sb]) =>
          sa.getTime() - sb.getTime() ||
          (a.distanceM ?? Infinity) - (b.distanceM ?? Infinity),
      )
      .forEach(([item]) => rows.push(item));
  }
  if (places.length > 0) {
    rows.push({ type: "header", key: "places", title: "Steder" });
    rows.push(...places);
  }
  return rows;
}
