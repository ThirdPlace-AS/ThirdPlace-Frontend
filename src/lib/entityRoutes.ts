import type { Href } from "expo-router";

import type { SheetTarget } from "@/components/map/sheetTypes";
import { chats, experienceById, type NotificationTarget } from "@/fixtures";

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

/** The slug a chat's invite link carries (thirdplace.app/join/<slug>). */
export function chatInviteSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/**
 * What a shared join link opens (Phase 15): the chat whose invite slug it
 * carries, or the experience (the PDF p26 invite page links join/<experience
 * id>). Null when neither exists, so the caller shows "Fant ikke siden".
 */
export function joinHref(slug: string): Href | null {
  const chat = chats.find((c) => chatInviteSlug(c.name) === slug);
  if (chat) return `/chat/${chat.id}` as Href;
  if (experienceById(slug)) return `/experience/${slug}` as Href;
  return null;
}

/**
 * What a notification opens (Varsler, Phase 13): the person, experience,
 * group, place, a place's reviews or a chat it names. The targets are
 * fixture data; resolving them from a real feed is contract-blocked.
 */
export function notificationHref(t: NotificationTarget): Href {
  switch (t.kind) {
    case "person":
      return `/people/${t.id}` as Href;
    case "chat":
      return `/chat/${t.id}` as Href;
    case "reviews":
      return `/place/${t.id}/reviews` as Href;
    case "experience":
      return `/experience/${t.id}` as Href;
    case "place":
      return `/place/${t.id}` as Href;
    case "group":
      return `/group/${t.id}` as Href;
  }
}
