import { isHostedByMe } from "@/fixtures/created";
import {
  OWNED_BUSINESS_IDS,
  businesses,
  experiences,
  type MockExperience,
} from "@/fixtures";

/**
 * The business's own experiences for Arbeidsflate's I dag and Kalender
 * (review 2026-11-18 #18, founder: "at its own places"): those held at, or
 * organised by, a place one of the owned businesses runs, plus what was
 * published in Legg til this session. Before, every non-catalogue
 * experience counted, other hosts' too.
 */
export function ownExperiences(): MockExperience[] {
  const places = new Set(
    businesses
      .filter((b) => OWNED_BUSINESS_IDS.includes(b.id))
      .map((b) => b.placeId),
  );
  return experiences.filter(
    (e) =>
      isHostedByMe(e.id) ||
      (!!e.placeId && places.has(e.placeId)) ||
      (!!e.organizerPlaceId && places.has(e.organizerPlaceId)),
  );
}
