import { useCallback, useSyncExternalStore } from "react";

import { MOCK_NOTIFICATIONS, visibleNotifications } from "@/fixtures";

// Read state of the demo notification inbox (master spec §11 Notification
// Center: read / read-all, unread count). In-memory only, so a reload resets
// it (BLOCKED_CONTRACT_GAP: no inbox backend). Shared so the sheet and every
// bell badge (Kart, Sveip, Chat) agree: reading a notification lowers them.

let readIds: ReadonlySet<string> = new Set(
  MOCK_NOTIFICATIONS.filter((n) => n.read).map((n) => n.id),
);
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const items = visibleNotifications(MOCK_NOTIFICATIONS);

/** Test helper: back to the fixture's read state. */
export function resetNotificationReads() {
  readIds = new Set(MOCK_NOTIFICATIONS.filter((n) => n.read).map((n) => n.id));
  emit();
}

export function useNotificationReads() {
  const ids = useSyncExternalStore(
    subscribe,
    () => readIds,
    () => readIds,
  );
  const unread = items.filter((n) => !ids.has(n.id)).length;
  const markRead = useCallback((id: string) => {
    if (readIds.has(id)) return;
    readIds = new Set([...readIds, id]);
    emit();
  }, []);
  const markAllRead = useCallback(() => {
    readIds = new Set(items.map((n) => n.id));
    emit();
  }, []);
  return { items, readIds: ids, unread, markRead, markAllRead };
}
