import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { markerId } from "@/components/map/types/mapPresentation";
import {
  applyAction,
  applyUndo,
  canUndo,
  buttonProgress,
  decideCommit,
  flyDuration,
  initialDeck,
  nextCardScale,
  rotationFor,
  saveButtonProgress,
  stampOpacity,
  upDragLeads,
} from "@/components/swipe/deckLogic";
import { useSwipeDeck } from "@/components/swipe/useSwipeDeck";

// w = 300: a drag alone commits past 135 px, a flick needs 66 px of travel.
const T = {
  commitRatio: 0.45,
  assistRatio: 0.22,
  vertCommitRatio: 0.22,
  velocity: 450,
  vertVelocity: 800,
};
const base = { dx: 0, dy: 0, vx: 0, vy: 0, w: 300, h: 480 };

describe("decideCommit", () => {
  it("commits on distance alone past 0.45×width", () => {
    expect(decideCommit({ ...base, dx: 140 }, T)).toBe("like");
    expect(decideCommit({ ...base, dx: -140 }, T)).toBe("nope");
    expect(decideCommit({ ...base, dx: 120 }, T)).toBeNull(); // slow, short
  });

  it("a flick commits once the card has travelled 0.22×width", () => {
    expect(decideCommit({ ...base, dx: 80, vx: 600 }, T)).toBe("like");
    expect(decideCommit({ ...base, dx: -80, vx: -600 }, T)).toBe("nope");
  });

  it("a really fast flick commits on a shorter travel", () => {
    const fast = { ...T, fastVelocity: 1500, fastAssistRatio: 0.1 };
    // 20 % of 300 = 60 px: too short for the normal 0.22, enough at 2360 px/s.
    expect(decideCommit({ ...base, dx: -60, vx: -2360 }, fast)).toBe("nope");
    expect(decideCommit({ ...base, dx: -60, vx: -2360 }, T)).toBeNull();
    // Below the fast speed the normal travel still applies.
    expect(decideCommit({ ...base, dx: -60, vx: -1000 }, fast)).toBeNull();
    // Still needs some travel, and still only in the direction it went.
    expect(decideCommit({ ...base, dx: -20, vx: -2360 }, fast)).toBeNull();
    expect(decideCommit({ ...base, dx: 60, vx: -2360 }, fast)).toBeNull();
  });

  it("a flick with too little travel springs back", () => {
    expect(decideCommit({ ...base, dx: 10, vx: 1000 }, T)).toBeNull();
  });

  it("a flick against the drag direction springs back", () => {
    expect(decideCommit({ ...base, dx: 80, vx: -1000 }, T)).toBeNull();
    expect(decideCommit({ ...base, dx: -80, vx: 1000 }, T)).toBeNull();
  });

  it("springs back below every threshold (null)", () => {
    expect(decideCommit({ ...base, dx: 50, vx: 100 }, T)).toBeNull();
  });

  it("up-swipe saves when dominantly vertical", () => {
    expect(decideCommit({ ...base, dy: -150 }, T)).toBe("save"); // 150 > 105.6
    expect(decideCommit({ ...base, vy: -1000 }, T)).toBe("save");
    // A fast upward flick with a little sideways drift is still a save.
    expect(
      decideCommit({ ...base, dx: 20, dy: -60, vx: 600, vy: -1500 }, T),
    ).toBe("save");
  });

  it("a diagonal fling reads as horizontal, not save", () => {
    expect(decideCommit({ ...base, dx: 200, dy: -150 }, T)).toBe("like");
    // Fast diagonal flick: up velocity is past the save line, but the card
    // went further sideways than up, so it is a like.
    expect(
      decideCommit({ ...base, dx: 80, dy: -60, vx: 1500, vy: -1500 }, T),
    ).toBe("like");
  });
});

describe("rotationFor", () => {
  it("turns degPerWidth per card width and clamps to ±maxDeg", () => {
    expect(rotationFor(30, 300, 40, 25)).toBeCloseTo(4);
    expect(rotationFor(-30, 300, 40, 25)).toBeCloseTo(-4);
    expect(rotationFor(300, 300, 40, 25)).toBeCloseTo(25); // clamped
    expect(rotationFor(-900, 300, 40, 25)).toBeCloseTo(-25);
    expect(rotationFor(100, 0, 40, 25)).toBe(0); // guard divide-by-zero
  });
  it("turns the other way when the card was grabbed in its bottom half", () => {
    expect(rotationFor(30, 300, 40, 25, 1)).toBeCloseTo(4);
    expect(rotationFor(30, 300, 40, 25, -1)).toBeCloseTo(-4);
    expect(rotationFor(-900, 300, 40, 25, -1)).toBeCloseTo(25);
  });
});

