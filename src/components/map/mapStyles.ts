// Base maps for the map tab, on two axes (founder 2026-11-07):
// - a map TYPE: Standard, Satellitt or Terreng;
// - a time-of-day STYLE: Daggry, Dag, Skumring, Natt, or Auto (follow the clock).
// Raw Mapbox style URLs, so this module stays free of the native-only
// `@rnmapbox/maps` import and plain screen/sheet code can use it.
//
// Standard and Terreng use ThirdPlace's own Mapbox Studio styles below: Mapbox
// Standard with one light preset each (`/draft` revisions; publish them before
// production). Satellitt is Mapbox's public Standard Satellite style, which
// takes the same `basemap` config (light preset, POI labels). Terreng adds hill
// shading and contour lines on top of the Studio style (MapboxMap).
// The public token (EXPO_PUBLIC_MAPBOX_TOKEN, pk.*) must be able to read them.

// Time-of-day period a style represents. Drives the auto (follow-the-clock)
// base-map switch. Tagged explicitly on each entry below — do NOT infer it from
// the label or array order.
export type MapStylePeriod = "dawn" | "day" | "dusk" | "night";

export const MAP_STYLES = [
  {
    key: "style1",
    label: "Daggry",
    period: "dawn",
    url: "mapbox://styles/thirdplace/cmmi50o1q002d01qw5mq0a2qh/draft",
  },
  {
    key: "style2",
    label: "Dag",
    period: "day",
    url: "mapbox://styles/thirdplace/cmvew4hcb00he01qua2pq2yiq/draft",
  },
  {
    key: "style3",
    label: "Skumring",
    period: "dusk",
    url: "mapbox://styles/thirdplace/cmvew6af7005601s8ec9i93ud/draft",
  },

  {
    key: "style4",
    label: "Natt",
    period: "night",
    url: "mapbox://styles/thirdplace/cmvew7d0300bc01s6cbc10o2w/draft",
  },
] as const satisfies readonly {
  key: string;
  label: string;
  period: MapStylePeriod;
  url: string;
}[];

// Key union derived from the array above, so changing the styles stays type-safe.
export type MapStyleKey = (typeof MAP_STYLES)[number]["key"];

export function periodForKey(key: MapStyleKey): MapStylePeriod {
  return (MAP_STYLES.find((s) => s.key === key) ?? MAP_STYLES[0]).period;
}

export function styleUrlFor(key: MapStyleKey): string {
  return (MAP_STYLES.find((s) => s.key === key) ?? MAP_STYLES[0]).url;
}

// Pure clock→period mapping. Bands (local hour, 0-23):
//   dawn 05-08, day 08-17, dusk 17-20, night 20-05.
export function periodForHour(hour: number): MapStylePeriod {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

// Resolve the style key for a given hour. Falls back to the first style if no
// entry carries the matching period (e.g. the user deleted one).
export function styleKeyForHour(hour: number): MapStyleKey {
  const period = periodForHour(hour);
  return (MAP_STYLES.find((s) => s.period === period) ?? MAP_STYLES[0]).key;
}

// The auto basemap: the night style whenever the app is in dark mode (a bright
// day map under dark chrome looks broken), the time of day otherwise.
export function autoStyleKey(hour: number, dark: boolean): MapStyleKey {
  if (!dark) return styleKeyForHour(hour);
  return (MAP_STYLES.find((s) => s.period === "night") ?? MAP_STYLES[0]).key;
}

// ---- Map type (Karttype) ----

export const MAP_TYPES = [
  { key: "standard", label: "Standard" },
  { key: "satellite", label: "Satellitt" },
  { key: "terrain", label: "Terreng" },
] as const;

export type MapType = (typeof MAP_TYPES)[number]["key"];

export const DEFAULT_MAP_TYPE: MapType = "standard";

export const STANDARD_SATELLITE_URL =
  "mapbox://styles/mapbox/standard-satellite";

export type Basemap = {
  url: string;
  /** Light preset, repeated in the `basemap` import config (MapboxMap). */
  period: MapStylePeriod;
  /** Dark under the pins: light pin titles and status-bar icons. */
  dark: boolean;
  /** Hill shading and contour lines on top (Terreng). */
  terrain: boolean;
};

/** The base map for a type and a time-of-day style. */
export function basemapFor(type: MapType, key: MapStyleKey): Basemap {
  const period = periodForKey(key);
  if (type === "satellite") {
    // Imagery is mid-to-dark at every hour, so the pins get the dark-map paint.
    return { url: STANDARD_SATELLITE_URL, period, dark: true, terrain: false };
  }
  return {
    url: styleUrlFor(key),
    period,
    dark: period === "dusk" || period === "night",
    terrain: type === "terrain",
  };
}
