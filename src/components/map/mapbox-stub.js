// Stub for @rnmapbox/maps used by Metro when EXPO_PUBLIC_MAPBOX_TOKEN is absent
// (Expo Go / web / token-less dev). @rnmapbox/maps imports Fabric native spec
// components that only exist in a native codegen build, so bundling the real
// module in Expo Go fails. MapCanvas never renders these when there is no token;
// this stub just lets Metro bundle cleanly. See metro.config.js.
const Noop = () => null;

module.exports = {
  __esModule: true,
  default: { setAccessToken() {}, StyleURL: { Street: "street" } },
  MapView: Noop,
  Camera: Noop,
  PointAnnotation: Noop,
  MarkerView: Noop,
};
