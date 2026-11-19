#!/usr/bin/env node
/* global __dirname */
// Writes docs/fixtures/CATALOG.md: the Phase 19 interest catalogue as a table
// (84 interests × Bedrift, Organisasjon, Byrom, Opplevelse, Arrangement,
// Gruppe), the regional split of the places and the photo and credit counts.
// Reads the seed files, the interest list, the areas and the legacy fixtures
// as text, so it runs without a TypeScript build, and runs prettier on the
// result. Dev-only, never in CI.
//
// usage: node scripts/catalog-report.js
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CATALOG = path.join(ROOT, "src", "fixtures", "catalog");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8");

const CATEGORY_LABEL = {
  kafe: "Kafé",
  mat: "Mat og drikke",
  sosialt: "Sosialt og spill",
  natur: "Natur og tur",
  trening: "Trening",
  kultur: "Bøker og kultur",
  kreativt: "Kreativt og verksted",
  velvaere: "Velvære",
};

// Interests in catalogue order.
const interests = [];
{
  const src = read("src", "fixtures", "catalog", "interests.ts");
  const re = /id:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*category:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src)))
    interests.push({ id: m[1], label: m[2], category: m[3] });
}

// Town → region.
const regionOf = {};
{
  const src = read("src", "fixtures", "catalog", "areas.ts");
  const re =
    /name:\s*"([^"]+)",\s*municipality:\s*"([^"]+)",\s*region:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) regionOf[m[1]] = m[3];
}

// Seeded items per interest.
const KINDS = [
  "bedrift",
  "organisasjon",
  "byrom",
  "opplevelse",
  "arrangement",
  "gruppe",
];
const seeded = {};
const NOT_SEEDS = new Set([
  "areas.ts",
  "build.ts",
  "interests.ts",
  "people.ts",
  // Extra Bedrift places on top of the interests' sets (0374), listed below.
  "restaurants.ts",
  "seeds.ts",
  "types.ts",
]);
for (const f of fs.readdirSync(CATALOG).sort()) {
  if (!f.endsWith(".ts") || NOT_SEEDS.has(f)) continue;
  const src = fs.readFileSync(path.join(CATALOG, f), "utf8");
  const starts = [...src.matchAll(/\binterest:\s*"([^"]+)"/g)];
  starts.forEach((s, i) => {
    const block = src.slice(s.index, starts[i + 1]?.index ?? src.length);
    const item = { file: f };
    for (const kind of KINDS) {
      const at = block.search(new RegExp(`\\n\\s*${kind}:\\s*\\{`));
      if (at < 0) continue;
      const rest = block.slice(at);
      const name = /\n\s*(?:name|title):\s*"([^"]+)"/.exec(rest);
      const town = /\n\s*town:\s*"([^"]+)"/.exec(rest);
      const days = /\n\s*days:\s*(\d+)/.exec(rest);
      item[kind] = {
        name: name ? name[1] : "?",
        town:
          kind === "bedrift" || kind === "organisasjon" || kind === "byrom"
            ? town?.[1]
            : undefined,
        days: kind === "arrangement" && days ? Number(days[1]) : undefined,
      };
    }
    seeded[s[1]] = item;
  });
}

// Legacy fixtures (p1–p14, e1–e6, g1–g3) that fill a kind for an interest.
const legacy = {};
{
  const src = read("src", "fixtures", "index.ts");
  const re =
    /\n\s*id:\s*"([peg]\d+)",([\s\S]*?)(?=\n\s*id:\s*"[peg]\d+",|\n\];)/g;
  let m;
  while ((m = re.exec(src))) {
    const [id, body] = [m[1], m[2]];
    const interest = /\n\s*interestId:\s*"([^"]+)"/.exec(body)?.[1];
    if (!interest) continue;
    const name = /\n\s*(?:name|title):\s*"([^"]+)"/.exec(body)?.[1] ?? id;
    let kind;
    if (id.startsWith("p")) kind = /\n\s*kind:\s*"([^"]+)"/.exec(body)?.[1];
    else if (id.startsWith("e"))
      kind = /format:\s*"event"/.test(body) ? "arrangement" : "opplevelse";
    else kind = "gruppe";
    if (!kind) continue;
    (legacy[interest] ??= {})[kind] ??= { id, name };
  }
}

// Table rows.
const cell = (interest, kind) => {
  const s = seeded[interest]?.[kind];
  if (s) {
    const extra = s.town
      ? ` (${s.town})`
      : s.days > 1
        ? ` (${s.days} dager)`
        : "";
    return `${s.name}${extra}`;
  }
  const l = legacy[interest]?.[kind];
  return l ? `${l.name} (${l.id})` : "**mangler**";
};
const esc = (s) => s.replace(/\|/g, "\\|");

