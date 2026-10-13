import Constants, { ExecutionEnvironment } from "expo-constants";
import type { ComponentType } from "react";
import { Platform, Text, View } from "react-native";

import type { MockPlace } from "@/fixtures";
import { env } from "@/lib/env";

type MapProps = { places: MockPlace[]; onSelect?: (p: MockPlace) => void };

// Expo Go reports executionEnvironment "storeClient" — the Mapbox native module
// is not present there, nor on web. We only load the real map in a native
// dev/standalone build that also has a token. Otherwise we show a SoftMap
// placeholder. The require is gated so @rnmapbox/maps is never evaluated in
// Expo Go / web (avoids a native-module crash).
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const canUseMapbox = Platform.OS !== "web" && !isExpoGo && !!env.mapboxToken;

let RealMap: ComponentType<MapProps> | null = null;
if (canUseMapbox) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    RealMap = require("./MapboxMap").MapboxMap as ComponentType<MapProps>;
  } catch {
    RealMap = null;
  }
}

// Pastel placeholder shown when the real map is unavailable (Expo Go, web, or no
// token). It is a visual fixture, NOT authoritative geodata.
function SoftMap() {
  return (
    <View className="h-full w-full">
      <View
        className="absolute h-24 w-24 rounded-full bg-success/20"
        style={{ top: 16, left: 24 }}
      />
      <View
        className="absolute h-20 w-20 rounded-full bg-ember/10"
        style={{ bottom: 12, right: 28 }}
      />
      <View className="flex-1 items-center justify-center gap-1">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-ink">
          <View className="h-2.5 w-2.5 rounded-full bg-onInk" />
        </View>
        <Text className="text-[10px] text-muted">Kartvisning (dev-build)</Text>
      </View>
    </View>
  );
}

export function MapCanvas({
  places,
  onSelect,
  height = 160,
}: MapProps & { height?: number }) {
  return (
    <View
      className="overflow-hidden rounded-lg border border-line bg-surfaceMuted"
      style={{ height }}
    >
      {RealMap ? <RealMap places={places} onSelect={onSelect} /> : <SoftMap />}
    </View>
  );
}
