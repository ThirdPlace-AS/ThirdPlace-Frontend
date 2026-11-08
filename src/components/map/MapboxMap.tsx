import Mapbox, {
  Camera,
  CircleLayer,
  HillshadeLayer,
  Image as MapImage,
  Images,
  LineLayer,
  MapView,
  RasterDemSource,
  ShapeSource,
  StyleImport,
  SymbolLayer,
  UserLocation,
  VectorSource,
} from "@rnmapbox/maps";
import type { FeatureCollection, Point } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, View } from "react-native";

import { MAP_CENTER } from "@/fixtures";
import { PinGlyph } from "@/components/ui";
import { motion, palette } from "@/theme";

import type { MapStylePeriod } from "./mapStyles";
import { markerPaint, pinPaint } from "./pinStyle";
import {
  INDEX_CONTOUR,
  TERRAIN_DEM_URL,
  TERRAIN_VECTOR_URL,
  terrainPaint,
} from "./terrainStyle";
import { clusterZoom, firstViewCamera, selectionZoom } from "./services/bounds";
import { getOrigin } from "@/lib/origin";
import { USER_PUCK } from "./userPuck";
import { allPinGlyphs, markerIcon } from "./services/markerIcon";
import type { DiscoveryItem } from "./types/mapPresentation";

// Real Mapbox map. ONLY required from MapCanvas in a native dev/EAS build with a
// token — never in Expo Go / web. Markers come from MOCK DiscoveryItems. Uses a
// clustered ShapeSource (NV-3, native-verification-outstanding).
if (env_token()) {
  Mapbox.setAccessToken(env_token() as string);
}
function env_token(): string | undefined {
  // Indirected so the lint rule about top-level side effects stays happy.
  return process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
}

// Map pins sit on the basemap, not on the app surface, so they keep the light
// palette in every app theme (paint in pinStyle.ts: white places, ink
// experiences, as in the PDF);
// the basemap itself follows the time of day.
const pin = palette.light as unknown as Record<
  "ink" | "surface" | "onInk" | "ember" | "success" | "warning",
  string
>;

// Every pin glyph image (Phase 19: one per interest, in its category's tone,
// plus the fallbacks), registered once: filtering never re-copies them.
const PIN_IMAGES = allPinGlyphs().map(({ glyph, tone }) => ({
  key: `${glyph}:${tone}`,
  glyph,
  color: tone === "light" ? pin.surface : pin.ink,
}));

// The first map of a session opens nearby (Phase 19, founder 2026-11-08):
// centred on the person (src/lib/origin.ts) with the nearest pins in view;
// it used to fit every marker, which at county scale showed all of Akershus.
// After that the camera stays where the user left it.
let fittedThisSession = false;
// Room for the search bar and mode chips above (the applied-filter chips only
// show once a filter is set, never on the first view) and the browse peek
// below.
const FIT_PADDING = { top: 190, right: 48, bottom: 140, left: 48 };

