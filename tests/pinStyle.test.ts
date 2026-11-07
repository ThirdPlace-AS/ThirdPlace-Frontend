// Map pins (Phase 12 H3b, founder 2026-11-06): every marker its own colour by
// category, readable glyphs, never the brand pink, distinct for colour-blind
// viewers; titles light on dusk/night basemaps.
import { describe, expect, it } from "@jest/globals";

import { markerPaint, pinPaint } from "@/components/map/pinStyle";
import {
  MARKER_CATEGORIES,
  MARKER_GLYPH_TONE,
  markerCategoryFor,
  markerFill,
} from "@/components/map/services/markerCategory";
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

describe("marker categories", () => {
  it("every place and experience fits a category", () => {
    for (const p of places)
      expect(MARKER_CATEGORIES).toContain(
        markerCategoryFor({ kind: "place", id: p.id }),
      );
    for (const e of experiences)
      expect(MARKER_CATEGORIES).toContain(
        markerCategoryFor({ kind: "experience", id: e.id }),
      );
  });

  it("each category has its own colour, never the brand pink", () => {
    const fills = MARKER_CATEGORIES.map(markerFill);
    expect(new Set(fills).size).toBe(fills.length);
    for (const f of fills) {
      expect(f).toMatch(/^#[0-9A-F]{6}$/i);
      expect(f.toUpperCase()).not.toBe(palette.light.ember?.toUpperCase());
    }
  });

  it("the glyph reads on its fill (≥ 3:1)", () => {
    for (const c of MARKER_CATEGORIES) {
      const glyph = MARKER_GLYPH_TONE[c] === "light" ? P.surface : P.ink;
      expect(contrast(glyph, markerFill(c))).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(Object.keys(CVD))("stays distinguishable with %s", (kind) => {
    const sims = MARKER_CATEGORIES.map((c) =>
      simulate(markerFill(c), CVD[kind]!),
    );
    let min = Infinity;
    for (let i = 0; i < sims.length; i++)
      for (let j = i + 1; j < sims.length; j++)
        min = Math.min(min, distance(sims[i]!, sims[j]!));
    expect(min).toBeGreaterThan(0.04);
  });
});

describe("pin paint", () => {
  it("fills by category and rings by kind", () => {
    const place = markerPaint({ kind: "place", id: "p5" }, P);
    expect(place.category).toBe("natur");
    expect(place.fill).toBe(mapPalette.natur);
    expect(place.ring).toBe(P.surface);
    const exp = markerPaint({ kind: "experience", id: "e4" }, P);
    expect(exp.category).toBe("trening");
    expect(exp.ring).toBe(P.ink);
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
