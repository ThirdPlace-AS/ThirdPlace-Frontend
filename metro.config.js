// Learn more: https://docs.expo.dev/guides/customizing-metro/
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// @rnmapbox/maps imports Fabric native-spec components that only exist in a
// native codegen build. In Expo Go / web / token-less dev there is no native
// map, so we alias @rnmapbox/maps to a harmless stub to keep Metro bundling.
// When EXPO_PUBLIC_MAPBOX_TOKEN is set (a real dev/EAS build), the real module
// is used. MapCanvas only renders the real map when a token is present.
const hasMapboxToken = !!process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
if (!hasMapboxToken) {
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
