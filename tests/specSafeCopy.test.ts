// Phase 15 (founder, 2026-11-07): built screens no longer state rules the
// master spec contradicts, and the V1 non-goals drawn in the PDF stay hidden
// until the spec allows them. Scans app/ and src/ code (comments excluded).
import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "..");

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === "_sandbox" ? [] : files(p);
    return /\.(ts|tsx)$/.test(d.name) ? [p] : [];
  });
}

const code = [
  ...files(path.join(ROOT, "app")),
  ...files(path.join(ROOT, "src")),
].map((f) => ({
  f: path.relative(ROOT, f),
  text: fs
    .readFileSync(f, "utf8")
    .split(/\r?\n/)
    .filter((l) => !/^\s*(\/\/|\*|\/\*|\{\/\*)/.test(l))
    .join("\n"),
}));

const ruleClaims = [
  "Alle data slettes permanent",
  "kan ikke angres",
  "Rapporten er anonym",
  "PÅKREVD",
  "Andre kan se at du er innsjekket",
  "Du får en e-post når filen er klar",
];

const hiddenNonGoals = ["Del regningen", "Belønninger", "Utbetalingsplan"];

describe("spec-safe copy (Phase 15)", () => {
  it.each(ruleClaims)("no screen states «%s»", (phrase) => {
    expect(code.filter((c) => c.text.includes(phrase)).map((c) => c.f)).toEqual(
      [],
    );
  });

  it.each(hiddenNonGoals)("«%s» stays hidden until the spec allows it", (p) => {
    expect(code.filter((c) => c.text.includes(p)).map((c) => c.f)).toEqual([]);
  });

  it("a Skaper application does not open «Du er nå Skaper!»", () => {
    const screen = code.find((c) => c.f.endsWith("BecomeCreatorScreen.tsx"));
    expect(screen?.text).toBeDefined();
    expect(screen?.text).not.toContain("/creator-welcome");
  });
});
