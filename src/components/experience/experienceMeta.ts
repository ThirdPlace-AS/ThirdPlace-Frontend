// Pure helpers for the experience page (Phase 11 G5, Phase 12 H4): host,
// area and nearby experiences, all derived from MOCK fixture fields.
import {
  areaFor as nearestArea,
  experiences,
  personById,
  type MockExperience,
  type MockPerson,
} from "@/fixtures";
import { distanceMeters } from "@/lib/distance";

/** The fixture person who hosts this experience (`hostId`, never by name).
 *  An Arrangement is hosted by its organiser's contact person. */
export function hostPerson(
  exp: Pick<MockExperience, "hostId">,
): MockPerson | undefined {
  return personById(exp.hostId);
}

/** Name of the nearest named area (Oslo or Akershus) to a coordinate. */
export function areaFor(coord: [number, number]): string {
  return nearestArea(coord).name;
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
    .map((e) => ({ e, d: distanceMeters(e.meetingPoint.coord, here) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.e);
}
