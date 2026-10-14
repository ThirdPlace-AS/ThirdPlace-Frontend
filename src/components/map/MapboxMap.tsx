import Mapbox, {
  Camera,
  CircleLayer,
  MapView,
  ShapeSource,
  SymbolLayer,
} from "@rnmapbox/maps";
import type { FeatureCollection, Point } from "geojson";
import { useEffect, useMemo, useRef } from "react";

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
}: {
  markers: DiscoveryItem[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (markerId: string) => void;
  recenterSignal?: number;
  center?: [number, number];
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

  const shape = useMemo<FeatureCollection<Point>>(
    () => ({
      type: "FeatureCollection",
      features: markers.map((m) => ({
        type: "Feature",
        id: m.markerId,
        properties: { markerId: m.markerId, category: m.category },
        geometry: { type: "Point", coordinates: m.coord },
      })),
    }),
    [markers],
  );

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL={Mapbox.StyleURL.Street}
      scaleBarEnabled={false}
    >
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
            circleStrokeWidth: 2,
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
        {/* Unclustered points, colored by category */}
        <CircleLayer
          id="points"
          filter={["!", ["has", "point_count"]]}
          style={{
            circleColor: PIN_COLOR,
            circleRadius: 8,
            circleStrokeWidth: 2,
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
      </ShapeSource>
    </MapView>
  );
}