let missing = 0;
const sections = [];
for (const [cat, label] of Object.entries(CATEGORY_LABEL)) {
  const rows = interests.filter((i) => i.category === cat);
  if (!rows.length) continue;
  const lines = [
    `### ${label} (${rows.length})`,
    "",
    "| Interesse | Bedrift | Organisasjon | Byrom | Opplevelse | Arrangement | Gruppe |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const i of rows) {
    const cells = KINDS.map((k) => cell(i.id, k));
    missing += cells.filter((c) => c === "**mangler**").length;
    lines.push(`| ${esc(i.label)} | ${cells.map(esc).join(" | ")} |`);
  }
  sections.push(lines.join("\n"));
}

// Regional split of the seeded places.
const regions = {};
let placeCount = 0;
for (const item of Object.values(seeded))
  for (const kind of ["bedrift", "organisasjon", "byrom"]) {
    const town = item[kind]?.town;
    if (!town) continue;
    placeCount++;
    const r = regionOf[town] ?? "?";
    regions[r] = (regions[r] ?? 0) + 1;
  }
const regionLines = Object.entries(regions)
  .sort((a, b) => b[1] - a[1])
  .map(([r, n]) => `| ${r} | ${n} | ${Math.round((n / placeCount) * 100)} % |`);

// Photos and credits.
const LIB = path.join(ROOT, "assets", "library");
const webp = fs.readdirSync(LIB).filter((f) => f.endsWith(".webp"));
const full = webp.filter((f) => !f.endsWith("-sm.webp"));
const small = webp.length - full.length;
const bytes = webp.reduce((s, f) => s + fs.statSync(path.join(LIB, f)).size, 0);
const credits = read("assets", "library", "CREDITS.md")
  .split(/\r?\n/)
  .filter((l) => /^\|\s*[^|]+\.webp\s*\|/.test(l)).length;

// Restaurants (0374): extra Bedrift places, listed in their own table.
const restaurants = [];
{
  const src = fs.readFileSync(path.join(CATALOG, "restaurants.ts"), "utf8");
  const starts = [...src.matchAll(/\bkey:\s*"([^"]+)"/g)];
  starts.forEach((s, i) => {
    const block = src.slice(s.index, starts[i + 1]?.index ?? src.length);
    const get = (field) =>
      (new RegExp(`\\n\\s*${field}:\\s*"([^"]+)"`).exec(block) || [])[1] ?? "?";
    restaurants.push({
      name: get("name"),
      category: get("category"),
      town: get("town"),
      interest: get("interest"),
    });
  });
}
const restaurantLines = restaurants.map(
  (r) => `| ${r.name} | ${r.category} | ${r.town} | ${r.interest} |`,
);

const out = `# Interessekatalogen (Phase 19)

Generated by \`node scripts/catalog-report.js\` from the seed files in
\`src/fixtures/catalog/\`, the interest list, the areas and the legacy
fixtures. Every name is fictional MOCK content except the byrom, which use
the public names of real outdoor places (facilities from OpenStreetMap).
Do not edit by hand; run the script again after a seed changes.

## Summary

- Interests: ${interests.length} in ${Object.keys(CATEGORY_LABEL).length} categories, ${Object.keys(seeded).length} with a seed entry.
- Kinds per interest: Bedrift, Organisasjon, Byrom, Opplevelse, Arrangement, Gruppe. Cells marked **mangler**: ${missing}.
- Seeded places: ${placeCount} (legacy p1–p14 sit in inner Oslo and are not counted below), plus ${restaurants.length} restaurants (below).
- Library photos: ${small} small WebP and ${full.length} full-size ones (portraits ship only the small file), ${(bytes / 1e6).toFixed(1)} MB in total; CREDITS.md rows: ${credits}.

## Restaurants

Extra Bedrift places for the food interests (user 2026-11-10), on top of each
interest's own set, each with a menu (src/fixtures/menus/restaurants.ts).

| Restaurant | Kind | Town | Interest |
| --- | --- | --- | --- |
${restaurantLines.join("\n")}

## Places by region

| Region | Places | Share |
| --- | --- | --- |
${regionLines.join("\n")}

## The catalogue

A cell shows the item's name, the town for places and the number of days
for an Arrangement that runs over several days. Legacy items carry their
fixture id.

${sections.join("\n\n")}
`;

const dest = path.join(ROOT, "docs", "fixtures", "CATALOG.md");
fs.writeFileSync(dest, out);
execFileSync(
  process.execPath,
  [
    path.join(ROOT, "node_modules", "prettier", "bin", "prettier.cjs"),
    "--write",
    dest,
  ],
  { stdio: "pipe" },
);
console.log(
  `wrote docs/fixtures/CATALOG.md: ${interests.length} interests, ${missing} missing cells, ${placeCount} seeded places, ${full.length} photos`,
);