describe("stampOpacity", () => {
  it("stays hidden for the first 0.15×width, then ramps over 0.07×width", () => {
    expect(stampOpacity(30, 300, 0.15, 0.07)).toBe(0);
    expect(stampOpacity(55.5, 300, 0.15, 0.07)).toBeCloseTo(0.5);
    expect(stampOpacity(66, 300, 0.15, 0.07)).toBeCloseTo(1);
    expect(stampOpacity(200, 300, 0.15, 0.07)).toBe(1);
    expect(stampOpacity(-66, 300, 0.15, 0.07)).toBe(0); // other direction
    expect(stampOpacity(66, 0, 0.15, 0.07)).toBe(0);
  });
});

describe("buttonProgress", () => {
  it("jumps to 0.85 in the first 0.035×width, then creeps to 1", () => {
    expect(buttonProgress(0, 300, 0.035, 0.21)).toBe(0);
    expect(buttonProgress(-20, 300, 0.035, 0.21)).toBe(0);
    expect(buttonProgress(5.25, 300, 0.035, 0.21)).toBeCloseTo(0.425);
    expect(buttonProgress(10.5, 300, 0.035, 0.21)).toBeCloseTo(0.85);
    expect(buttonProgress(42, 300, 0.035, 0.21)).toBeCloseTo(0.925);
    expect(buttonProgress(200, 300, 0.035, 0.21)).toBe(1);
    expect(buttonProgress(10, 0, 0.035, 0.21)).toBe(0);
  });
});

describe("upDragLeads", () => {
  it("lights only save when the finger went more up than sideways", () => {
    // ty is the card's travel: 40 px at damp 0.8 = 50 px of finger.
    expect(upDragLeads(20, -40, 0.8)).toBe(true);
    expect(upDragLeads(-45, -40, 0.8)).toBe(true);
    expect(upDragLeads(60, -40, 0.8)).toBe(false);
  });
  it("leaves a still, tied or downward drag to the sides", () => {
    expect(upDragLeads(0, 0, 0.8)).toBe(false);
    expect(upDragLeads(50, -40, 0.8)).toBe(false);
    expect(upDragLeads(5, 30, 0.8)).toBe(false);
  });
});

describe("saveButtonProgress", () => {
  it("jumps to 0.85 like the side discs, full at the save line", () => {
    // w 300, h 480: 0.85 at 10.5 px up, 1 at the 105.6 px commit line.
    expect(saveButtonProgress(0, 300, 480, 0.035, 0.22)).toBe(0);
    expect(saveButtonProgress(-30, 300, 480, 0.035, 0.22)).toBe(0); // down
    expect(saveButtonProgress(10.5, 300, 480, 0.035, 0.22)).toBeCloseTo(0.85);
    expect(saveButtonProgress(58.05, 300, 480, 0.035, 0.22)).toBeCloseTo(0.925);
    expect(saveButtonProgress(105.6, 300, 480, 0.035, 0.22)).toBeCloseTo(1);
    expect(saveButtonProgress(300, 300, 480, 0.035, 0.22)).toBe(1);
    expect(saveButtonProgress(10, 0, 480, 0.035, 0.22)).toBe(0);
  });
});

describe("flyDuration", () => {
  it("keeps the release speed, with a floor speed and 140–240 ms bounds", () => {
    expect(flyDuration(480, 0, 2400, 140, 240)).toBeCloseTo(200); // floor speed
    expect(flyDuration(600, 3000, 2400, 140, 240)).toBeCloseTo(200);
    expect(flyDuration(600, -3000, 2400, 140, 240)).toBeCloseTo(200);
    expect(flyDuration(480, 4800, 2400, 140, 240)).toBe(140); // clamped
    expect(flyDuration(720, 0, 2400, 140, 240)).toBe(240); // clamped
  });
  it("scales the time by the easing's starting slope", () => {
    expect(flyDuration(300, 1500, 1400, 90, 200, 2 / 3)).toBeCloseTo(133.33, 1);
    expect(flyDuration(300, 0, 1400, 90, 200, 2 / 3)).toBeCloseTo(142.86, 1);
  });
});

describe("nextCardScale", () => {
  it("rests at the rest scale and grows to full size by growPx", () => {
    expect(nextCardScale(0, 80, 0.95)).toBeCloseTo(0.95);
    expect(nextCardScale(40, 80, 0.95)).toBeCloseTo(0.975);
    expect(nextCardScale(-40, 80, 0.95)).toBeCloseTo(0.975);
    expect(nextCardScale(80, 80, 0.95)).toBe(1);
    expect(nextCardScale(500, 80, 0.95)).toBe(1);
    expect(nextCardScale(10, 0, 0.95)).toBe(1); // guard
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
