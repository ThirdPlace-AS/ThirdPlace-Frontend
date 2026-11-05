import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { markerId } from "@/components/map/types/mapPresentation";
import {
  applyAction,
  applyUndo,
  canUndo,
  decideCommit,
  initialDeck,
  rotationFor,
} from "@/components/swipe/deckLogic";
import { useSwipeDeck } from "@/components/swipe/useSwipeDeck";

const T = { commitRatio: 0.28, vertCommitRatio: 0.22, velocity: 800 };
const base = { dx: 0, dy: 0, vx: 0, vy: 0, w: 300, h: 480 };

describe("decideCommit", () => {
  it("commits on distance past 0.28×width", () => {
    expect(decideCommit({ ...base, dx: 100 }, T)).toBe("like"); // 100 > 84
    expect(decideCommit({ ...base, dx: -100 }, T)).toBe("nope");
  });

  it("commits on fast flick regardless of distance", () => {
    expect(decideCommit({ ...base, dx: 10, vx: 1000 }, T)).toBe("like");
    expect(decideCommit({ ...base, dx: -10, vx: -1000 }, T)).toBe("nope");
  });

  it("springs back below threshold (null)", () => {
    expect(decideCommit({ ...base, dx: 50, vx: 100 }, T)).toBeNull();
  });

  it("up-swipe saves when dominantly vertical", () => {
    expect(decideCommit({ ...base, dy: -150 }, T)).toBe("save"); // 150 > 105.6
    expect(decideCommit({ ...base, vy: -1000 }, T)).toBe("save");
  });

  it("a diagonal fling reads as horizontal, not save", () => {
    expect(decideCommit({ ...base, dx: 200, dy: -150 }, T)).toBe("like");
  });
});

describe("rotationFor", () => {
  it("scales with dx and clamps to ±maxDeg", () => {
    expect(rotationFor(300, 300, 14)).toBeCloseTo(14);
    expect(rotationFor(900, 300, 14)).toBeCloseTo(14); // clamped
    expect(rotationFor(-900, 300, 14)).toBeCloseTo(-14);
    expect(rotationFor(100, 0, 14)).toBe(0); // guard divide-by-zero
  });
});

describe("deck reducer (one-level undo)", () => {
  it("advances on action and tracks the last step", () => {
    expect(canUndo(initialDeck)).toBe(false);
    const s = applyAction(initialDeck, "like");
    expect(s.index).toBe(1);
    expect(canUndo(s)).toBe(true);
    expect(s.last).toEqual({ index: 0, action: "like" });
  });

  it("undo restores the last card and clears history (one level only)", () => {
    const s = applyAction(initialDeck, "nope");
    const u = applyUndo(s);
    expect(u.index).toBe(0);
    expect(canUndo(u)).toBe(false);
    expect(applyUndo(u)).toEqual(u); // no-op second time
  });
});

describe("useSwipeDeck save wiring", () => {
  it("save marks the shared store; undo reverses it", () => {
    const { result } = renderHook(() => useSwipeDeck());
    const first = result.current.current!;
    const key = markerId("experience", first.id);

    expect(result.current.isSaved(key)).toBe(false);
    act(() => result.current.commit("save"));
    expect(result.current.isSaved(key)).toBe(true);
    expect(result.current.index).toBe(1);

    act(() => result.current.undo());
    expect(result.current.index).toBe(0);
    expect(result.current.isSaved(key)).toBe(false);
  });

  it("undo keeps an item that was already saved before the swipe", () => {
    const saved = renderHook(() => useMapSaved());
    const { result } = renderHook(() => useSwipeDeck());
    const first = result.current.current!;
    const key = markerId("experience", first.id);

    // Saved earlier (e.g. from the map detail).
    act(() => saved.result.current.toggle(key));
    expect(result.current.isSaved(key)).toBe(true);

    act(() => result.current.commit("save"));
    act(() => result.current.undo());
    expect(result.current.index).toBe(0);
    expect(result.current.isSaved(key)).toBe(true);

    act(() => saved.result.current.toggle(key)); // clean the shared store
  });
});
