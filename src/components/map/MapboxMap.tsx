import Mapbox, { Camera, MapView, PointAnnotation } from "@rnmapbox/maps";
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
}: {
  places: MockPlace[];
  onSelect?: (p: MockPlace) => void;
}) {
  return (
    <MapView
      style={{ flex: 1 }}
      styleURL={Mapbox.StyleURL.Street}
      scaleBarEnabled={false}
    >
      <Camera
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
