import Mapbox, {
  Camera,
  CameraGestureObserver,
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
import { Icon } from "@/components/ui";
import { motion, palette } from "@/theme";

import type { MapStylePeriod } from "./mapStyles";
import { markerPaint, pinPaint } from "./pinStyle";
import {
  INDEX_CONTOUR,
  TERRAIN_DEM_URL,
  TERRAIN_VECTOR_URL,
  terrainPaint,
} from "./terrainStyle";
import { areaFromCorners, boundsOf, type MapArea } from "./services/bounds";
import { USER_PUCK } from "./userPuck";
import { markerIcon, type MarkerGlyph } from "./services/markerIcon";
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

// The first map of a session fits every marker on screen (founder: "all
// places and experiences need to be shown"); after that the camera stays
// where the user left it.
let fittedThisSession = false;
// Room for the search bar + mode chips above and the browse peek below.
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
  styleURL,
  lightPreset = "day",
  terrain = false,
  ornamentBottom = 8,
  darkBasemap = false,
  onCameraSettled,
  obscured,
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
  styleURL?: string;
  /** Light preset of the base map (Kartstil), applied via the basemap config. */
  lightPreset?: MapStylePeriod;
  /** Terreng: hill shading + contour lines over the style. */
  terrain?: boolean;
  /** Distance of the Mapbox logo and ⓘ from the map's bottom edge, so the
   *  browse sheet's peek never covers them (Mapbox attribution terms). */
  ornamentBottom?: number;
  darkBasemap?: boolean;
  /** The map came to rest: the area it shows, and whether the user moved
   *  it (pan or pinch) or the app did ("Søk i dette området"). */
  onCameraSettled?: (area: MapArea, byUser: boolean) => void;
  /** Bands of the map the screen covers (dp): the top controls and the
   *  browse peek. The settled area is what lies between them. */
  obscured?: { top: number; bottom: number };
}) {
  const paint = pinPaint(pin, darkBasemap);
  const mapRef = useRef<MapView>(null);
  // The map's size in dp, for the corners of the part the user sees.
  const size = useRef({ w: 0, h: 0 });
  // The map between the covered bands, from its two corners (the map is
  // north up and flat, so they span a true rectangle). getVisibleBounds
  // would include the bands under the top controls and the browse peek.
  const readVisibleArea = async (): Promise<MapArea | null> => {
    const map = mapRef.current;
    const { w, h } = size.current;
    if (!map || w === 0 || h === 0) return null;
    const top = Math.min(Math.max(obscured?.top ?? 0, 0), h / 2);
    const bottom = Math.max(h - Math.max(obscured?.bottom ?? 0, 0), top + 1);
    const [nw, se] = await Promise.all([
      map.getCoordinateFromView([0, top]),
      map.getCoordinateFromView([w, bottom]),
    ]);
    return areaFromCorners([nw, se]);
  };
  const relief = terrainPaint(darkBasemap);
  const cameraRef = useRef<Camera>(null);
  // The basemap config (POIs off) mounts once the current style has loaded,
  // and repeats the light preset: the ThirdPlace Studio styles and Mapbox
  // Standard Satellite take dawn/day/dusk/night presets, and a config without
  // lightPreset reset every style to day (the night basemap never showed).
  const [loadedStyle, setLoadedStyle] = useState<string | null>(null);
  const currentStyle = styleURL ?? Mapbox.StyleURL.Street;

  useEffect(() => {
    if (recenterSignal === undefined || recenterSignal === 0) return;
    cameraRef.current?.setCamera({
      centerCoordinate: center,
      zoomLevel: recenterZoom,
      animationMode: "flyTo",
      animationDuration: motion.duration.recenter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterSignal, center]);

  useEffect(() => {
    if (fittedThisSession || loadedStyle === null) return;
    const bounds = boundsOf(markers.map((m) => m.coord));
    if (!bounds) return;
    fittedThisSession = true;
    cameraRef.current?.fitBounds(
      bounds[0],
      bounds[1],
      [
        FIT_PADDING.top,
        FIT_PADDING.right,
        FIT_PADDING.bottom,
        FIT_PADDING.left,
      ],
      motion.duration.recenter,
    );
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
  const focusKey = focusCoord ? `${focusCoord[0]},${focusCoord[1]}` : null;
  useEffect(() => {
    if (!focusCoord) return;
    cameraRef.current?.setCamera({
      centerCoordinate: focusCoord,
      padding: {
        paddingTop: 0,
        paddingBottom: Dimensions.get("window").height * 0.35,
        paddingLeft: 0,
        paddingRight: 0,
      },
      animationDuration: motion.duration.recenter,
    });
  }, [focusKey, focusCoord]);

  // Each pin: fill by marker category, ring by kind, and a glyph that
  // matches it (markerIcon) in white or ink, whichever reads on the fill.
  // Glyphs render as map images from RN views (one per glyph + tone on the map).
  const { shape, glyphs } = useMemo(() => {
    const keys = new Map<string, { glyph: MarkerGlyph; color: string }>();
    const fc: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: markers.map((m) => {
        const glyph = markerIcon(m);
        const look = markerPaint(m, pin);
        const icon = `${glyph}:${look.glyphTone}`;
        keys.set(icon, { glyph, color: look.glyph });
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
          },
          geometry: { type: "Point", coordinates: m.coord },
        };
      }),
    };
    return { shape: fc, glyphs: [...keys.entries()] };
  }, [markers]);

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        size.current = { w: width, h: height };
      }}
    >
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
        // North up and flat, like the other discovery maps (Airbnb): no
        // rotate or tilt gestures, and no compass to undo them. The Studio
        // styles also carry the camera they were saved with (bearing 13.6°,
        // pitch 14°), which the map took over on style load; the reset below
        // undoes it. A flat, north-up map is also what makes the corners of
        // "Søk i dette området" a true rectangle.
        rotateEnabled={false}
        pitchEnabled={false}
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
        {/* Tells a pan or pinch by the user (lastGestureType) from the app's
          own camera moves, once the map has been still for a moment. */}
        {onCameraSettled ? (
          <CameraGestureObserver
            quietPeriodMs={250}
            onMapSteady={(e) => {
              if (e.nativeEvent.reason !== "steady") return;
              const byUser = !!e.nativeEvent.lastGestureType;
              readVisibleArea()
                .then((area) => {
                  if (area) onCameraSettled(area, byUser);
                })
                .catch(() => undefined);
            }}
          />
        ) : null}
        <Camera
          ref={cameraRef}
          zoomLevel={13}
          centerCoordinate={center}
          heading={0}
          pitch={0}
          animationDuration={0}
        />
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
          {glyphs.map(([key, g]) => (
            <MapImage key={key} name={key}>
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
                <Icon name={g.glyph} size="sm" color={g.color} />
              </View>
            </MapImage>
          ))}
        </Images>
        <ShapeSource
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
              // Cluster: zoom toward it.
              const coords = (f.geometry as Point | undefined)?.coordinates;
              if (coords) {
                cameraRef.current?.setCamera({
                  centerCoordinate: coords as [number, number],
                  zoomLevel: 15,
                  animationDuration: motion.duration.base,
                });
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
              circleRadius: 14,
              circleStrokeWidth: 2.5,
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
            style={{
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
              circleRadius: ["step", ["get", "point_count"], 16, 5, 20, 10, 26],
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
    </View>
  );
}
