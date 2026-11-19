import type { ConfigContext, ExpoConfig } from "expo/config";

// Extends the static app.json config. The ONLY dynamic bit is the Mapbox native
// SDK download token, read from the environment at build time (never committed).
// Set MAPBOX_DOWNLOADS_TOKEN (a secret sk.* token) in your shell / EAS secrets
// before a native build. Without it, @rnmapbox/maps still installs but the native
// map is unavailable (the app falls back to the SoftMap placeholder).
export default ({ config }: ConfigContext): ExpoConfig => {
  const downloadToken = process.env.MAPBOX_DOWNLOADS_TOKEN;
  const basePlugins = (config.plugins ?? []).filter(
    (p) => (Array.isArray(p) ? p[0] : p) !== "@rnmapbox/maps",
  );

  return {
    ...config,
    name: config.name ?? "ThirdPlace",
    slug: config.slug ?? "thirdplace",
    plugins: [
      ...basePlugins,
      [
        "@rnmapbox/maps",
        downloadToken ? { RNMapboxMapsDownloadToken: downloadToken } : {},
      ],
    ],
  };
};
