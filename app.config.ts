import type { ConfigContext, ExpoConfig } from "expo/config";

// Extends the static app.json config. The ONLY dynamic bit is the Mapbox native
// SDK download token, read from the environment at build time (never committed).
// Set MAPBOX_DOWNLOADS_TOKEN (a secret sk.* token) in your shell / the EAS
// environment before a native build. With @rnmapbox/maps 10.3.8 the Gradle
// download auth is optional, so a build may succeed without it. What decides
// whether the running app shows the native map is EXPO_PUBLIC_MAPBOX_TOKEN (the
// public pk.* token, inlined at bundle time through src/lib/env.ts): without it
// the app falls back to the SoftMap. `.env.*` files never reach EAS, so an EAS
// build needs both in the EAS environment its profile names (eas.json).
export default ({ config }: ConfigContext): ExpoConfig => {
  // SECURITY: the download token is used ONLY as a native-build plugin input
  // (Gradle Maven auth / Pods). It is never written to `extra`, never exposed as
  // an EXPO_PUBLIC_* var, and so never inlined into the JS bundle. Do not read it
  // from src/lib/env.ts or copy it into `extra`.
  // The current @rnmapbox/maps reads the download token from the
  // RNMAPBOX_MAPS_DOWNLOAD_TOKEN env var (the plugin-option form is deprecated
  // and warns that it would be written to gradle.properties). We keep
  // MAPBOX_DOWNLOADS_TOKEN as the single documented source and map it onto the
  // env var the plugin expects, without overriding an explicitly-set one.
  const downloadToken = process.env.MAPBOX_DOWNLOADS_TOKEN;
  if (downloadToken && !process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN) {
    process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN = downloadToken;
  }

  const basePlugins = (config.plugins ?? []).filter(
    (p) => (Array.isArray(p) ? p[0] : p) !== "@rnmapbox/maps",
  );

  return {
    ...config,
    name: config.name ?? "ThirdPlace",
    slug: config.slug ?? "thirdplace",
    // No download-token plugin option (deprecated); the plugin picks up the env
    // var set above at build time. Still native-build-only — never in the bundle.
    plugins: [...basePlugins, "@rnmapbox/maps"],
  };
};
