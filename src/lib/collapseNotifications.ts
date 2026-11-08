import type { MockNotification } from "@/fixtures";

// Varsler (Phase 18, screen benchmark: Instagram's "Jonas og 2 andre begynte
// å følge deg"): notices of the same kind in the same list collapse into one
// card. New followers collapse together; people joining collapse per
// experience; everything else stays on its own. The newest notice leads (the
// fixtures run newest first). Pure, and only over the notices given.

export type NotificationEntry = {
  key: string;
  /** Newest first; one item for a card of its own. */
  items: MockNotification[];
};

function collapseKey(n: MockNotification): string {
  if (n.type === "follow") return "follow";
  if (n.type === "join") return `join:${n.target.id}`;
  return n.id;
}

export function collapseNotifications(
  list: readonly MockNotification[],
): NotificationEntry[] {
  const entries: NotificationEntry[] = [];
  const byKey = new Map<string, NotificationEntry>();
  for (const n of list) {
    const key = collapseKey(n);
    const entry = byKey.get(key);
    if (entry) {
      entry.items.push(n);
    } else {
      const next = { key: `${key}:${n.id}`, items: [n] };
      byKey.set(key, next);
      entries.push(next);
    }
  }
  return entries;
}

/** "Erik Haug", or "Erik Haug og 2 andre" for a collapsed card. */
export function entryActor(entry: NotificationEntry): string {
  const first = entry.items[0];
  const others = entry.items.length - 1;
  if (!first) return "";
  if (others === 0) return first.actorName;
  return `${first.actorName} og ${others} ${others === 1 ? "annen" : "andre"}`;
}
