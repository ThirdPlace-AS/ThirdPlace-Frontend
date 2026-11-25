import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { markerId } from "@/components/map/types/mapPresentation";
import { experiences } from "@/fixtures";

import {
  applyAction,
  applyUndo,
  canUndo,
  initialDeck,
  type SwipeAction,
  type DeckState,
} from "./deckLogic";
import { experienceToDeckItem, type DeckItem } from "./deckItems";

const ALL_EXPERIENCES = (): DeckItem[] =>
  experiences.filter((e) => e.status !== "cancelled").map(experienceToDeckItem);

// JS-side deck state for the swipe surface (index + one-level undo + save).
// Gesture/animation lives in SwipeDeck; this owns the plain state so it stays
// testable and the shared Saved store ([useMapSaved]) is reused — a swipe-save
// also shows up in the map's "Lagret" mode. DEMO only: resets on reload.
//
// The deck runs over DeckItems (Phase 12 H5d): experiences or places, already
// filtered by the caller. `filterKey` is a stable identity of the tab +
// filters; when it changes the deck resets to the top. Both are optional, so
// the no-arg call (and the tests) get every experience that is not cancelled.
export function useSwipeDeck(opts?: {
  items?: DeckItem[];
  filterKey?: string;
}) {
  const filterKey = opts?.filterKey ?? "";
  const given = opts?.items;
  const deck = useMemo<DeckItem[]>(() => given ?? ALL_EXPERIENCES(), [given]);
  const [state, setState] = useState<DeckState>(initialDeck);
  // The deck's latest state, written the moment it changes (before React has
  // rendered it). A second swipe that lands before the render reads this, so it
  // acts on the right card and never on the one that has just gone.
  const stateRef = useRef<DeckState>(initialDeck);
  const set = useCallback((next: (s: DeckState) => DeckState) => {
    stateRef.current = next(stateRef.current);
    setState(stateRef.current);
  }, []);
  const { isSaved, toggle } = useMapSaved();

  // Reset to the top of the deck whenever the tab or filters change. Done in
  // the render phase (not an effect) — the recommended way to reset state on
  // an input change, and it avoids a cascading re-render.
  const prevFilterKey = useRef(filterKey);
  if (prevFilterKey.current !== filterKey) {
    prevFilterKey.current = filterKey;
    setState(initialDeck);
  }

  // The ref follows the reset once it has rendered.
  useLayoutEffect(() => {
    stateRef.current = initialDeck;
  }, [filterKey]);

  const savedKey = (i: DeckItem) => markerId(i.kind, i.id);

  // Whether the last committed swipe actually added to Saved. Undo only removes
  // what this swipe added — an item saved earlier (e.g. from the map) stays.
  const lastAddedSave = useRef(false);

  const commit = useCallback(
    (action: SwipeAction) => {
      const card = deck[stateRef.current.index];
      lastAddedSave.current = false;
      // Save = swipe up / bookmark. A like on a place also saves it (founder
      // 2026-11-06: place ♥ = save + join the place's chat).
      const saves =
        action === "save" || (action === "like" && card?.kind === "place");
      if (card && saves && !isSaved(savedKey(card))) {
        toggle(savedKey(card));
        lastAddedSave.current = true;
      }
      set((s) => applyAction(s, action));
    },
    [deck, set, isSaved, toggle],
  );

  const undo = useCallback(() => {
    const last = stateRef.current.last;
    if (!last) return;
    // Side effects stay outside the state updater (updaters may be replayed).
    const card = deck[last.index];
    if (card && lastAddedSave.current) {
      if (isSaved(savedKey(card))) toggle(savedKey(card));
    }
    lastAddedSave.current = false;
    set(applyUndo);
  }, [deck, set, isSaved, toggle]);

  const restart = useCallback(() => set(() => initialDeck), [set]);

  // The card on top and the position right now, ahead of the render.
  const getCurrent = useCallback(
    () => deck[stateRef.current.index] ?? null,
    [deck],
  );
  const getIndex = useCallback(() => stateRef.current.index, []);
  const getLastAction = useCallback(
    () => stateRef.current.last?.action ?? null,
    [],
  );

  const done = state.index >= deck.length;
  // Top card + up to two peeking behind it (top-3 stack).
  const window = deck.slice(state.index, state.index + 3);

  return {
    deck,
    index: state.index,
    done,
    window,
    current: deck[state.index] ?? null,
    getCurrent,
    getIndex,
    getLastAction,
    savedKeyFor: savedKey,
    isSaved,
    canUndo: canUndo(state),
    lastAction: state.last?.action ?? null,
    commit,
    undo,
    restart,
  };
}
