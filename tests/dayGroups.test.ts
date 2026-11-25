// Review 2026-11-18 PR-04 option B (user 2026-11-25): with a day or period
// picked in Filtre's Når the browse list is grouped by day, places last under
// "Steder"; without one it is left as it is (nearest first, mixed).
import { describe, expect, it } from "@jest/globals";

import {
  groupByDay,
  isHeaderRow,
  splitDayRows,
} from "@/components/map/services/dayGroups";
import type { DiscoveryItem } from "@/components/map/types/mapPresentation";
import {
  applyExperienceFilters,
  DEFAULT_FILTERS,
  timeOfDayFor,
} from "@/components/map/services/mapFilters";
import { experiences, sessionsFor } from "@/fixtures";
import { dayHeader, isoDay } from "@/lib/dates";

const now = new Date(2026, 10, 18, 9, 0); // onsdag 18. nov. 2026

function exp(id: string, distanceM = 100): DiscoveryItem {
  return {
    markerId: `experience:${id}`,
    kind: "experience",
    id,
    coord: [10.75, 59.91],
    category: "x",
    title: id,
    subtitle: "",
    distanceM,
  };
}
const place: DiscoveryItem = {
  markerId: "place:p1",
  kind: "place",
  id: "p1",
  coord: [10.75, 59.91],
  category: "x",
  title: "p1",
  subtitle: "",
};

const week: [Date, Date] = [
  new Date(2026, 10, 18),
  new Date(2026, 10, 24, 23, 59, 59),
];

describe("dayHeader", () => {
  it("names today, tonight, tomorrow, then the weekday", () => {
    expect(dayHeader(new Date(2026, 10, 18, 18), now)).toEqual({
      title: "I dag",
      subtitle: "onsdag 18. nov.",
    });
    expect(dayHeader(new Date(2026, 10, 18, 18), now, true).title).toBe(
      "I kveld",
    );
    expect(dayHeader(new Date(2026, 10, 19, 10), now)).toEqual({
      title: "I morgen",
      subtitle: "torsdag 19. nov.",
    });
    expect(dayHeader(new Date(2026, 10, 21, 10), now)).toEqual({
      title: "Lørdag",
      subtitle: "21. nov.",
    });
  });
});

describe("groupByDay", () => {
  const items = [place, ...experiences.slice(0, 6).map((e) => exp(e.id))];

  it("leaves the list alone without a picked date", () => {
    expect(groupByDay(items, null, now)).toBe(items);
  });

  it("puts each experience under the day of its time, places last", () => {
    const rows = groupByDay(items, week, now);
    const headers = rows.filter(isHeaderRow);
    expect(headers.at(-1)?.title).toBe("Steder");
    expect(rows.at(-1)).toBe(place);
    // Every experience row sits under the header of its first time that week.
    let day = "";
    for (const r of rows) {
      if (isHeaderRow(r)) {
        day = r.key;
        continue;
      }
      if (r.kind !== "experience") continue;
      const e = experiences.find((x) => x.id === r.id)!;
      const s = sessionsFor(e, now, 8).find(
        (x) => x.start >= week[0] && x.start <= week[1],
      );
      if (s) expect(day).toBe(`day:${isoDay(s.start)}`);
    }
    // Days run in order.
    const keys = headers
      .filter((h) => h.key.startsWith("day:"))
      .map((h) => h.key);
    expect([...keys].sort()).toEqual(keys);
    // Nothing lost or doubled.
    expect(rows.filter((r) => !isHeaderRow(r))).toHaveLength(items.length);
  });

  it("orders a day by time, nearest first on a tie", () => {
    const e = experiences[0]!;
    const near = exp(e.id, 50);
    const far = { ...exp(e.id, 900), markerId: "experience:copy" };
    const rows = groupByDay([far, near], week, now).filter(
      (r) => !isHeaderRow(r),
    );
    expect(rows).toEqual([near, far]);
  });
});

describe("Når's quick chips filter by real times (0517)", () => {
  it("«I kveld» keeps tonight's experiences, whatever their fixed day label", () => {
    const today = new Date();
    const iso = isoDay(today);
    const kept = applyExperienceFilters(experiences, "", {
      ...DEFAULT_FILTERS,
      time: "I dag",
      dateStart: iso,
      dateEnd: null,
      timeOfDay: ["kveld"],
    });
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59);
    const tonight = experiences.filter(
      (e) =>
        e.status !== "cancelled" &&
        timeOfDayFor(e.when) === "kveld" &&
        sessionsFor(e, today, 8).some(
          (s) => s.start >= start && s.start <= end,
        ),
    );
    expect(tonight.length).toBeGreaterThan(1);
    expect(kept.map((e) => e.id).sort()).toEqual(
      tonight.map((e) => e.id).sort(),
    );
  });
});

describe("splitDayRows (the day shows in the sheet's sticky top section)", () => {
  it("gives the cards in grouped order and each card's day", () => {
    const items = [place, ...experiences.slice(0, 6).map((e) => exp(e.id))];
    const rows = groupByDay(items, week, now);
    const { items: cards, labels } = splitDayRows(rows);
    expect(cards).toEqual(rows.filter((r) => !isHeaderRow(r)));
    expect(labels?.get(place.markerId)).toEqual({
      title: "Steder",
      subtitle: undefined,
    });
    const first = rows[0]!;
    if (isHeaderRow(first))
      expect(labels?.get(cards[0]!.markerId)?.title).toBe(first.title);
  });

  it("has no labels without a picked date", () => {
    const items = [place];
    expect(splitDayRows(groupByDay(items, null, now))).toEqual({
      items,
      labels: null,
    });
  });
});
