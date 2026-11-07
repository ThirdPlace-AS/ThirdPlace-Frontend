// Pure helpers for the experience page (Phase 11 G5). Everything is derived
// from existing fixture fields — no rating, reviews, itinerary or other data
// the fixtures do not have (BLOCKED_CONTRACT_GAP).
import {
  OSLO_AREAS,
  experiences,
  people,
  type ExperienceStatus,
  type MockExperience,
  type MockPerson,
} from "@/fixtures";

export const STATUS_META: Record<
  ExperienceStatus,
  { label: string; className: string }
> = {
  open: { label: "Åpen", className: "bg-success" },
  waitlist: { label: "Venteliste", className: "bg-warning" },
  full: { label: "Fullt", className: "bg-muted" },
  joined: { label: "Påmeldt", className: "bg-emberStrong" },
  cancelled: { label: "Avlyst", className: "bg-danger" },
};

/** The fixture person who hosts this experience (linked by id, never by name). */
export function hostPerson(
  exp: Pick<MockExperience, "id">,
): MockPerson | undefined {
  return people.find((p) => p.hostsExperienceId === exp.id);
}

const dist2 = (a: [number, number], b: [number, number]) =>
  (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

/** Nearest named Oslo area to a coordinate. */
export function areaFor(coord: [number, number]): string {
  let best = OSLO_AREAS[0];
  for (const a of OSLO_AREAS) {
    if (!best || dist2(a.coord, coord) < dist2(best.coord, coord)) best = a;
  }
  return best?.name ?? "Oslo";
}

/** Small caption for the page top bar: "Sosialt · Grünerløkka". */
export function experienceCaption(exp: MockExperience): string {
  return `${exp.category} · ${areaFor(exp.meetingPoint.coord)}`;
}

/** Other experiences to suggest, nearest meeting point first (cancelled ones
 *  left out). */
export function moreExperiences(exp: MockExperience, n = 6): MockExperience[] {
  const here = exp.meetingPoint.coord;
  return experiences
    .filter((e) => e.id !== exp.id && e.status !== "cancelled")
    .map((e) => ({ e, d: dist2(e.meetingPoint.coord, here) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.e);
}
