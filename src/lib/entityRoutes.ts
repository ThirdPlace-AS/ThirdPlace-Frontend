import type { Href } from "expo-router";

import type { SheetTarget } from "@/components/map/sheetTypes";

// Full entities are pages (Phase 12 H4c, user 2026-11-06: "not every page
// needs to be a modal"). A detail target that is a whole place, experience or
// group — or the all-reviews list — maps to its route; short sub-views
// (attendees, check-in, host tools, business, verification) return null and
// stay in a sheet over the page.
export function routeFor(t: SheetTarget): Href | null {
  switch (t.kind) {
    case "experience":
      return `/experience/${t.id}` as Href;
    case "place":
      return `/place/${t.id}` as Href;
    case "group":
      return `/group/${t.id}` as Href;
    case "reviews":
      // In the map sheet "reviews" lists a place's reviews.
      return `/place/${t.id}/reviews` as Href;
    default:
      return null;
  }
}
