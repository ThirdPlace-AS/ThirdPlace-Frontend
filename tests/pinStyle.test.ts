// Map pins: every marker coloured by its pin group, what it is (user
// 2026-11-11, "familiar map colours"; was Phase 12 H3b's interest
// categories), readable glyphs, never the brand pink, distinct for
// colour-blind viewers; edges under the pins; titles light on dusk/night
// basemaps.
import { describe, expect, it } from "@jest/globals";

import {
  markerPaint,
  PIN_EDGE_RADIUS,
  PIN_SELECTED_RING,
  PIN_SIZE,
  pinPaint,
} from "@/components/map/pinStyle";
import {
  PIN_GROUP_TONE,
  PIN_GROUPS,
  pinGroupFill,
  pinGroupFor,
} from "@/components/map/services/pinGroup";
import { experiences, places } from "@/fixtures";
import { mapPalette, palette } from "@/theme";

const P = {
  ink: palette.light.ink ?? "",
  surface: palette.light.surface ?? "",
  onInk: palette.light.onInk ?? "",
};

function lin(v: number) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luminance(hex: string) {
  const [r, g, b] = rgb(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return ((x ?? 0) + 0.05) / ((y ?? 0) + 0.05);
}

// Colour-vision deficiency simulation (Viénot et al. 1999, linear RGB).
const CVD: Record<string, number[][]> = {
  protanopia: [
    [0.11238, 0.88762, 0],
    [0.11238, 0.88762, 0],
    [0.00401, -0.00401, 1],
  ],
  deuteranopia: [
    [0.29275, 0.70725, 0],
    [0.29275, 0.70725, 0],
    [-0.02234, 0.02234, 1],
  ],
};
function simulate(hex: string, m: number[][]): number[] {
  const l = rgb(hex).map(lin);
  return m.map((row) => row.reduce((s, k, i) => s + k * (l[i] ?? 0), 0));
}
function distance(a: number[], b: number[]) {
  return Math.hypot(...a.map((v, i) => v - (b[i] ?? 0)));
}

describe("pin groups", () => {
  it("every place and experience fits a group", () => {
    for (const p of places)
      expect(PIN_GROUPS).toContain(pinGroupFor({ kind: "place", id: p.id }));
    for (const e of experiences)
      expect(PIN_GROUPS).toContain(
        pinGroupFor({ kind: "experience", id: e.id }),
      );
  });

  it("each group has its own colour, never the brand pink", () => {
    const fills = PIN_GROUPS.map(pinGroupFill);
    expect(new Set(fills).size).toBe(fills.length);
    for (const f of fills) {
      expect(f).toMatch(/^#[0-9A-F]{6}$/i);
      expect(f.toUpperCase()).not.toBe(palette.light.ember?.toUpperCase());
    }
  });

  it("the glyph reads on its fill (≥ 3:1)", () => {
    for (const g of PIN_GROUPS) {
      const glyph = PIN_GROUP_TONE[g] === "light" ? P.surface : P.ink;
      expect(contrast(glyph, pinGroupFill(g))).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(Object.keys(CVD))("stays distinguishable with %s", (kind) => {
    const sims = PIN_GROUPS.map((g) => simulate(pinGroupFill(g), CVD[kind]!));
    let min = Infinity;
    for (let i = 0; i < sims.length; i++)
      for (let j = i + 1; j < sims.length; j++)
        min = Math.min(min, distance(sims[i]!, sims[j]!));
    expect(min).toBeGreaterThan(0.04);
  });
});

describe("pin paint", () => {
  it("fills a place by its kind and rings by kind", () => {
    const paint = (id: string) => markerPaint({ kind: "place", id }, P);
    // p5, a hiking club: nature.
    expect(paint("p5").group).toBe("nature");
    expect(paint("p5").fill).toBe(mapPalette.nature);
    expect(paint("p5").ring).toBe(P.surface);
    expect(paint("p5").edge).toBeNull();
    // A park is green whatever its interest (this one's is Bakst).
    const park = places.find(
      (p) => p.category === "Park" && p.interestId === "bakst",
    )!;
    expect(paint(park.id).group).toBe("nature");
    // A café orange, a beach blue, a bar purple.
    expect(paint("p1").group).toBe("eat");
    const beach = places.find((p) => p.category === "Badeplass")!;
    expect(paint(beach.id).group).toBe("water");
    const bar = places.find((p) => p.category === "Bar")!;
    expect(paint(bar.id).group).toBe("night");
  });

  it("fills an experience by its activity, ringed in ink with a white edge", () => {
    const paint = (id: string) => markerPaint({ kind: "experience", id }, P);
    // e4, an evening run: sport.
    expect(paint("e4").group).toBe("sport");
    expect(paint("e4").ring).toBe(P.ink);
    expect(paint("e4").edge).toBe(P.surface);
    // A paddling trip is blue like the water.
    const kayak = experiences.find((e) => e.interestId === "kajakk")!;
    expect(paint(kayak.id).group).toBe("water");
    // Nothing known: still a group.
    expect(pinGroupFor({ kind: "experience", id: "nope" })).toBe("social");
  });

  it("draws the edges outside the pin at every zoom", () => {
    for (const i of [0, 1] as const) {
      const pin = PIN_SIZE.radius[i] + PIN_SIZE.ring[i];
      // The white edge's circle reaches the ring's outside; its stroke is
      // the edge itself.
      expect(PIN_EDGE_RADIUS.edge[i]).toBe(pin);
      expect(PIN_SIZE.edge[i]).toBeGreaterThan(0);
      expect(PIN_EDGE_RADIUS.shadow[i]).toBeGreaterThan(pin + PIN_SIZE.edge[i]);
    }
    // The selection ring (its stroke drawn outside its radius) stays
    // outermost at full size.
    expect(PIN_SELECTED_RING.radius + PIN_SELECTED_RING.width).toBeGreaterThan(
      PIN_EDGE_RADIUS.shadow[1],
    );
    expect(PIN_SELECTED_RING.radius).toBeGreaterThan(
      PIN_EDGE_RADIUS.edge[1] + PIN_SIZE.edge[1],
    );
  });

  it("titles turn light with a dark halo on dusk/night basemaps", () => {
    expect(pinPaint(P, false).labelText).toBe(P.ink);
    expect(pinPaint(P, false).labelHalo).toBe(P.surface);
    expect(pinPaint(P, true).labelText).toBe(mapPalette.labelLight);
    expect(pinPaint(P, true).labelHalo).toBe(mapPalette.labelHaloDark);
    expect(
      contrast(mapPalette.labelLight ?? "", mapPalette.labelHaloDark ?? ""),
    ).toBeGreaterThan(15);
  });

  it("clusters flip to white over a dark basemap", () => {
    expect(pinPaint(P, false).clusterFill).toBe(P.ink);
    expect(pinPaint(P, true).clusterFill).toBe(P.surface);
    expect(pinPaint(P, true).clusterText).toBe(P.ink);
  });
});
