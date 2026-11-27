// Varsler's row media (0460, Instagram benchmark 2, user
// 2026-11-17; the type pills were removed 2026-11-26). Pure: who an actor is, and what a row's
// thumbnail shows. MOCK fixtures only (BLOCKED_CONTRACT_GAP: no notification
// feed exists).
import type { ImageSourcePropType } from "react-native";

import {
  experienceById,
  groupById,
  people,
  personById,
  placeById,
  type MockNotification,
  type MockPerson,
  type NotificationType,
} from "@/fixtures";
import { coverForPlace, libImage } from "@/fixtures/images";

/** The person behind a notice, when the actor is one (for their photo). */
export function notificationPerson(
  n: MockNotification,
): MockPerson | undefined {
  if (n.target.kind === "person") {
    const p = personById(n.target.id);
    if (p) return p;
  }
  return people.find((p) => p.name === n.actorName);
}

/** The photo of what a notice names: an experience, place or group. */
export function notificationThumb(
  n: MockNotification,
): ImageSourcePropType | undefined {
  const { kind, id } = n.target;
  if (kind === "experience") return experienceById(id)?.photos[0];
  if (kind === "group") {
    const g = groupById(id);
    return g ? libImage(g.cover) : undefined;
  }
  if (kind === "place" || kind === "reviews") {
    const p = placeById(id);
    return p ? libImage(coverForPlace(p)) : undefined;
  }
  return undefined;
}

// Filtrer (user 2026-11-27, 0561, Instagram's Varsler filter): which kinds of
// notice to show and whether only people the viewer follows. Empty kinds =
// every kind. Screen state only, like the rest of the inbox.
export type NotificationFilter = {
  types: ReadonlySet<NotificationType>;
  onlyFollowing: boolean;
};

export const NO_NOTIFICATION_FILTER: NotificationFilter = {
  types: new Set(),
  onlyFollowing: false,
};

/** Filtrer's Kategorier, in the order they show. */
export const NOTIFICATION_CATEGORIES: {
  type: NotificationType;
  label: string;
}[] = [
  { type: "follow", label: "Følgere" },
  { type: "message", label: "Meldinger" },
  { type: "join", label: "Påmeldinger" },
  { type: "invite", label: "Invitasjoner" },
  { type: "review", label: "Anmeldelser" },
];

export function isNotificationFilterOn(f: NotificationFilter): boolean {
  return f.types.size > 0 || f.onlyFollowing;
}

/** The notices a filter keeps. `followingIds`: people the viewer follows. */
export function applyNotificationFilter(
  items: readonly MockNotification[],
  f: NotificationFilter,
  followingIds: ReadonlySet<string>,
): MockNotification[] {
  return items.filter((n) => {
    if (f.types.size > 0 && !f.types.has(n.type)) return false;
    if (f.onlyFollowing) {
      const p = notificationPerson(n);
      if (!p || !followingIds.has(p.id)) return false;
    }
    return true;
  });
}
