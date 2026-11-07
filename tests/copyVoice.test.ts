// Copy voice guard (docs/reviews, P6 "human-made check"). Every string the app
// owns is extracted by scripts/extract-copy.js; this test keeps it sounding
// like a person wrote it. A PDF line keeps an em dash only if the founder
// signs it off (PDF_EM_DASH below).
import fs from "fs";
import path from "path";

import { describe, expect, it } from "@jest/globals";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { extract } = require("../scripts/extract-copy.js") as {
  extract: () => { file: string; line: number; kind: string; text: string }[];
};

const COPY = extract();

// PDF lines that may keep an em dash. Empty since the founder approved plain
// rewrites of every such line (2026-11-06, docs/SCREEN_INVENTORY.md "Founder
// copy decisions"). Add a line here only with founder sign-off.
const PDF_EM_DASH = new Set<string>([]);

// Phrases that read as machine-written marketing in Norwegian UI.
const BANNED = [
  /uendelige muligheter/i,
  /sømløs(e)? opplevelse/i,
  /spennende reise/i,
  /skreddersydd for deg/i,
  /\bla oss\b/i,
  /\bmagisk(e)?\b/i,
  /\bdykk (ned|inn)\b/i,
  /\bløft(e)? (din|ditt|dine)\b/i,
];

const where = (c: { file: string; line: number; text: string }) =>
  `${c.file}:${c.line}  ${c.text}`;

describe("copy voice", () => {
  it("extracts the app's copy", () => {
    expect(COPY.length).toBeGreaterThan(500);
  });

  it("owned copy has no 'X — Y' em-dash constructions", () => {
    const hits = COPY.filter(
      (c) => / — /.test(c.text) && !PDF_EM_DASH.has(c.text),
    );
    expect(hits.map(where)).toEqual([]);
  });

  it("no machine-marketing phrases", () => {
    const hits = COPY.filter((c) => BANNED.some((re) => re.test(c.text)));
    expect(hits.map(where)).toEqual([]);
  });

  it("no doubled punctuation or shouting", () => {
    const hits = COPY.filter((c) => /!!|\?\?|!\?|\?!/.test(c.text));
    expect(hits.map(where)).toEqual([]);
  });

  it("no arrows on buttons or links (founder 2026-11-06)", () => {
    const hits = COPY.filter((c) => /[→←]/.test(c.text));
    expect(hits.map(where)).toEqual([]);
  });

  it("no arrows in JSX text the extractor cannot see (templates)", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.tsx$/.test(e.name)) {
          // Comments may use arrows; strings and JSX text may not. Block
          // comments are blanked (line numbers kept), line comments cut.
          fs.readFileSync(p, "utf8")
            .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
            .split(/\r?\n/)
            .forEach((line, i) => {
              const t = line.replace(/(^|\s)\/\/.*$/, "").trim();
              if (/[→←]/.test(t)) hits.push(`${p}:${i + 1}  ${t}`);
            });
        }
      }
    };
    walk(path.join(__dirname, "..", "app"));
    walk(path.join(__dirname, "..", "src"));
    expect(hits).toEqual([]);
  });

  it("the PDF allowlist only lists lines that still exist", () => {
    const present = new Set(COPY.map((c) => c.text));
    expect([...PDF_EM_DASH].filter((l) => !present.has(l))).toEqual([]);
  });
});
