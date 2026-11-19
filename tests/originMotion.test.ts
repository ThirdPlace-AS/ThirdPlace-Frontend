// Surfaces open from the tap (0457): the press-origin store and the pure
// transform math that Overlay, Sheet and PhotoViewer animate with.
import { beforeEach, describe, expect, it } from "@jest/globals";

import {
  growFromRect,
  scaleAbout,
  SHEET_FROM_SCALE,
  ZOOM_FROM_SCALE,
  zoomFromPoint,
} from "@/components/ui/originMotion";
import {
  notePressOrigin,
  PRESS_ORIGIN_MAX_AGE,
  recentPressOrigin,
  resetPressOrigin,
} from "@/lib/pressOrigin";

const SCREEN = { width: 400, height: 800 };

describe("press origin (0457)", () => {
  beforeEach(() => resetPressOrigin());

  it("returns a fresh press", () => {
    notePressOrigin(40, 700, 1000);
    expect(recentPressOrigin(1000 + PRESS_ORIGIN_MAX_AGE)).toEqual({
      x: 40,
      y: 700,
    });
  });

  it("drops a stale press, a press from the future and a reset", () => {
    notePressOrigin(40, 700, 1000);
    expect(recentPressOrigin(1001 + PRESS_ORIGIN_MAX_AGE)).toBeNull();
    expect(recentPressOrigin(999)).toBeNull();
    notePressOrigin(40, 700, 1000);
    resetPressOrigin();
    expect(recentPressOrigin(1000)).toBeNull();
  });

  it("is not consumed by a read", () => {
    notePressOrigin(10, 20, 1000);
    recentPressOrigin(1100);
    expect(recentPressOrigin(1200)).toEqual({ x: 10, y: 20 });
  });
});

describe("origin transform math (0457)", () => {
  it("scaleAbout keeps the origin point fixed", () => {
    const origin = { x: 40, y: 800 };
    const center = { x: 200, y: 500 };
    const s = SHEET_FROM_SCALE;
    const t = scaleAbout(origin, center, s);
    // A point at the origin, scaled about the centre then moved, lands on
    // itself.
    expect(center.x + (origin.x - center.x) * s + t.translateX).toBeCloseTo(
      origin.x,
    );
    expect(center.y + (origin.y - center.y) * s + t.translateY).toBeCloseTo(
      origin.y,
    );
    const none = scaleAbout(origin, center, 1);
    expect(none.translateX).toBeCloseTo(0);
    expect(none.translateY).toBeCloseTo(0);
  });

  it("zoomFromPoint starts small toward the tap and ends at identity", () => {
    const start = zoomFromPoint({ x: 40, y: 100 }, SCREEN, 0, ZOOM_FROM_SCALE);
    expect(start.scale).toBeCloseTo(ZOOM_FROM_SCALE);
    // Tap is left of and above the centre: the view moves that way.
    expect(start.translateX).toBeLessThan(0);
    expect(start.translateY).toBeLessThan(0);
    const end = zoomFromPoint({ x: 40, y: 100 }, SCREEN, 1, ZOOM_FROM_SCALE);
    expect(end.scale).toBeCloseTo(1);
    expect(end.translateX).toBeCloseTo(0);
    expect(end.translateY).toBeCloseTo(0);
  });

  it("growFromRect covers the thumbnail at the start, the screen at the end", () => {
    const rect = { x: 20, y: 600, width: 80, height: 80 };
    const start = growFromRect(rect, SCREEN, 0);
    // The larger ratio, so the photo covers the thumbnail.
    expect(start.scale).toBeCloseTo(Math.max(80 / 400, 80 / 800));
    // Centred on the rect.
    expect(SCREEN.width / 2 + start.translateX).toBeCloseTo(60);
    expect(SCREEN.height / 2 + start.translateY).toBeCloseTo(640);
    const end = growFromRect(rect, SCREEN, 1);
    expect(end.scale).toBe(1);
    expect(end.translateX).toBeCloseTo(0);
    expect(end.translateY).toBeCloseTo(0);
  });

  it("growFromRect never starts above full size", () => {
    const huge = { x: -10, y: -10, width: 900, height: 1600 };
    expect(growFromRect(huge, SCREEN, 0).scale).toBe(1);
  });
});
