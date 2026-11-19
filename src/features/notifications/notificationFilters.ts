// Varsler's pills and row media (0460, Instagram benchmark 2, user
// 2026-11-17). Pure: which pills show, who an actor is, and what a row's
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

export type NotificationFilterKey = "all" | NotificationType;

/** The type pills in their order, after "Alle". */
const TYPE_PILLS: { key: NotificationType; label: string }[] = [
  { key: "follow", label: "Følgere" },
  { key: "invite", label: "Invitasjoner" },
  { key: "message", label: "Meldinger" },
  { key: "join", label: "Bli med" },
  { key: "review", label: "Anmeldelser" },
];

/** Alle, then one pill per type with at least one notice (no counts). */
export function notificationPills(
  items: readonly MockNotification[],
): { key: NotificationFilterKey; label: string }[] {
  const types = new Set(items.map((n) => n.type));
  return [
    { key: "all", label: "Alle" },
    ...TYPE_PILLS.filter((p) => types.has(p.key)),
  ];
}

export function filterNotifications(
  items: readonly MockNotification[],
  key: NotificationFilterKey,
): MockNotification[] {
  return key === "all" ? [...items] : items.filter((n) => n.type === key);
}

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
