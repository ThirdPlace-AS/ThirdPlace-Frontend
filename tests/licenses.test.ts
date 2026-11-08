// Phase 15 Lisenser: src/generated/licenses.json lists the packages in the
// app bundle with their own licence texts (scripts/build-licenses.js).
import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";

import licenses from "../src/generated/licenses.json";

const ROOT = path.join(__dirname, "..");
type Pkg = {
  name: string;
  version: string;
  license: string;
  copyright: string[];
  author: string | null;
  text: string | null;
  shared: boolean;
};
const PACKAGES = licenses.packages as Pkg[];
const TEXTS = licenses.texts as Record<string, string>;
const deps = Object.keys(
  (
    JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")) as {
      dependencies: Record<string, string>;
    }
  ).dependencies,
);

describe("Lisenser", () => {
  it("lists the main runtime packages and the font", () => {
    const names = new Set(PACKAGES.map((p) => p.name));
    for (const n of [
      "react",
      "react-native",
      "expo-router",
      "@rnmapbox/maps",
      "DM Sans (skrift)",
    ]) {
      expect(names.has(n)).toBe(true);
    }
  });

  it("every package names its licence; every text id resolves", () => {
    for (const p of PACKAGES) {
      expect(p.license.length).toBeGreaterThan(0);
      if (p.text) expect(TEXTS[p.text]).toBeDefined();
    }
  });

  it("is current: listed direct dependencies match node_modules", () => {
    for (const p of PACKAGES.filter((x) => deps.includes(x.name))) {
      const installed = JSON.parse(
        fs.readFileSync(
          path.join(ROOT, "node_modules", p.name, "package.json"),
          "utf8",
        ),
      ) as { version: string };
      expect(`${p.name}@${p.version}`).toBe(`${p.name}@${installed.version}`);
    }
  });
});
