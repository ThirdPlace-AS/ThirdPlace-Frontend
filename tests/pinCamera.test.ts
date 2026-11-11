// Pin tap camera (user 2026-11-10: "when a marker is clicked on in the map
// page its need to sencter the screen to it and zoom in a bit smoothily").
import { describe, expect, it } from "@jest/globals";

import {
  FOCUS_ZOOM,
  PAGE_PEEK_MIN,
  focusPadding,
  pagePeekHeight,
  pinTapDuration,
  pinTapZoom,
  sameCoord,
} from "@/components/map/services/pinCamera";
import { duration } from "@/theme/motion";

// User 2026-11-11: "clicking a marker should only zoom to a cearten zoom
// level after that just move the screen to the next marker"; the user picked
// 14.5 after seeing 14.5, 15 and 16 on the device.
describe("pinTapZoom", () => {
  it("zooms in to FOCUS_ZOOM once, from anywhere farther out", () => {
    expect(FOCUS_ZOOM).toBe(14.5);
    expect(pinTapZoom(11)).toBe(FOCUS_ZOOM);
    expect(pinTapZoom(13.5)).toBe(FOCUS_ZOOM);
    expect(pinTapZoom(14.2)).toBe(FOCUS_ZOOM);
  });

  it("at FOCUS_ZOOM or closer it only pans, and never zooms out", () => {
    expect(pinTapZoom(FOCUS_ZOOM)).toBe(FOCUS_ZOOM);
    // After a pick from the list (15.5) a tap only pans.
    expect(pinTapZoom(15.5)).toBe(15.5);
    expect(pinTapZoom(17.4)).toBe(17.4);
    // Three taps in a row from county zoom: zoom once, then pan, pan.
    let z = 12;
    const seen: number[] = [];
    for (let i = 0; i < 3; i++) {
      z = pinTapZoom(z);
      seen.push(z);
    }
    expect(seen).toEqual([FOCUS_ZOOM, FOCUS_ZOOM, FOCUS_ZOOM]);
  });
});

describe("pinTapDuration", () => {
  it("a pan or a short zoom takes duration.focus, a long zoom a bit more", () => {
    expect(pinTapDuration(14.5, 14.5, false)).toBe(duration.focus);
    expect(pinTapDuration(13.5, 14.5, false)).toBe(duration.focus);
    expect(pinTapDuration(11.5, 14.5, false)).toBe(duration.focusFar);
    expect(duration.focusFar).toBeGreaterThan(duration.focus);
  });

  it("reduced motion moves at once", () => {
    expect(pinTapDuration(11.5, 14.5, true)).toBe(0);
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
