// Pin tap camera (user 2026-11-10: "when a marker is clicked on in the map
// page its need to sencter the screen to it and zoom in a bit smoothily").
import { describe, expect, it } from "@jest/globals";

import {
  PAGE_PEEK_MIN,
  PIN_TAP_MAX_ZOOM,
  focusPadding,
  pagePeekHeight,
  pinTapZoom,
  sameCoord,
} from "@/components/map/services/pinCamera";

describe("pinTapZoom", () => {
  it("steps one level closer", () => {
    expect(pinTapZoom(13)).toBe(14);
    expect(pinTapZoom(9.5)).toBe(10.5);
    expect(pinTapZoom(15.25)).toBe(16.25);
  });

  it("stops at street level and never zooms out", () => {
    expect(pinTapZoom(16.5)).toBe(PIN_TAP_MAX_ZOOM);
    expect(pinTapZoom(PIN_TAP_MAX_ZOOM)).toBe(PIN_TAP_MAX_ZOOM);
    expect(pinTapZoom(18.4)).toBe(18.4);
  });
});

describe("the page sheet's peek", () => {
  it("is 35 % of the window, at least PAGE_PEEK_MIN", () => {
    expect(pagePeekHeight(914)).toBe(320);
    expect(pagePeekHeight(640)).toBe(PAGE_PEEK_MIN);
  });
});

describe("focusPadding", () => {
  it("centres between the top controls and the peek on a tall phone", () => {
    // 914 dp window, the map ends 80 dp above (the tab bar), controls end at
    // 130 dp: the peek (320) covers 240 dp of the map.
    const p = focusPadding({ windowH: 914, mapH: 834, top: 130 });
    expect(p.paddingTop).toBe(130);
    expect(p.paddingBottom).toBe(240 + 8);
    expect(p.paddingLeft).toBe(0);
    expect(p.paddingRight).toBe(0);
  });

  it("keeps the pin above the 300 dp peek on a short phone", () => {
    // The old padding was 35 % of the window (224 dp): less than the peek.
    const p = focusPadding({ windowH: 640, mapH: 584, top: 120 });
    expect(p.paddingBottom).toBe(300 - 56 + 8);
    expect(p.paddingBottom).toBeGreaterThan(Math.round(640 * 0.35) - 56);
  });

  it("always leaves room in view", () => {
    const p = focusPadding({ windowH: 400, mapH: 340, top: 200 });
    expect(p.paddingTop + p.paddingBottom).toBeLessThan(340);
  });
});

describe("sameCoord", () => {
  it("allows float noise and nothing more", () => {
    expect(sameCoord([10.75, 59.92], [10.75 + 1e-9, 59.92])).toBe(true);
    expect(sameCoord([10.75, 59.92], [10.7501, 59.92])).toBe(false);
    expect(sameCoord(null, [10.75, 59.92])).toBe(false);
  });
});
