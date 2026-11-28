import { hostedExperiences } from "@/fixtures/created";
import { whenLabel } from "@/lib/whenLabel";

import type { PublicExperience } from "./PersonProfileBody";

/** What you host, as others see it on your person page («Arrangerer»): the
 *  experiences you published this session and the ones your activity lists
 *  as arranged (review PR-10, 0528). */
export function myHostedPublic(): PublicExperience[] {
  return hostedExperiences().map((e) => ({
    id: e.id,
    title: e.title,
    when: whenLabel(e),
  }));
}
