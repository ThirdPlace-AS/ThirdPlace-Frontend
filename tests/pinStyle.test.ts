import { describe, expect, it } from "@jest/globals";

import {
  EXPERIENCE_CATEGORY,
  pinPaint,
  softPin,
} from "@/components/map/pinStyle";

const P = { ink: "#202020", surface: "#FFFFFF", onInk: "#FFFFFF" };

describe("map pin paint (review M20)", () => {
  it("places are white with an ink ring, experiences ink with a white ring", () => {
    const paint = pinPaint(P, false) as unknown as Record<string, unknown>;
    expect(paint.pointFill).toEqual([
      "case",
      ["==", ["get", "category"], EXPERIENCE_CATEGORY],
      P.ink,
      P.surface,
    ]);
    expect(paint.pointStroke).toEqual([
      "case",
      ["==", ["get", "category"], EXPERIENCE_CATEGORY],
      P.surface,
      P.ink,
    ]);
  });

  it("no category colour uses ember", () => {
    const json = JSON.stringify(pinPaint(P, false));
    expect(json).not.toMatch(/#D80000/i);
  });

  it("clusters flip to white over a dark basemap", () => {
    expect(pinPaint(P, false).clusterFill).toBe(P.ink);
    expect(pinPaint(P, true).clusterFill).toBe(P.surface);
    expect(pinPaint(P, true).clusterText).toBe(P.ink);
  });

  it("SoftMap classes follow the same split", () => {
    expect(softPin("Kafé").body).toContain("bg-surface");
    expect(softPin(EXPERIENCE_CATEGORY).body).toContain("bg-ink");
  });
});
