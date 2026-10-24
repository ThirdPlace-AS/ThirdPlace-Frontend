import Mapbox, {
  Camera,
  CircleLayer,
  MapView,
  ShapeSource,
  SymbolLayer,
  UserLocation,
} from "@rnmapbox/maps";
import type { FeatureCollection, Point } from "geojson";
import { useEffect, useMemo, useRef } from "react";
import { Dimensions } from "react-native";

import { MAP_CENTER } from "@/fixtures";
import { colors, motion } from "@/theme";

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

// Category → pin color (hex, since Mapbox style expressions can't use classes).
const PIN_COLOR = [
  "match",
  ["get", "category"],
  "Kafé",
  colors.warning,
  "Bokcafé",
  colors.success,
  "Vinbar",
  colors.ember,
  "Verksted",
  colors.ink,
  "Opplevelse",
  colors.ember,
  colors.ink, // default
] as unknown as string;

export function MapboxMap({
  markers,
  selectedMarkerId,
  onSelectMarker,
  recenterSignal,
  center = MAP_CENTER,
  onMapPress,
  focusCoord,
  styleURL,
}: {
  markers: DiscoveryItem[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (markerId: string) => void;
  recenterSignal?: number;
  center?: [number, number];
  onMapPress?: () => void;
  focusCoord?: [number, number] | null;
  styleURL?: string;
}) {
  const cameraRef = useRef<Camera>(null);

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

  const shape = useMemo<FeatureCollection<Point>>(
    () => ({
      type: "FeatureCollection",
      features: markers.map((m) => ({
        type: "Feature",
        id: m.markerId,
        properties: {
          markerId: m.markerId,
          category: m.category,
          title: m.title,
        },
        geometry: { type: "Point", coordinates: m.coord },
      })),
    }),
    [markers],
  );

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL={styleURL ?? Mapbox.StyleURL.Street}
      scaleBarEnabled={false}
      // Tap on empty map (a marker tap is consumed by the ShapeSource below and
      // does not fire this) — collapses the sheet + dismisses the keyboard.
      onPress={() => onMapPress?.()}
    >
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
            circleColor: colors.ink,
            circleRadius: ["step", ["get", "point_count"], 16, 5, 20, 10, 26],
            circleStrokeWidth: 3,
            circleStrokeColor: colors.surface,
          }}
        />
        <SymbolLayer
          id="cluster-count"
          filter={["has", "point_count"]}
          style={{
            textField: ["get", "point_count_abbreviated"],
            textSize: 12,
            textColor: colors.onInk,
          }}
        />
        {/* Invisible enlarged hit target for unclustered points so taps NEAR a
            pin still register (the visible dot is only 8px). ShapeSource.onPress
            hit-tests this layer too. */}
        <CircleLayer
          id="points-hit"
          filter={["!", ["has", "point_count"]]}
          style={{
            circleColor: colors.ink,
            circleRadius: 20,
            circleOpacity: 0,
          }}
        />
        {/* Unclustered points, colored by category. A thick white stroke keeps
            every pin legible on any basemap (light/dark/satellite) — the pin
            color is a fixed per-category value and never derives from the map. */}
        <CircleLayer
          id="points"
          filter={["!", ["has", "point_count"]]}
          style={{
            circleColor: PIN_COLOR,
            circleRadius: 8,
            circleStrokeWidth: 3,
            circleStrokeColor: colors.surface,
          }}
        />
        {/* Selected-point highlight ring */}
        <CircleLayer
          id="selected"
          filter={["==", ["get", "markerId"], selectedMarkerId ?? "__none__"]}
          style={{
            circleColor: "transparent",
            circleRadius: 13,
            circleStrokeWidth: 3,
            circleStrokeColor: colors.ember,
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
            textColor: colors.ink,
            textHaloColor: colors.surface,
            textHaloWidth: 2,
            textHaloBlur: 0.5,
            textAnchor: "top",
            textOffset: [0, 0.9],
            textAllowOverlap: false,
            textOptional: true,
          }}
        />
      </ShapeSource>
    </MapView>
  );
}
