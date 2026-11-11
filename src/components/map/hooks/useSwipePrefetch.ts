// R28 (Phase 10 open item): the first Sveip visit paid the tab mount and the
// photo decode, so the map pre-renders the Sveip tab in the background
// (react-navigation preload), once per session.
//
// Speed pass (0352): it used to fire 2 s after the map had content, which is
// when people start using the map, and the deck build plus its photo decode
// landed in the middle of that. It now waits until the map has had content
// and nothing changed for QUIET_MS: no detail sheet open, no new pick, no
// mode change (each restarts the wait).
import { router } from "expo-router";
import { useEffect } from "react";

export const SWIPE_PREFETCH_QUIET_MS = 3000;

let prefetched = false;

export function useSwipePrefetch(
  /** The map has content (its mock load succeeded). */
  ready: boolean,
  /** The open detail sheet's marker, if any: no pre-render while it is open. */
  openMarker: string | null,
  /** The discovery mode: a change restarts the wait. */
  mode: string,
) {
  useEffect(() => {
    if (!ready || prefetched || openMarker) return;
    const t = setTimeout(() => {
      prefetched = true;
      router.prefetch("/swipe");
    }, SWIPE_PREFETCH_QUIET_MS);
    return () => clearTimeout(t);
  }, [ready, openMarker, mode]);
}

/** Tests only: allow another pre-render. */
export function resetSwipePrefetch() {
  prefetched = false;
}
