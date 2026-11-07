import { businessById, experienceById, groupById, placeById } from "@/fixtures";

import { AttendeesContent } from "./content/AttendeesContent";
import { BusinessContent } from "./content/BusinessContent";
import { CheckinContent } from "./content/CheckinContent";
import { ExperienceContent } from "./content/ExperienceContent";
import { GroupContent } from "./content/GroupContent";
import { HostContent } from "./content/HostContent";
import { PlaceContent } from "./content/PlaceContent";
import { ReviewsContent } from "./content/ReviewsContent";
import { VerificationContent } from "./content/VerificationContent";
import type { PushFn, SheetTarget } from "./sheetTypes";

// The per-kind detail dispatcher + title resolver for a SheetTarget. Extracted
// from MapDetailSheet so the SAME detail rendering ("as in the map") can be
// reused by the swipe screen's in-place expand — both render DetailContent with
// their own in-sheet push/back stack.

export function titleFor(t: SheetTarget): string {
  switch (t.kind) {
    case "place":
      return placeById(t.id)?.name ?? "Sted";
    case "business":
      return businessById(t.id)?.name ?? "Bedrift";
    case "experience":
      return experienceById(t.id)?.title ?? "Arrangement";
    case "group":
      return groupById(t.id)?.name ?? "Gruppe";
    case "reviews":
      return "Anmeldelser";
    case "attendees":
      return "Deltakere";
    case "host":
      return "Administrer";
    case "checkin":
      return "Innsjekk";
    case "verification":
      return "Verifisering";
  }
}

export function DetailContent({
  target,
  push,
}: {
  target: SheetTarget;
  push: PushFn;
}) {
  switch (target.kind) {
    case "place":
      return <PlaceContent id={target.id} push={push} />;
    case "business":
      return <BusinessContent id={target.id} push={push} />;
    case "experience":
      return <ExperienceContent id={target.id} push={push} />;
    case "reviews":
      return <ReviewsContent id={target.id} />;
    case "attendees":
      return <AttendeesContent id={target.id} />;
    case "host":
      return <HostContent id={target.id} push={push} />;
    case "group":
      return <GroupContent id={target.id} />;
    case "checkin":
      return <CheckinContent id={target.id} />;
    case "verification":
      return <VerificationContent />;
  }
}
