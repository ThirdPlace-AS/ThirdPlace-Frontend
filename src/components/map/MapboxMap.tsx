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

// Pin fill per category (static classes so NativeWind can resolve them).
const categoryPinClass: Record<MockPlace["category"], string> = {
  Kafé: "bg-warning",
  Bokcafé: "bg-success",
  Vinbar: "bg-ember",
  Verksted: "bg-ink",
};

export function MapboxMap({
  places,
  onSelect,
  selectedId,
  recenterSignal,
}: {
  places: MockPlace[];
  onSelect?: (p: MockPlace) => void;
  selectedId?: string | null;
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
      {places.map((p) => {
        const isSelected = p.id === selectedId;
        return (
          <PointAnnotation
            // Key includes selection + openNow so Mapbox re-renders the pin view
            // when those change (PointAnnotation caches its children otherwise).
            key={`${p.id}-${isSelected ? "sel" : "x"}-${p.openNow ? "o" : "c"}`}
            id={p.id}
            coordinate={p.coord}
            onSelected={() => onSelect?.(p)}
          >
            <View
              className={`items-center justify-center rounded-full ${
                categoryPinClass[p.category]
              } ${isSelected ? "h-7 w-7 border-2 border-ember" : "h-5 w-5"} ${
                p.openNow ? "" : "opacity-50"
              }`}
            >
              <View
                className={`rounded-full bg-onInk ${
                  isSelected ? "h-2.5 w-2.5" : "h-2 w-2"
                }`}
              />
            </View>
          </PointAnnotation>
        );
      })}
    </MapView>
  );
}
