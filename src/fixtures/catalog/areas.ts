// Areas across Oslo and Akershus (Phase 19, founder 2026-11-08: pins spread
// across the whole Akershus area). MOCK named points for labels ("Sandvika,
// Bærum"), the Hvor picker and the manual-area fallback; approximate centres,
// not authoritative geodata or borders (BLOCKED_CONTRACT_GAP).

export const REGIONS = [
  "Oslo",
  "Asker og Bærum",
  "Follo",
  "Romerike",
  "Hadeland",
] as const;
export type Region = (typeof REGIONS)[number];

export type MockArea = {
  name: string;
  municipality: string;
  region: Region;
  coord: [number, number]; // [lng, lat]
};

// Grünerløkka first, on the demo map centre: the default position and the
// first manual area.
export const AREAS: MockArea[] = [
  // Oslo
  {
    name: "Grünerløkka",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.758, 59.9227],
  },
  {
    name: "Sentrum",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.7464, 59.9127],
  },
  {
    name: "Majorstuen",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.7146, 59.9299],
  },
  {
    name: "Frogner",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.7052, 59.9212],
  },
  {
    name: "Grønland",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.7635, 59.9127],
  },
  {
    name: "Tøyen",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.7745, 59.9155],
  },
  {
    name: "Sagene",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.7525, 59.9375],
  },
  {
    name: "Torshov",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.766, 59.933],
  },
  {
    name: "St. Hanshaugen",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.7395, 59.926],
  },
  {
    name: "Bjørvika",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.759, 59.907],
  },
  {
    name: "Gamle Oslo",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.77, 59.905],
  },
  {
    name: "Nydalen",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.769, 59.949],
  },
  {
    name: "Bygdøy",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.685, 59.905],
  },
  {
    name: "Holmenkollen",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.667, 59.964],
  },
  {
    name: "Sognsvann",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.7295, 59.969],
  },
  {
    name: "Ekeberg",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.772, 59.896],
  },
  {
    name: "Nordstrand",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.8, 59.865],
  },
  {
    name: "Grorud",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.881, 59.961],
  },
  {
    name: "Furuset",
    municipality: "Oslo",
    region: "Oslo",
    coord: [10.892, 59.941],
  },
  // Asker og Bærum
  {
    name: "Sandvika",
    municipality: "Bærum",
    region: "Asker og Bærum",
    coord: [10.524, 59.889],
  },
  {
    name: "Fornebu",
    municipality: "Bærum",
    region: "Asker og Bærum",
    coord: [10.615, 59.896],
  },
  {
    name: "Lysaker",
    municipality: "Bærum",
    region: "Asker og Bærum",
    coord: [10.64, 59.913],
  },
  {
    name: "Bekkestua",
    municipality: "Bærum",
    region: "Asker og Bærum",
    coord: [10.587, 59.918],
  },
  {
    name: "Kolsås",
    municipality: "Bærum",
    region: "Asker og Bærum",
    coord: [10.504, 59.918],
  },
  {
    name: "Asker",
    municipality: "Asker",
    region: "Asker og Bærum",
    coord: [10.435, 59.833],
  },
  {
    name: "Slemmestad",
    municipality: "Asker",
    region: "Asker og Bærum",
    coord: [10.495, 59.78],
  },
  // Follo
  {
    name: "Ski",
    municipality: "Nordre Follo",
    region: "Follo",
    coord: [10.837, 59.719],
  },
  {
    name: "Kolbotn",
    municipality: "Nordre Follo",
    region: "Follo",
    coord: [10.8, 59.81],
  },
  { name: "Ås", municipality: "Ås", region: "Follo", coord: [10.791, 59.664] },
  {
    name: "Drøbak",
    municipality: "Frogn",
    region: "Follo",
    coord: [10.63, 59.663],
  },
  {
    name: "Nesoddtangen",
    municipality: "Nesodden",
    region: "Follo",
    coord: [10.66, 59.858],
  },
  {
    name: "Vestby",
    municipality: "Vestby",
    region: "Follo",
    coord: [10.75, 59.603],
  },
  {
    name: "Enebakk",
    municipality: "Enebakk",
    region: "Follo",
    coord: [11.145, 59.757],
  },
  // Romerike
  {
    name: "Lillestrøm",
    municipality: "Lillestrøm",
    region: "Romerike",
    coord: [11.049, 59.956],
  },
  {
    name: "Strømmen",
    municipality: "Lillestrøm",
    region: "Romerike",
    coord: [11.005, 59.947],
  },
  {
    name: "Fetsund",
    municipality: "Lillestrøm",
    region: "Romerike",
    coord: [11.16, 59.93],
  },
  {
    name: "Lørenskog",
    municipality: "Lørenskog",
    region: "Romerike",
    coord: [10.96, 59.927],
  },
  {
    name: "Fjerdingby",
    municipality: "Rælingen",
    region: "Romerike",
    coord: [11.079, 59.93],
  },
  {
    name: "Hagan",
    municipality: "Nittedal",
    region: "Romerike",
    coord: [10.878, 60.029],
  },
  {
    name: "Gjerdrum",
    municipality: "Gjerdrum",
    region: "Romerike",
    coord: [11.033, 60.07],
  },
  {
    name: "Jessheim",
    municipality: "Ullensaker",
    region: "Romerike",
    coord: [11.174, 60.142],
  },
  {
    name: "Nannestad",
    municipality: "Nannestad",
    region: "Romerike",
    coord: [11.017, 60.219],
  },
  {
    name: "Eidsvoll",
    municipality: "Eidsvoll",
    region: "Romerike",
    coord: [11.26, 60.33],
  },
  {
    name: "Årnes",
    municipality: "Nes",
    region: "Romerike",
    coord: [11.466, 60.123],
  },
  {
    name: "Bjørkelangen",
    municipality: "Aurskog-Høland",
    region: "Romerike",
    coord: [11.564, 59.883],
  },
  {
    name: "Hurdal",
    municipality: "Hurdal",
    region: "Romerike",
    coord: [11.07, 60.43],
  },
  // Hadeland
  {
    name: "Harestua",
    municipality: "Lunner",
    region: "Hadeland",
    coord: [10.713, 60.202],
  },
  {
    name: "Jevnaker",
    municipality: "Jevnaker",
    region: "Hadeland",
    coord: [10.379, 60.24],
  },
];