export function MapboxMap({
  markers,
  selectedMarkerId,
  onSelectMarker,
  recenterSignal,
  recenterZoom = 13,
  center = MAP_CENTER,
  userCoord,
  heading,
  onMapPress,
  focusCoord,
  focusZoomIn = false,
  styleURL,
  lightPreset = "day",
  terrain = false,
  ornamentBottom = 8,
  darkBasemap = false,
}: {
  markers: DiscoveryItem[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (markerId: string) => void;
  recenterSignal?: number;
  recenterZoom?: number;
  center?: [number, number];
  userCoord?: [number, number] | null;
  heading?: number | null;
  onMapPress?: () => void;
  focusCoord?: [number, number] | null;
  /** The pick came from the list or a link (not a pin): zoom in far enough
   *  that its pin leaves the cluster. */
  focusZoomIn?: boolean;
  styleURL?: string;
  /** Light preset of the base map (Kartstil), applied via the basemap config. */
  lightPreset?: MapStylePeriod;
  /** Terreng: hill shading + contour lines over the style. */
  terrain?: boolean;
  /** Distance of the Mapbox logo and ⓘ from the map's bottom edge, so the
   *  browse sheet's peek never covers them (Mapbox attribution terms). */
  ornamentBottom?: number;
  darkBasemap?: boolean;
}) {
  const paint = pinPaint(pin, darkBasemap);
  const relief = terrainPaint(darkBasemap);
  const cameraRef = useRef<Camera>(null);
  const mapRef = useRef<MapView>(null);
  const sourceRef = useRef<ShapeSource>(null);
  // The basemap config (POIs off) mounts once the current style has loaded,
  // and repeats the light preset: the ThirdPlace Studio styles and Mapbox
  // Standard Satellite take dawn/day/dusk/night presets, and a config without
  // lightPreset reset every style to day (the night basemap never showed).
  const [loadedStyle, setLoadedStyle] = useState<string | null>(null);
  const currentStyle = styleURL ?? Mapbox.StyleURL.Street;
  // Where the map opens (then the camera is the user's): north up, flat.
  const [firstView] = useState(() => ({
    centerCoordinate: center,
    zoomLevel: 13,
    heading: 0,
    pitch: 0,
  }));

  // Fly only when asked (Posisjon, an area): the centre at that moment. It
  // used to re-run on every centre change too, and the GPS watch gives the
  // centre a new array on each fix, so after Posisjon the map kept flying
  // back to the user and nothing else could be browsed (found in Phase 16).
  useEffect(() => {
    if (recenterSignal === undefined || recenterSignal === 0) return;
    cameraRef.current?.setCamera({
      centerCoordinate: center,
      zoomLevel: recenterZoom,
      animationMode: "flyTo",
      animationDuration: motion.duration.recenter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterSignal]);

  useEffect(() => {
    if (fittedThisSession || loadedStyle === null) return;
    if (markers.length === 0) return;
    fittedThisSession = true;
    const { width, height } = Dimensions.get("window");
    const cam = firstViewCamera(
      getOrigin().coord,
      markers.map((m) => m.coord),
      { width, height },
      FIT_PADDING,
    );
    cameraRef.current?.setCamera({
      centerCoordinate: cam.center,
      zoomLevel: cam.zoom,
      padding: {
        paddingTop: FIT_PADDING.top,
        paddingRight: FIT_PADDING.right,
        paddingBottom: FIT_PADDING.bottom,
        paddingLeft: FIT_PADDING.left,
      },
      animationDuration: motion.duration.recenter,
    });
  }, [loadedStyle, markers]);

  // The user's position for the puck: the app's own fix (after "Posisjon")
  // or, before that, the native location updates (OS permission granted).
  const [nativeCoord, setNativeCoord] = useState<[number, number] | null>(null);
  const puckCoord = userCoord ?? nativeCoord;
  const puckShape = useMemo<FeatureCollection<Point>>(
    () => ({
      type: "FeatureCollection",
      features: puckCoord
        ? [
            {
              type: "Feature",
              // heading only when known: the wedge layer filters on it.
              properties: heading != null ? { heading } : {},
              geometry: { type: "Point", coordinates: puckCoord },
            },
          ]
        : [],
    }),
    [puckCoord, heading],
  );

  // Selecting a marker pans the camera so the pin sits centered in the map area
  // ABOVE the detail sheet (bottom padding ≈ the peek height), Google-Maps style.
  // A pick from the list or a link also zooms in below street level, so the
  // pin leaves its cluster (Phase 19 S4b); a pin tap keeps the zoom.
  const focusKey = focusCoord ? `${focusCoord[0]},${focusCoord[1]}` : null;
  useEffect(() => {
    if (!focusCoord) return;
    let cancelled = false;
    const go = (zoomLevel?: number) =>
      cameraRef.current?.setCamera({
        centerCoordinate: focusCoord,
        ...(zoomLevel !== undefined ? { zoomLevel } : {}),
        padding: {
          paddingTop: 0,
          paddingBottom: Dimensions.get("window").height * 0.35,
          paddingLeft: 0,
          paddingRight: 0,
        },
        animationDuration: motion.duration.recenter,
      });
    if (!focusZoomIn) {
      go();
      return;
    }
    void (async () => {
      const z = await mapRef.current?.getZoom().catch(() => undefined);
      if (!cancelled) go(selectionZoom(z));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- focusZoomIn is read with the pick
  }, [focusKey, focusCoord]);

  // Each pin: fill by its interest's category, ring by kind, and the
  // interest's glyph (markerIcon) in white or ink, whichever reads on the
  // fill. `rank` (list order) decides which title wins a collision.
  const shape = useMemo(() => {
    const fc: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: markers.map((m, rank) => {
        const glyph = markerIcon(m);
        const look = markerPaint(m, pin);
        const icon = `${glyph}:${look.glyphTone}`;
        return {
          type: "Feature",
          id: m.markerId,
          properties: {
            markerId: m.markerId,
            category: m.category,
            title: m.title,
            icon,
            fill: look.fill,
            ring: look.ring,
            rank,
          },
          geometry: { type: "Point", coordinates: m.coord },
        };
      }),
    };
    return fc;
  }, [markers]);

  // A pin image is a copy of a view; copy again once the glyphs have surely
  // drawn (the yarn glyph is an SVG), so no pin keeps a blank glyph.
  const imageRefs = useRef(new Map<string, { refresh: () => void } | null>());
  useEffect(() => {
    const t = setTimeout(() => {
      imageRefs.current.forEach((r) => r?.refresh());
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      styleURL={currentStyle}
      scaleBarEnabled={false}
      logoPosition={{ bottom: ornamentBottom, left: 8 }}
      attributionPosition={{ bottom: ornamentBottom, left: 92 }}
      // Tap on empty map (a marker tap is consumed by the ShapeSource below and
      // does not fire this) — collapses the sheet + dismisses the keyboard.
      onPress={() => onMapPress?.()}
      // The Studio styles carry the camera they were saved with (bearing
      // 13.6°, pitch 14°), which the map took over on every style load; the
      // reset below opens each style north up and flat. Rotate and tilt
      // gestures stay on (founder 2026-11-07).
      onDidFinishLoadingStyle={() => {
        setLoadedStyle(currentStyle);
        cameraRef.current?.setCamera({
          heading: 0,
          pitch: 0,
          animationDuration: 0,
        });
      }}
    >
      {/* Hide the basemap's own POI icons/labels (hospital crosses, theatre
          masks …): in the same colours as our pins they competed with them
          (review M20). The ThirdPlace Studio styles and Standard Satellite
          import Mapbox Standard as "basemap"; if a style does not, the
          config is ignored. Keyed by style + preset: Satellitt keeps one URL
          for every time of day. */}
      {loadedStyle === currentStyle ? (
        <StyleImport
          key={`${currentStyle}:${lightPreset}`}
          id="basemap"
          existing
          config={{
            showPointOfInterestLabels: false,
            lightPreset,
          }}
        />
      ) : null}
      {/* Terreng: hill shading and contour lines in the style's bottom slot
          (above land and water, under roads, labels and our pins). Re-added
          after every style load, since a new style drops custom layers. */}
      {loadedStyle === currentStyle && terrain ? (
        <RasterDemSource
          key={`dem:${currentStyle}`}
          id="tp-dem"
          url={TERRAIN_DEM_URL}
          tileSize={512}
          maxZoomLevel={14}
        >
          <HillshadeLayer
            id="tp-hillshade"
            slot="bottom"
            style={{
              hillshadeExaggeration: 0.65,
              hillshadeShadowColor: relief.hillShadow,
              hillshadeHighlightColor: relief.hillHighlight,
              hillshadeAccentColor: relief.hillAccent,
            }}
          />
        </RasterDemSource>
      ) : null}
      {loadedStyle === currentStyle && terrain ? (
        <VectorSource
          key={`contours:${currentStyle}`}
          id="tp-contours"
          url={TERRAIN_VECTOR_URL}
        >
          <LineLayer
            id="tp-contour"
            sourceLayerID="contour"
            slot="bottom"
            minZoomLevel={11}
            style={{
              lineColor: relief.contour,
              lineOpacity: [
                "case",
                [">=", ["get", "index"], INDEX_CONTOUR],
                0.75,
                0.4,
              ],
              lineWidth: [
                "case",
                [">=", ["get", "index"], INDEX_CONTOUR],
                1.1,
                0.6,
              ],
            }}
          />
          <SymbolLayer
            id="tp-contour-label"
            sourceLayerID="contour"
            slot="bottom"
            minZoomLevel={13}
            filter={[">=", ["get", "index"], INDEX_CONTOUR]}
            style={{
              symbolPlacement: "line",
              textField: ["concat", ["to-string", ["get", "ele"]], " m"],
              textSize: 10,
              textColor: relief.labelText,
              textHaloColor: relief.labelHalo,
              textHaloWidth: 1,
              textEmissiveStrength: 1,
              textMaxAngle: 30,
            }}
          />
        </VectorSource>
      ) : null}
      {/* The native puck follows each style's light preset (it looked
          different on every basemap), so it only reports the position here;
          the puck itself is our own emissive layers below (userPuck.ts). */}
      <UserLocation
        visible={false}
        minDisplacement={5}
        onUpdate={(l) =>
          setNativeCoord([l.coords.longitude, l.coords.latitude])
        }
      />
      {/* The first view only (defaultSettings). As controlled props, a
          new centre array re-applied the camera: the GPS watch makes one
          per fix, so after Posisjon the map kept jumping back to the user
          (found in Phase 16). Moves go through cameraRef. */}
      <Camera ref={cameraRef} defaultSettings={firstView} />
      <Images>
        <MapImage name="cluster-box">
          <View style={{ width: 44, height: 44 }} />
        </MapImage>
        <MapImage name="user-heading">
          <View
            style={{
              width: 44,
              height: 44,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 6,
                borderRightWidth: 6,
                borderBottomWidth: 9,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderBottomColor: USER_PUCK.dot,
              }}
            />
          </View>
        </MapImage>
        {PIN_IMAGES.map((g) => (
          <MapImage
            key={g.key}
            name={g.key}
            ref={(r) => {
              imageRefs.current.set(g.key, r);
            }}
          >
            <View
              // As wide as the pin circle (r 14): the image is the pin's
              // collision box, which keeps titles off neighbouring pins.
              style={{
                width: 28,
                height: 28,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PinGlyph name={g.glyph} size={16} color={g.color} />
            </View>
          </MapImage>
        ))}
      </Images>
      <ShapeSource
        ref={sourceRef}
        id="discovery"
        shape={shape}
        cluster
        // Only pins that would overlap merge (a pin is ~26 dp wide); at the
        // fitted city view the old 50 px folded whole neighbourhoods.
        clusterRadius={24}
        clusterMaxZoomLevel={15}
        onPress={(e) => {
          const f = e.features?.[0];
          if (!f) return;
          const props = f.properties ?? {};
          if (props.point_count) {
            // Cluster: zoom to where it splits (Phase 19 S4b: from county
            // zoom a fixed 15 jumped past whole towns).
            const coords = (f.geometry as Point | undefined)?.coordinates;
            if (coords) {
              void (async () => {
                const expansion = await sourceRef.current
                  ?.getClusterExpansionZoom(f)
                  .catch(() => undefined);
                const current =
                  expansion === undefined
                    ? await mapRef.current?.getZoom().catch(() => undefined)
                    : undefined;
                cameraRef.current?.setCamera({
                  centerCoordinate: coords as [number, number],
                  zoomLevel: clusterZoom(expansion, current),
                  animationDuration: motion.duration.base,
                });
              })();
            }
          } else if (props.markerId) {
            onSelectMarker?.(String(props.markerId));
          }
        }}
      >
        {/* Invisible enlarged hit target for unclustered points so taps NEAR a
            pin still register (the visible dot is only 8px). ShapeSource.onPress
            hit-tests this layer too. */}
        <CircleLayer
          id="points-hit"
          filter={["!", ["has", "point_count"]]}
          style={{
            circleColor: pin.ink,
            circleRadius: 24,
            circleOpacity: 0,
          }}
        />
        {/* Unclustered points, colored by category. A thick white stroke keeps
            every pin legible on any basemap (light/dark/satellite) — the pin
            color is a fixed per-category value and never derives from the map.
            circleEmissiveStrength:1 makes the pin fully self-lit so the Mapbox
            Standard light preset (day/dusk/night) can't dim it toward the dark
            basemap — without it, circle layers default to emissive 0 and the
            night preset renders them near-black. */}
        <CircleLayer
          id="points"
          filter={["!", ["has", "point_count"]]}
          style={{
            circleColor: paint.pointFill,
            // Small dots when zoomed far out (Phase 19: pins across Akershus),
            // full pins from zoom 11.
            circleRadius: ["interpolate", ["linear"], ["zoom"], 8, 6, 11, 14],
            circleStrokeWidth: [
              "interpolate",
              ["linear"],
              ["zoom"],
              8,
              1.5,
              11,
              2.5,
            ],
            circleStrokeColor: paint.pointStroke,
            circleEmissiveStrength: 1,
          }}
        />
        {/* Per-marker title under each un-clustered pin: ink on a white halo by
            day, light on a dark halo at dusk/night (founder: easier to read at
            night). Self-lit so the light preset never dims it; Mapbox drops a
            title that would collide with another pin or title. */}
        <SymbolLayer
          id="point-title"
          filter={["!", ["has", "point_count"]]}
          // Titles from street level only; earlier they only collide.
          minZoomLevel={13}
          style={{
            // The nearer item (list order) wins a title collision.
            symbolSortKey: ["get", "rank"],
            textField: ["get", "title"],
            textSize: 13,
            textColor: paint.labelText,
            textHaloColor: paint.labelHalo,
            textHaloWidth: 1.5,
            textHaloBlur: 0,
            textEmissiveStrength: 1,
            textAnchor: "top",
            // Below the 19 px selection ring, so a title never sits on the
            // selected pin.
            textOffset: [0, 1.9],
            textAllowOverlap: false,
            textOptional: true,
          }}
        />
        {/* Cluster bubbles, above the titles (placed first, see point-title). */}
        <CircleLayer
          id="clusters"
          filter={["has", "point_count"]}
          style={{
            circleColor: paint.clusterFill,
            circleRadius: [
              "step",
              ["get", "point_count"],
              16,
              10,
              20,
              50,
              24,
              100,
              28,
            ],
            circleStrokeWidth: 3,
            circleStrokeColor: paint.clusterStroke,
            // Fully self-emissive so the Mapbox Standard light preset
            // (day/dusk/night) never dims the bubble — see `points` below.
            circleEmissiveStrength: 1,
          }}
        />
        <SymbolLayer
          id="cluster-count"
          filter={["has", "point_count"]}
          style={{
            textField: ["get", "point_count_abbreviated"],
            textSize: 12,
            textColor: paint.clusterText,
            // Self-lit like the bubble, so dusk/night never dims the count.
            textEmissiveStrength: 1,
            // Always draw the count: label collision dropped it when a pin
            // title ran into the bubble, leaving an empty circle.
            textAllowOverlap: true,
            // An invisible bubble-sized icon claims the bubble's space, so a
            // pin title never draws across a cluster.
            iconImage: "cluster-box",
            iconAllowOverlap: true,
            iconIgnorePlacement: false,
          }}
        />
        {/* The pin's glyph, centred on its circle. Emissive like the circles
            so dusk/night presets never dim it. */}
        <SymbolLayer
          id="point-icon"
          filter={["!", ["has", "point_count"]]}
          // Glyphs from zoom 11, when the pins are full size.
          minZoomLevel={11}
          style={{
            iconImage: ["get", "icon"],
            iconAllowOverlap: true,
            // Pins claim their space, so titles never draw over another pin.
            iconIgnorePlacement: false,
            iconEmissiveStrength: 1,
          }}
        />
        {/* Selected-point highlight ring */}
        <CircleLayer
          id="selected"
          filter={["==", ["get", "markerId"], selectedMarkerId ?? "__none__"]}
          style={{
            circleColor: "transparent",
            circleRadius: 19,
            circleStrokeWidth: 3,
            circleStrokeColor: pin.ember,
            circleEmissiveStrength: 1,
          }}
        />
        {/* The selected pin, its glyph and its title drawn again on top, so
            neighbours never hide them (Phase 19: dense maps). */}
        <CircleLayer
          id="selected-point"
          filter={["==", ["get", "markerId"], selectedMarkerId ?? "__none__"]}
          style={{
            circleColor: paint.pointFill,
            circleRadius: 14,
            circleStrokeWidth: 2.5,
            circleStrokeColor: paint.pointStroke,
            circleEmissiveStrength: 1,
          }}
        />
        <SymbolLayer
          id="selected-icon"
          filter={["==", ["get", "markerId"], selectedMarkerId ?? "__none__"]}
          style={{
            iconImage: ["get", "icon"],
            iconAllowOverlap: true,
            iconIgnorePlacement: true,
            iconEmissiveStrength: 1,
          }}
        />
        <SymbolLayer
          id="selected-title"
          filter={["==", ["get", "markerId"], selectedMarkerId ?? "__none__"]}
          style={{
            textField: ["get", "title"],
            textSize: 13,
            textColor: paint.labelText,
            textHaloColor: paint.labelHalo,
            textHaloWidth: 1.5,
            textHaloBlur: 0,
            textEmissiveStrength: 1,
            textAnchor: "top",
            textOffset: [0, 1.9],
            textAllowOverlap: true,
            textIgnorePlacement: true,
          }}
        />
      </ShapeSource>
      {/* The user's location: the same look on every basemap (fixed
          colours, fully emissive), above the pins. */}
      <ShapeSource id="user-location" shape={puckShape}>
        <CircleLayer
          id="user-halo"
          style={{
            circleColor: USER_PUCK.halo,
            circleOpacity: USER_PUCK.haloOpacity,
            circleRadius: USER_PUCK.haloRadius,
            circlePitchAlignment: "map",
            circleEmissiveStrength: 1,
          }}
        />
        <SymbolLayer
          id="user-heading"
          filter={["has", "heading"]}
          style={{
            iconImage: "user-heading",
            iconRotate: ["get", "heading"],
            iconRotationAlignment: "map",
            iconAllowOverlap: true,
            iconIgnorePlacement: true,
            iconEmissiveStrength: 1,
          }}
        />
        <CircleLayer
          id="user-dot"
          style={{
            circleColor: USER_PUCK.dot,
            circleRadius: USER_PUCK.dotRadius,
            circleStrokeWidth: USER_PUCK.ringWidth,
            circleStrokeColor: USER_PUCK.ring,
            circlePitchAlignment: "map",
            circleEmissiveStrength: 1,
          }}
        />
      </ShapeSource>
    </MapView>
  );
}
