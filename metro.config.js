// Learn more: https://docs.expo.dev/guides/customizing-metro/
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// @rnmapbox/maps imports Fabric native-spec components that only exist in a
// native codegen build. In Expo Go / web there is no native map, so we alias
// @rnmapbox/maps to a harmless stub to keep Metro bundling.
//
// The stub decision is gated on an EXPLICIT native-build flag, NOT on the public
// access token. Metro runs at bundle time and cannot detect Expo Go, and a dev
// may set EXPO_PUBLIC_MAPBOX_TOKEN just to preview tiles — that must never cause
// the real native module to be bundled into an Expo Go session (it would crash
// on the Fabric spec import). Native availability and token presence are
// separate concerns (see docs/map/MAPBOX_INTEGRATION.md).
//
// Set EXPO_PUBLIC_USE_NATIVE_MAP=1 only for a native dev/EAS build (where the
// module is compiled in). Default (unset) keeps the safe stub path for Expo Go,
// web, and CI export smoke.
const useNativeMap = process.env.EXPO_PUBLIC_USE_NATIVE_MAP === "1";
if (!useNativeMap) {
  const stub = path.resolve(__dirname, "src/components/map/mapbox-stub.js");
  const previous = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (
      moduleName === "@rnmapbox/maps" ||
      moduleName.startsWith("@rnmapbox/maps/")
    ) {
      return { type: "sourceFile", filePath: stub };
    }
    return (previous ?? context.resolveRequest)(context, moduleName, platform);
  };
}

module.exports = withNativeWind(config, { input: "./global.css" });