/** Where pins may sit: Oslo and the Akershus municipalities. */
export const COVERAGE_BBOX = {
  west: 10.2,
  east: 11.8,
  south: 59.55,
  north: 60.45,
} as const;

// Equirectangular distance², with longitude shrunk by cos(latitude): good
// enough to pick the nearest named area at this latitude.
function near2(a: [number, number], b: [number, number]): number {
  const k = Math.cos(((a[1] + b[1]) / 2) * (Math.PI / 180));
  return ((a[0] - b[0]) * k) ** 2 + (a[1] - b[1]) ** 2;
}

/** The named area nearest a coordinate. */
// The nearest area per coordinate, remembered (speed pass 0347): the map's
// list asks for every item's area on each filter, mode or origin change, and
// each answer scanned all the areas. Pins never move, so their answers hold.
const areaByCoord = new Map<string, MockArea>();

export function areaFor(coord: [number, number]): MockArea {
  const key = `${coord[0]},${coord[1]}`;
  const hit = areaByCoord.get(key);
  if (hit) return hit;
  let best = AREAS[0]!;
  let bestD = near2(best.coord, coord);
  for (const a of AREAS) {
    const d = near2(a.coord, coord);
    if (d < bestD) {
      best = a;
      bestD = d;
    }
  }
  // GPS fixes add new coordinates; a long session only empties the cache.
  if (areaByCoord.size > 5000) areaByCoord.clear();
  areaByCoord.set(key, best);
  return best;
}

/** "Sandvika, Bærum" · "Grünerløkka, Oslo" · "Asker" (town = municipality). */
export function areaLabel(coord: [number, number]): string {
  return labelOf(areaFor(coord));
}

const labelOf = (a: MockArea) =>
  a.name === a.municipality ? a.name : `${a.name}, ${a.municipality}`;

/** The same label for an area picked by name ("Sandvika" → "Sandvika,
 *  Bærum"); a name that is no area comes back as it is. */
export function areaNameLabel(name: string): string {
  const a = AREAS.find((x) => x.name === name);
  return a ? labelOf(a) : name;
}

/** The pickers' list (Phase 19 S4): AREAS by region, in REGIONS order. With a
 *  query, only the areas whose name or municipality contains it, so "bærum"
 *  lists Sandvika, Bekkestua and the rest. Empty regions are left out. */
export function areasByRegion(
  query = "",
): { region: Region; areas: MockArea[] }[] {
  const q = query.trim().toLowerCase();
  const hit = (a: MockArea) =>
    !q ||
    a.name.toLowerCase().includes(q) ||
    a.municipality.toLowerCase().includes(q);
  return REGIONS.map((region) => ({
    region,
    areas: AREAS.filter((a) => a.region === region && hit(a)),
  })).filter((g) => g.areas.length > 0);
}

export function inCoverage(coord: [number, number]): boolean {
  const [lng, lat] = coord;
  return (
    lng >= COVERAGE_BBOX.west &&
    lng <= COVERAGE_BBOX.east &&
    lat >= COVERAGE_BBOX.south &&
    lat <= COVERAGE_BBOX.north
  );
}
