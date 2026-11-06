import Mapbox, {
  Camera,
  CircleLayer,
  Image as MapImage,
  Images,
  MapView,
  ShapeSource,
  StyleImport,
  SymbolLayer,
  UserLocation,
} from "@rnmapbox/maps";
import type { FeatureCollection, Point } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, View } from "react-native";

import { MAP_CENTER } from "@/fixtures";
import { Icon } from "@/components/ui";
import { motion, palette } from "@/theme";

import { periodForUrl } from "./mapStyles";
import { isExperience, pinPaint } from "./pinStyle";
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

export function MapboxMap({
  markers,
  selectedMarkerId,
  onSelectMarker,
  recenterSignal,
  center = MAP_CENTER,
  onMapPress,
  focusCoord,
  styleURL,
  darkBasemap = false,
}: {
  markers: DiscoveryItem[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (markerId: string) => void;
  recenterSignal?: number;
  center?: [number, number];
  onMapPress?: () => void;
  focusCoord?: [number, number] | null;
  styleURL?: string;
  darkBasemap?: boolean;
}) {
  const paint = pinPaint(pin, darkBasemap);
  const cameraRef = useRef<Camera>(null);
  // The basemap config (POIs off) mounts once the current style has loaded,
  // and repeats the style's own light preset: the four ThirdPlace styles are
  // Mapbox Standard with dawn/day/dusk/night presets, and a config without
  // lightPreset reset every style to day (the night basemap never showed).
  const [loadedStyle, setLoadedStyle] = useState<string | null>(null);
  const currentStyle = styleURL ?? Mapbox.StyleURL.Street;

  useEffect(() => {
    if (recenterSignal === undefined || recenterSignal === 0) return;
    cameraRef.current?.setCamera({
      centerCoordinate: center,
      zoomLevel: 13,
      animationDuration: motion.duration.recenter,
    });
  }, [recenterSignal, center]);

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

  // Each pin carries a glyph that matches it (markerIcon). Glyphs render as
  // map images from RN views: ink on the white place pins, white on the ink
  // experience pins (one image per glyph + tone actually on the map).
  const { shape, glyphs } = useMemo(() => {
    const keys = new Map<string, { glyph: MarkerGlyph; dark: boolean }>();
    const fc: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: markers.map((m) => {
        const glyph = markerIcon(m);
        const dark = isExperience(m.category);
        const icon = `${glyph}:${dark ? "on-ink" : "on-white"}`;
        keys.set(icon, { glyph, dark });
        return {
          type: "Feature",
          id: m.markerId,
          properties: {
            markerId: m.markerId,
            category: m.category,
            title: m.title,
            icon,
          },
          geometry: { type: "Point", coordinates: m.coord },
        };
      }),
    };
    return { shape: fc, glyphs: [...keys.entries()] };
  }, [markers]);

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL={currentStyle}
      scaleBarEnabled={false}
      // Tap on empty map (a marker tap is consumed by the ShapeSource below and
      // does not fire this) — collapses the sheet + dismisses the keyboard.
      onPress={() => onMapPress?.()}
      onDidFinishLoadingStyle={() => setLoadedStyle(currentStyle)}
    >
      {/* Hide the basemap's own POI icons/labels (hospital crosses, theatre
          masks …): in the same colours as our pins they competed with them
          (review M20). The ThirdPlace Studio styles import Mapbox Standard as
          "basemap"; if a style does not, the config is ignored. */}
      {loadedStyle === currentStyle ? (
        <StyleImport
          key={currentStyle}
          id="basemap"
          existing
          config={{
            showPointOfInterestLabels: false,
            lightPreset: periodForUrl(currentStyle),
          }}
        />
      ) : null}
      {/* User-location puck — visible whenever OS location permission is granted.
          showsUserHeadingIndicator draws the native facing-direction cone. */}
      <UserLocation
        visible
        showsUserHeadingIndicator
        androidRenderMode="normal"
      />
      <Camera
        ref={cameraRef}
        zoomLevel={13}
        centerCoordinate={center}
        animationDuration={0}
      />
      <Images>
        {glyphs.map(([key, g]) => (
          <MapImage key={key} name={key}>
            <View
              style={{
                width: 18,
                height: 18,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                name={g.glyph}
                size="sm"
                color={g.dark ? pin.onInk : pin.ink}
              />
            </View>
          </MapImage>
        ))}
      </Images>
      <ShapeSource
        id="discovery"
        shape={shape}
        cluster
        clusterRadius={50}
        clusterMaxZoomLevel={16}
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
        {/* Cluster bubbles */}
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
            // Always draw the count: label collision dropped it when a pin
            // title ran into the bubble, leaving an empty circle.
            textAllowOverlap: true,
            textIgnorePlacement: true,
          }}
        />
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
        {/* The pin's glyph, centred on its circle. Emissive like the circles
            so dusk/night presets never dim it. */}
        <SymbolLayer
          id="point-icon"
          filter={["!", ["has", "point_count"]]}
          style={{
            iconImage: ["get", "icon"],
            iconAllowOverlap: true,
            iconIgnorePlacement: true,
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
        {/* Per-marker title under each un-clustered pin. White halo keeps it
            legible on any basemap; Mapbox declutters overlaps automatically. */}
        <SymbolLayer
          id="point-title"
          filter={["!", ["has", "point_count"]]}
          style={{
            textField: ["get", "title"],
            textSize: 12,
            // Dark ink text inside a thick white halo stays readable on ANY
            // basemap — including a dark/night map, where the halo forms a bright
            // outline around every glyph.
            textColor: pin.ink,
            textHaloColor: pin.surface,
            textHaloWidth: 2,
            textHaloBlur: 0.5,
            textAnchor: "top",
            // Below the 19 px selection ring, so a title never sits on the
            // selected pin.
            textOffset: [0, 1.9],
            textAllowOverlap: false,
            textOptional: true,
          }}
        />
      </ShapeSource>
    </MapView>
  );
}
