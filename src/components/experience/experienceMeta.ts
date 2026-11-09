// Pure helpers for the experience page (Phase 11 G5, Phase 12 H4): host,
// area and nearby experiences, all derived from MOCK fixture fields.
import {
  areaFor as nearestArea,
  experiences,
  personById,
  type MockExperience,
  type MockPerson,
  type MockPlace,
} from "@/fixtures";
import { NEARBY_M, distanceMeters } from "@/lib/distance";

import { experienceTypeLabel, placeTypeLabel } from "../map/services/itemType";

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
  // An Arrangement says so ("Festival · Kolsås", Phase 19).
  const what = exp.format === "event" ? experienceTypeLabel(exp) : exp.category;
  return `${what} · ${areaFor(exp.meetingPoint.coord)}`;
}

/** The same caption for a place: what it is and where ("Bedrift ·
 *  Grünerløkka"; a city space by its own kind, "Klatrefelt · Kolsås",
 *  2026-11-09). The /place page and the map's page sheet both use it. */
export function placeCaption(
  p: Pick<MockPlace, "kind" | "category" | "coord">,
): string {
  return `${placeTypeLabel(p)} · ${areaFor(p.coord)}`;
}

/** Other experiences to suggest, nearest meeting point first, within
 *  NEARBY_M (cancelled ones left out). */
export function moreExperiences(exp: MockExperience, n = 6): MockExperience[] {
  const here = exp.meetingPoint.coord;
  return experiences
    .filter((e) => e.id !== exp.id && e.status !== "cancelled")
    .map((e) => ({ e, d: distanceMeters(e.meetingPoint.coord, here) }))
    .filter((x) => x.d <= NEARBY_M)
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.e);
}
