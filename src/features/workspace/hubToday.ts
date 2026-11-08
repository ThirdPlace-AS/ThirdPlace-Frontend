// "I dag" on the workspace hub (Phase 16, after the section benchmark: Airbnb
// Today for hosts, Meetup's organizer home). Read from the same lists as
// Kalender and Mine listings, so nothing here is a separate number. Pure:
// `now` is injected.
import {
  listingById,
  myListingStates,
  sessionsFor,
  type MockExperience,
} from "@/fixtures";

export type HubToday = {
  /** Today's times, earliest first. */
  today: { exp: MockExperience; start: Date }[];
  /** Experiences with a time in the seven days after today. */
  week: number;
  /** People on the waitlists of your active listings. */
  waiting: number;
};

const DAY = 86_400_000;
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function hubToday(list: readonly MockExperience[], now: Date): HubToday {
  const dayStart = startOfDay(now);
  const tomorrow = dayStart + DAY;
  const weekEnd = dayStart + 8 * DAY;
  const today: HubToday["today"] = [];
  let week = 0;
  for (const exp of list) {
    if (exp.status === "cancelled") continue;
    const starts = sessionsFor(exp, now, 8).map((s) => s.start);
    const todays = starts.find(
      (d) => d.getTime() >= dayStart && d.getTime() < tomorrow,
    );
    if (todays) today.push({ exp, start: todays });
    if (starts.some((d) => d.getTime() >= tomorrow && d.getTime() < weekEnd))
      week += 1;
  }
  today.sort((a, b) => a.start.getTime() - b.start.getTime());
  const waiting = Object.entries(myListingStates)
    .filter(([, state]) => state === "Aktive")
    .reduce((n, [id]) => n + (listingById(id)?.waitlist?.length ?? 0), 0);
  return { today, week, waiting };
}
