// The scroll that holds a place or experience page (the map's page sheet or
// the /place and /experience routes), so a link on the page can bring one of
// its own sections into view (Airbnb tap-through 2026-11-26: the rating link
// scrolls to the reviews instead of leaving the page). Without a host (Sveip's
// details) the caller keeps its old link.
import { createContext, useContext } from "react";
import type { View } from "react-native";

export type PageScroller = {
  /** Scrolls the page so `anchor` sits just below the top bar. False when
   *  it cannot (the caller falls back). */
  scrollToAnchor: (anchor: View | null) => boolean;
};

export const PageScrollContext = createContext<PageScroller | null>(null);

export function usePageScroll(): PageScroller | null {
  return useContext(PageScrollContext);
}

/** Space left above a section brought into view. */
export const ANCHOR_GAP = 16;

/**
 * Measures `anchor` inside `box` (a View just inside the scroll content,
 * below `padTop` of padding) and hands the offset that brings it into view to
 * `scrollTo`. Call from an event, never during render.
 */
export function scrollAnchorIn(
  box: View | null,
  anchor: View | null,
  padTop: number,
  scrollTo: (y: number) => void,
): boolean {
  if (!anchor || !box) return false;
  anchor.measureLayout(box, (_x, y) =>
    scrollTo(Math.max(0, y + padTop - ANCHOR_GAP)),
  );
  return true;
}
