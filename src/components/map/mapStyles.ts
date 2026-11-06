// Base-map styles for the layer switcher. Raw Mapbox style URLs (the same values
// the StyleURL enum holds) so this module stays free of the native-only
// `@rnmapbox/maps` import and can be used by the plain screen/sheet code too.
// The native MapView accepts a style URL string directly.
//
// >>> USE YOUR OWN MAPBOX STYLES <<<
// Replace each `url` below with one of YOUR Mapbox Studio styles
// (`mapbox://styles/<your-username>/<your-style-id>`), and rename `key`/`label`
// to taste. Add or remove entries freely — the layer sheet and the type derive
// from this array. The FIRST entry is the default map. Your public token
// (EXPO_PUBLIC_MAPBOX_TOKEN, pk.*) must have access to these styles.

// Time-of-day period a style represents. Drives the auto (follow-the-clock)
// base-map switch. Tagged explicitly on each entry below — do NOT infer it from
// the label or array order, since the header invites renaming/reordering.
export type MapStylePeriod = "dawn" | "day" | "dusk" | "night";

export const MAP_STYLES = [
  {
    key: "style1",
    label: "Dawn",
    period: "dawn",
    url: "mapbox://styles/thirdplace/cmmi50o1q002d01qw5mq0a2qh/draft",
  },
  {
    key: "style2",
    label: "Day",
    period: "day",
    url: "mapbox://styles/thirdplace/cmvew4hcb00he01qua2pq2yiq/draft",
  },
  {
    key: "style3",
    label: "Dusk",
    period: "dusk",
    url: "mapbox://styles/thirdplace/cmvew6af7005601s8ec9i93ud/draft",
  },

  {
    key: "style4",
    label: "Night",
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
