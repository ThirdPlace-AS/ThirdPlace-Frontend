import { sessionsFor, type MockExperience } from "@/fixtures";
import { clock, shortSessionLabel } from "@/lib/dates";

const WEEKDAY = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

/**
 * When an experience next happens, as a list row says it: the same day word
 * as its page (review 2026-11-18 JR1: the list said "Ons 17:30" while the
 * page said "I dag 17:30"). Today and tomorrow read "I dag 17:30" and
 * "I morgen 09:00" like the page; later this week the short label
 * ("Ons 17:30"); further out the page's dated label ("ons. 26. nov. 09:00").
 */
export function whenLabel(e: MockExperience, now: Date = new Date()): string {
  const start = sessionsFor(e, now, 1)[0]?.start;
  if (!start) return e.when;
  const label = shortSessionLabel(start, now);
  if (label.startsWith("I dag") || label.startsWith("I morgen")) return label;
  const days = (start.getTime() - now.getTime()) / 86_400_000;
  return days < 6 ? `${WEEKDAY[start.getDay()]} ${clock(start)}` : label;
}
