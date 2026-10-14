// Stub for @rnmapbox/maps used by Metro when the native map is not active
// (Expo Go / web / token-less dev). @rnmapbox/maps imports Fabric native spec
// components that only exist in a native codegen build, so bundling the real
// module there fails. MapCanvas never renders these without the native flag;
// this stub just lets Metro bundle cleanly. See metro.config.js.
const Noop = () => null;

module.exports = {
  __esModule: true,
  default: { setAccessToken() {}, StyleURL: { Street: "street" } },
  MapView: Noop,
  Camera: Noop,
  PointAnnotation: Noop,
  MarkerView: Noop,
  ShapeSource: Noop,
  CircleLayer: Noop,
  SymbolLayer: Noop,
  Images: Noop,
};
