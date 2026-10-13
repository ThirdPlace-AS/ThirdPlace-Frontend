import Mapbox, { Camera, MapView, PointAnnotation } from "@rnmapbox/maps";
import { useEffect, useRef } from "react";
import { View } from "react-native";

import { MAP_CENTER, type MockPlace } from "@/fixtures";
import { env } from "@/lib/env";

// Real Mapbox map. This module is ONLY required from MapCanvas when running in a
// native dev/EAS build with a token — never in Expo Go or on web (so the native
// module is never evaluated there). Markers come from MOCK fixtures.
if (env.mapboxToken) {
  Mapbox.setAccessToken(env.mapboxToken);
}

export function MapboxMap({
  places,
  onSelect,
  recenterSignal,
}: {
  places: MockPlace[];
  onSelect?: (p: MockPlace) => void;
  // Incremented by the screen to recenter on the MOCK demo location. There is no
  // real GPS (fixtures-only) — this animates the camera back to MAP_CENTER.
  recenterSignal?: number;
}) {
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    if (recenterSignal === undefined || recenterSignal === 0) return;
    cameraRef.current?.setCamera({
      centerCoordinate: MAP_CENTER,
      zoomLevel: 13,
      animationDuration: 500,
    });
  }, [recenterSignal]);

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL={Mapbox.StyleURL.Street}
      scaleBarEnabled={false}
    >
      <Camera
        ref={cameraRef}
        zoomLevel={13}
        centerCoordinate={MAP_CENTER}
        animationDuration={0}
      />
      {places.map((p) => (
        <PointAnnotation
          key={p.id}
          id={p.id}
          coordinate={p.coord}
          onSelected={() => onSelect?.(p)}
        >
          <View className="h-5 w-5 items-center justify-center rounded-full bg-ink">
            <View className="h-2 w-2 rounded-full bg-onInk" />
          </View>
        </PointAnnotation>
      ))}
    </MapView>
  );
}
