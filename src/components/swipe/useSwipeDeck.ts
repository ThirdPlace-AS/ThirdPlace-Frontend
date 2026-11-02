import { useCallback, useMemo, useRef, useState } from "react";

import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { markerId } from "@/components/map/types/mapPresentation";
import { experiences, type MockExperience } from "@/fixtures";

import {
  applyAction,
  applyUndo,
  canUndo,
  initialDeck,
  type SwipeAction,
  type DeckState,
} from "./deckLogic";

// JS-side deck state for the swipe surface (index + one-level undo + save).
// Gesture/animation lives in SwipeDeck; this owns the plain state so it stays
// testable and the shared Saved store ([useMapSaved]) is reused — a swipe-save
// also shows up in the map's "Lagret" mode. DEMO only: resets on reload.
//
// An optional local `filter` narrows which experiences enter the deck (the top
// filter bar — real local demo filtering, no invented ranking). `filterKey` is
// a stable string identity of the filter; when it changes the deck resets to
// the top. Both are optional so the no-arg call (and the tests) are unchanged.
export function useSwipeDeck(opts?: {
  filter?: (e: MockExperience) => boolean;
  filterKey?: string;
}) {
  const filter = opts?.filter;
  const filterKey = opts?.filterKey ?? "";
  // Cancelled experiences never enter the deck; everything else is swipeable,
  // subject to the optional local filter.
  const deck = useMemo<MockExperience[]>(
    () =>
      experiences.filter(
        (e) => e.status !== "cancelled" && (filter ? filter(e) : true),
      ),
    [filter],
  );
  const [state, setState] = useState<DeckState>(initialDeck);
  const { isSaved, toggle } = useMapSaved();

  // Reset to the top of the deck whenever the active filter changes. Done in the
  // render phase (not an effect) — the recommended way to reset state on an
  // input change, and it avoids a cascading re-render.
  const prevFilterKey = useRef(filterKey);
  if (prevFilterKey.current !== filterKey) {
    prevFilterKey.current = filterKey;
    setState(initialDeck);
  }

  const savedKey = (e: MockExperience) => markerId("experience", e.id);

  const commit = useCallback(
    (action: SwipeAction) => {
      const card = deck[state.index];
      if (card && action === "save" && !isSaved(savedKey(card))) {
        toggle(savedKey(card));
      }
      setState((s) => applyAction(s, action));
    },
    [deck, state.index, isSaved, toggle],
  );

  const undo = useCallback(() => {
    setState((s) => {
      if (!s.last) return s;
      // Reverse a save when the undone step was a save.
      const card = deck[s.last.index];
      if (card && s.last.action === "save" && isSaved(savedKey(card))) {
        toggle(savedKey(card));
      }
      return applyUndo(s);
    });
  }, [deck, isSaved, toggle]);

  const restart = useCallback(() => setState(initialDeck), []);

  const done = state.index >= deck.length;
  // Top card + up to two peeking behind it (top-3 stack).
  const window = deck.slice(state.index, state.index + 3);

  return {
    deck,
    index: state.index,
    done,
    window,
    current: deck[state.index] ?? null,
    savedKeyFor: savedKey,
    isSaved,
    canUndo: canUndo(state),
    lastAction: state.last?.action ?? null,
    commit,
    undo,
    restart,
  };
}
