import { useCallback, useMemo } from "react";
import { createStore, useStore } from "zustand";

import { MOCK_NOTIFICATIONS, visibleNotifications } from "@/fixtures";

// Read state of the demo notification inbox (master spec §11 Notification
// Center: read / read-all, unread count). In-memory only, so a reload resets
// it (BLOCKED_CONTRACT_GAP: no inbox backend). Shared so the sheet and every
// bell badge (Kart, Sveip, Chat) agree: reading a notification lowers them.
// Varsler's swipe actions (user 2026-11-27, 0561): Slett removes a notice and
// «Ikke interessert» hides it; both leave the list and the badges.

type State = {
  readIds: ReadonlySet<string>;
  dismissedIds: ReadonlySet<string>;
  notInterestedIds: ReadonlySet<string>;
};

const fixtureReads = (): ReadonlySet<string> =>
  new Set(MOCK_NOTIFICATIONS.filter((n) => n.read).map((n) => n.id));
const initial = (): State => ({
  readIds: fixtureReads(),
  dismissedIds: new Set(),
  notInterestedIds: new Set(),
});
const store = createStore<State>(initial);
const selectReadIds = (s: State) => s.readIds;
const selectDismissed = (s: State) => s.dismissedIds;
const selectNotInterested = (s: State) => s.notInterestedIds;

/** Test helper: back to the fixture's state. */
export function resetNotificationReads() {
  store.setState(initial());
}

const add = (set: ReadonlySet<string>, ids: readonly string[]) =>
  new Set([...set, ...ids]);

export function useNotificationReads() {
  const ids = useStore(store, selectReadIds);
  const dismissedIds = useStore(store, selectDismissed);
  const notInterestedIds = useStore(store, selectNotInterested);
  const items = useMemo(
    () =>
      visibleNotifications(MOCK_NOTIFICATIONS, {
        dismissedIds,
        notInterestedIds,
      }),
    [dismissedIds, notInterestedIds],
  );
  const unread = items.filter((n) => !ids.has(n.id)).length;
  const markRead = useCallback((id: string) => {
    const { readIds } = store.getState();
    if (readIds.has(id)) return;
    store.setState({ readIds: new Set([...readIds, id]) });
  }, []);
  const markAllRead = useCallback(() => {
    store.setState({
      readIds: new Set(MOCK_NOTIFICATIONS.map((n) => n.id)),
    });
  }, []);
  /** Slett: the notices leave the list. */
  const dismiss = useCallback((noticeIds: readonly string[]) => {
    store.setState({
      dismissedIds: add(store.getState().dismissedIds, noticeIds),
    });
  }, []);
  /** «Ikke interessert»: the notices are hidden. */
  const notInterested = useCallback((noticeIds: readonly string[]) => {
    store.setState({
      notInterestedIds: add(store.getState().notInterestedIds, noticeIds),
    });
  }, []);
  return {
    items,
    readIds: ids,
    unread,
    markRead,
    markAllRead,
    dismiss,
    notInterested,
  };
}
