#!/usr/bin/env node
/* global __dirname */
// Lisenser (Phase 15): the open-source packages in the app's JavaScript bundle,
// each with its own licence text, for Innstillinger → Om ThirdPlace → Lisenser.
//
//   npx expo export -p android --source-maps --output-dir <dir>
//   node scripts/build-licenses.js <dir>
//
// Reads every node_modules package the bundle's source map names, then that
// package's package.json ("license") and its own LICENSE / COPYING file. The
// texts are never typed by hand. Copyright lines stay with each package; the
// rest of each text is stored once and shared (most MIT texts differ only in
// the copyright line). The DM Sans font's OFL text comes from the font
// package's own LICENSE_FONT. A package published without a licence file
// gets its author from package.json and, when it is MIT, the MIT text most
// MIT packages in the bundle ship (marked `shared`; the MIT text differs only
// in the copyright line). Writes src/generated/licenses.json and runs
// prettier on it. Re-run after adding or upgrading a dependency;
// tests/licenses.test.ts checks the listed versions against node_modules.
const { execFileSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "src", "generated", "licenses.json");
const LICENSE_FILE =
  /^(licen[cs]e|copying)([-_.](md|txt|markdown|mit|apache|bsd))*$/i;

function mapFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return mapFiles(p);
    return d.name.endsWith(".map") ? [p] : [];
  });
}

/** "../node_modules/a/node_modules/@s/b/lib/x.js" → "node_modules/a/node_modules/@s/b" */
function packageDir(source) {
  const s = source.replace(/\\/g, "/");
  const re = /node_modules\/(@[^/]+\/[^/]+|[^/@][^/]*)\//g;
  let m;
  let end = -1;
  while ((m = re.exec(s))) end = m.index + m[0].length - 1;
  if (end < 0) return null;
  const start = s.indexOf("node_modules/");
  return s.slice(start, end);
}

function authorOf(pkg) {
  const a = pkg.author;
  if (typeof a === "string") return a.replace(/s*[<(].*$/, "").trim() || null;
  if (a && typeof a === "object" && a.name) return String(a.name);
  return null;
}

function licenseOf(pkg) {
  const l = pkg.license ?? pkg.licenses;
  if (typeof l === "string") return l;
  if (Array.isArray(l)) return l.map((x) => x.type ?? x).join(" OR ");
  if (l && typeof l === "object") return l.type ?? "UNKNOWN";
  return "UNKNOWN";
}

function readText(dir, names) {
  const file = fs
    .readdirSync(dir)
    .find((n) => names.test(n) && fs.statSync(path.join(dir, n)).isFile());
  return file ? fs.readFileSync(path.join(dir, file), "utf8") : null;
}

const texts = {};
function splitText(raw) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const copyright = [];
  const body = [];
  for (const [i, line] of lines.entries()) {
    const t = line.trim();
    if (
      i < 60 &&
      copyright.length < 4 &&
      /^(\(c\)|©)?\s*copyright\b/i.test(t) &&
      /(\d{4}|©|\(c\))/i.test(t)
    ) {
      copyright.push(t);
    } else {
      body.push(line);
    }
  }
  const text = body
    .join("\n")
    .trim()
    .replace(/\n{3,}/g, "\n\n");
  if (!text) return { copyright, id: null };
  const id = crypto.createHash("sha1").update(text).digest("hex").slice(0, 10);
  texts[id] = text;
  return { copyright, id };
}

function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error("usage: node scripts/build-licenses.js <expo export dir>");
    process.exit(1);
  }
  const dirs = new Set();
  for (const f of mapFiles(path.resolve(dir))) {
    const map = JSON.parse(fs.readFileSync(f, "utf8"));
    for (const s of map.sources ?? []) {
      const d = packageDir(s);
      if (d) dirs.add(d);
    }
  }

  const seen = new Set();
  const packages = [];
  for (const rel of [...dirs].sort()) {
    const abs = path.join(ROOT, rel);
    const pj = path.join(abs, "package.json");
    if (!fs.existsSync(pj)) continue;
    const pkg = JSON.parse(fs.readFileSync(pj, "utf8"));
    if (!pkg.name || pkg.private === true) continue;
    const key = `${pkg.name}@${pkg.version}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const raw = readText(abs, LICENSE_FILE);
    const { copyright, id } = raw
      ? splitText(raw)
      : { copyright: [], id: null };
    packages.push({
      name: pkg.name,
      version: pkg.version,
      license: licenseOf(pkg),
      copyright,
      author: copyright.length ? null : authorOf(pkg),
      text: id,
      shared: false,
    });
  }

  // Packages without a licence file: the MIT text most MIT packages ship.
  const mitCounts = {};
  for (const p of packages) {
    if (p.license === "MIT" && p.text)
      mitCounts[p.text] = (mitCounts[p.text] ?? 0) + 1;
  }
  const mit =
    Object.entries(mitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  for (const p of packages) {
    if (!p.text && p.license === "MIT" && mit) {
      p.text = mit;
      p.shared = true;
    }
  }

  // The font: its own OFL file from the font package.
  const fontDir = path.join(
    ROOT,
    "node_modules",
    "@expo-google-fonts",
    "dm-sans",
  );
  const fontPkg = JSON.parse(
    fs.readFileSync(path.join(fontDir, "package.json"), "utf8"),
  );
  const font = splitText(
    fs.readFileSync(path.join(fontDir, "LICENSE_FONT"), "utf8"),
  );
  packages.push({
    name: "DM Sans (skrift)",
    version: fontPkg.version,
    license: "OFL-1.1",
    copyright: font.copyright,
    author: null,
    text: font.id,
    shared: false,
  });

  packages.sort((a, b) => a.name.localeCompare(b.name));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ packages, texts }));
  execFileSync(
    process.execPath,
    [
      path.join(ROOT, "node_modules", "prettier", "bin", "prettier.cjs"),
      "--write",
      OUT,
    ],
    { stdio: "pipe" },
  );
  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log(
    `wrote ${path.relative(ROOT, OUT)}: ${packages.length} packages, ${Object.keys(texts).length} texts, ${kb} KB`,
  );
}

main();
