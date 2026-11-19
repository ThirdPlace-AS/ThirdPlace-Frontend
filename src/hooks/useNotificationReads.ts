import { useCallback } from "react";
import { createStore, useStore } from "zustand";

import { MOCK_NOTIFICATIONS, visibleNotifications } from "@/fixtures";

// Read state of the demo notification inbox (master spec §11 Notification
// Center: read / read-all, unread count). In-memory only, so a reload resets
// it (BLOCKED_CONTRACT_GAP: no inbox backend). Shared so the sheet and every
// bell badge (Kart, Sveip, Chat) agree: reading a notification lowers them.

const fixtureReads = (): ReadonlySet<string> =>
  new Set(MOCK_NOTIFICATIONS.filter((n) => n.read).map((n) => n.id));
const store = createStore(() => ({ readIds: fixtureReads() }));
const selectReadIds = (s: { readIds: ReadonlySet<string> }) => s.readIds;

const items = visibleNotifications(MOCK_NOTIFICATIONS);

/** Test helper: back to the fixture's read state. */
export function resetNotificationReads() {
  store.setState({ readIds: fixtureReads() });
}

export function useNotificationReads() {
  const ids = useStore(store, selectReadIds);
  const unread = items.filter((n) => !ids.has(n.id)).length;
  const markRead = useCallback((id: string) => {
    const { readIds } = store.getState();
    if (readIds.has(id)) return;
    store.setState({ readIds: new Set([...readIds, id]) });
  }, []);
  const markAllRead = useCallback(() => {
    store.setState({ readIds: new Set(items.map((n) => n.id)) });
  }, []);
  return { items, readIds: ids, unread, markRead, markAllRead };
}
