import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";

import { resolveScheme } from "@/theme/scheme";
import { fontSize as typeScale } from "@/theme/typography";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tokens = require("../src/theme/tokens.js") as {
  palette: Record<"light" | "dark", Record<string, string>>;
  themeColors: Record<string, string>;
  cssVars: (s: "light" | "dark") => Record<string, string>;
  fontSize: Record<string, [string, { lineHeight: string }]>;
};

// WCAG 2.x relative luminance / contrast ratio.
function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * lin((n >> 16) & 255) +
    0.7152 * lin((n >> 8) & 255) +
    0.0722 * lin(n & 255)
  );
}
function contrast(a: string, b: string) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// Text-on-surface pairs that carry body-size text (AA = 4.5:1).
const TEXT_PAIRS: [fg: string, bg: string][] = [
  ["ink", "background"],
  ["ink", "surface"],
  ["ink", "surfaceRaised"],
  ["ink", "surfaceMuted"],
  ["muted", "background"],
  ["muted", "surface"],
  ["onInk", "ink"],
  ["onEmber", "ember"],
  ["onSuccess", "success"],
];

describe("theme tokens", () => {
  it("light and dark palettes define the same keys", () => {
    expect(Object.keys(tokens.palette.dark).sort()).toEqual(
      Object.keys(tokens.palette.light).sort(),
    );
  });

  it("every palette value is a #RRGGBB hex", () => {
    for (const scheme of ["light", "dark"] as const) {
      for (const v of Object.values(tokens.palette[scheme])) {
        expect(v).toMatch(/^#[0-9A-F]{6}$/i);
      }
    }
  });

  it.each(["light", "dark"] as const)(
    "%s: text pairs meet WCAG AA (4.5:1)",
    (scheme) => {
      const p = tokens.palette[scheme];
      for (const [fg, bg] of TEXT_PAIRS) {
        const ratio = contrast(p[fg] ?? "", p[bg] ?? "");
        if (ratio < 4.5)
          throw new Error(`${scheme} ${fg} on ${bg}: ${ratio.toFixed(2)}`);
      }
    },
  );

  it("tailwind colours read CSS variables with an alpha slot", () => {
    expect(tokens.themeColors.surfaceMuted).toBe(
      "rgb(var(--c-surface-muted) / <alpha-value>)",
    );
  });

  it("global.css :root fallback matches the light palette", () => {
    const css = fs.readFileSync(
      path.join(__dirname, "..", "global.css"),
      "utf8",
    );
    for (const [name, value] of Object.entries(tokens.cssVars("light"))) {
      expect(css).toContain(`${name}: ${value};`);
    }
  });

  it("typography.ts mirrors the tailwind type scale", () => {
    for (const [key, [size]] of Object.entries(tokens.fontSize)) {
      expect(`${typeScale[key as keyof typeof typeScale]}px`).toBe(size);
    }
  });

  it("resolves the scheme preference", () => {
    expect(resolveScheme("light", "dark")).toBe("light");
    expect(resolveScheme("dark", "light")).toBe("dark");
    expect(resolveScheme("system", "dark")).toBe("dark");
    expect(resolveScheme("system", null)).toBe("light");
  });
});
