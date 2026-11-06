// Design-system guard (docs/design/DESIGN_SYSTEM.md §7). Scans app/ and src/
// so the rules stay true after the rollout. Each rule names its escape hatch;
// use it only with a reason in the comment.
import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

function files(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(path.join(ROOT, dir), {
    withFileTypes: true,
  })) {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) out.push(...files(rel));
    else if (/\.(tsx?|jsx?)$/.test(e.name)) out.push(rel);
  }
  return out;
}

const SOURCES = [...files("app"), ...files("src")];

type Hit = { file: string; line: number; text: string };

/** Lines of code (comment-only lines skipped). */
function scan(
  test: (line: string, prev: string[], file: string) => boolean,
  only: (file: string) => boolean = () => true,
): Hit[] {
  const hits: Hit[] = [];
  for (const file of SOURCES.filter(only)) {
    const lines = fs.readFileSync(path.join(ROOT, file), "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return;
      if (test(line, lines.slice(Math.max(0, i - 2), i), file)) {
        hits.push({ file, line: i + 1, text: t.slice(0, 100) });
      }
    });
  }
  return hits;
}

const fmt = (hits: Hit[]) => hits.map((h) => `${h.file}:${h.line}  ${h.text}`);
const inUi = (f: string) => f.startsWith("src/components/ui/");

describe("design-system guard", () => {
  it("no raw hex colours outside the theme (escape: `hex-ok:` comment)", () => {
    const hits = scan(
      (line, prev) =>
        /#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b(?![0-9A-Za-z])/.test(line) &&
        !/hex-ok:/.test([...prev, line].join("\n")),
      (f) =>
        !f.startsWith("src/theme/") &&
        !f.startsWith("src/fixtures/") &&
        !f.startsWith("app/_sandbox/"),
    );
    expect(fmt(hits)).toEqual([]);
  });

  it("no legacy text-size classes — use <Text variant>", () => {
    const hits = scan(
      (line) =>
        /(^|[\s"'`{])text-(xs|sm|base|lg|xl|2xl|3xl|4xl|\[\d)/.test(line),
      (f) => !inUi(f),
    );
    expect(fmt(hits)).toEqual([]);
  });

  it("no untokenised radii (rounded-3xl, bare `rounded`, rounded-[…])", () => {
    const hits = scan(
      (line) =>
        /(^|[\s"'`])rounded(-3xl|-\[|(?=[\s"'`]))/.test(line) &&
        /className|contentClassName|`/.test(line),
    );
    expect(fmt(hits)).toEqual([]);
  });

  it("no raw Modal outside the Sheet/Overlay engine", () => {
    const hits = scan(
      (line) =>
        /<Modal\b/.test(line) || /\bModal\b.*from "react-native"/.test(line),
      (f) =>
        f !== "src/components/ui/Sheet.tsx" &&
        f !== "src/components/ui/Overlay.tsx",
    );
    // multi-line react-native imports: check the specifier list too
    const imports = SOURCES.filter(
      (f) =>
        f !== "src/components/ui/Sheet.tsx" &&
        f !== "src/components/ui/Overlay.tsx",
    ).filter((f) =>
      /import\s*\{[^}]*\bModal\b[^}]*\}\s*from\s*"react-native"/.test(
        fs.readFileSync(path.join(ROOT, f), "utf8"),
      ),
    );
    expect([...fmt(hits), ...imports]).toEqual([]);
  });

  it("Ionicons only through <Icon> (escape: `raw-icon:` comment with the reason)", () => {
    const hits = scan(
      (line, prev) =>
        /<Ionicons\b/.test(line) &&
        !/raw-icon:/.test([...prev, line].join("\n")),
      (f) => f !== "src/components/ui/Icon.tsx",
    );
    expect(fmt(hits)).toEqual([]);
  });

  it("no active:/focus:/hover: in Pressable contentClassName (they block presses)", () => {
    const hits = scan((line) =>
      /contentClassName=.*\b(active|focus|hover):/.test(line),
    );
    expect(fmt(hits)).toEqual([]);
  });

  it("no InteractionManager (deprecated; deferred updates did not paint in Modals)", () => {
    const hits = scan((line) => /\bInteractionManager\b/.test(line));
    expect(fmt(hits)).toEqual([]);
  });
});
