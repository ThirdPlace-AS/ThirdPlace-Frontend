#!/usr/bin/env node
/* global __dirname */
// Dev-only land check for the interest catalogue (Phase 19): every place
// coordinate in src/fixtures/catalog/*.ts, and the meeting point the builder
// puts ~45 m north of it, must be on land (the point ~45 m south is stamped
// too, for an event that shares its venue with an opplevelse; jest fails if
// a meeting point actually used is in water). Asks the Mapbox Tilequery API
// whether the point is inside the streets tileset's `water` layer, and writes
// the result to src/fixtures/catalog/land-check.json, which a jest test reads
// (every catalogue coordinate needs a "land" stamp). Never run in CI.
//
// Reads only EXPO_PUBLIC_MAPBOX_TOKEN (the public pk.* token) from the
// environment or .env.local, and never prints it.
//
// usage: node scripts/check-land.js
const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..");
const CATALOG = path.join(ROOT, "src", "fixtures", "catalog");
const OUT = path.join(CATALOG, "land-check.json");
// Mirrors build.ts: the meeting point sits this far north of its venue, or
// this far south for an event that shares its venue with an opplevelse.
const MEETING_OFFSET = 0.0004;

function publicToken() {
  if (process.env.EXPO_PUBLIC_MAPBOX_TOKEN)
    return process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  const env = path.join(ROOT, ".env.local");
  if (!fs.existsSync(env)) return null;
  for (const line of fs.readFileSync(env, "utf8").split(/\r?\n/)) {
    const m = /^\s*EXPO_PUBLIC_MAPBOX_TOKEN\s*=\s*(\S+)\s*$/.exec(line);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  return null;
}

const key = ([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`;

function catalogueCoords() {
  const out = [];
  for (const f of fs.readdirSync(CATALOG)) {
    if (!f.endsWith(".ts")) continue;
    const src = fs.readFileSync(path.join(CATALOG, f), "utf8");
    const re = /coord:\s*\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/g;
    let m;
    while ((m = re.exec(src))) {
      const c = [Number(m[1]), Number(m[2])];
      out.push({ file: f, coord: c });
      out.push({ file: f, coord: [c[0], c[1] + MEETING_OFFSET] });
      out.push({ file: f, coord: [c[0], c[1] - MEETING_OFFSET], spare: true });
    }
  }
  return out;
}

function inWater(coord, token) {
  const url =
    `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/` +
    `${coord[0]},${coord[1]}.json?layers=water&radius=0&limit=1&access_token=${token}`;
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = "";
        res.on("data", (d) => (body += d));
        res.on("end", () => {
          if (res.statusCode !== 200)
            return reject(new Error(`Tilequery HTTP ${res.statusCode}`));
          try {
            resolve((JSON.parse(body).features ?? []).length > 0);
          } catch {
            reject(new Error("Tilequery: unreadable response"));
          }
        });
      })
      .on("error", () => reject(new Error("Tilequery: network error")));
  });
}

async function main() {
  const token = publicToken();
  if (!token || !token.startsWith("pk.")) {
    console.error("No public Mapbox token (EXPO_PUBLIC_MAPBOX_TOKEN).");
    process.exit(2);
  }
  const prev = fs.existsSync(OUT)
    ? JSON.parse(fs.readFileSync(OUT, "utf8"))
    : {};
  const result = {};
  const wet = [];
  const spareWet = [];
  for (const { file, coord, spare } of catalogueCoords()) {
    const k = key(coord);
    if (result[k]) continue;
    const water = prev[k] === "land" ? false : await inWater(coord, token);
    result[k] = water ? "water" : "land";
    if (water) (spare ? spareWet : wet).push(`${file}: ${k}`);
  }
  const sorted = Object.fromEntries(
    Object.entries(result).sort(([a], [b]) => a.localeCompare(b)),
  );
  fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
  console.log(
    `${Object.keys(sorted).length} points checked, ${wet.length} in water`,
  );
  for (const w of wet) console.log(`  WATER ${w}`);
  for (const w of spareWet)
    console.log(`  south point in water (fine unless an event uses it) ${w}`);
  process.exit(wet.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(2);
});
