import Constants, { ExecutionEnvironment } from "expo-constants";
import type { ComponentType } from "react";
import { Platform, Text, View } from "react-native";

import type { MockPlace } from "@/fixtures";
import { env } from "@/lib/env";

type MapProps = {
  places: MockPlace[];
  onSelect?: (p: MockPlace) => void;
  // Bump to recenter the real map on the MOCK demo location (ignored by SoftMap).
  recenterSignal?: number;
};

// Native availability and token presence are SEPARATE concerns:
//   - nativeMapAvailable: the @rnmapbox/maps native module is compiled in. True
//     only in a native dev/standalone build (EXPO_PUBLIC_USE_NATIVE_MAP=1, the
//     same flag that keeps the real module in the Metro bundle), never in Expo
//     Go (executionEnvironment "storeClient") or on web.
//   - env.mapboxToken: the public pk.* token needed to actually render tiles.
// The require is gated on nativeMapAvailable so @rnmapbox/maps is never evaluated
// in Expo Go / web (avoids a native-module crash). When the native module is
// available but the token is missing we still fall back to SoftMap — we never
// crash on a missing token.
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const nativeMapAvailable =
  Platform.OS !== "web" &&
  !isExpoGo &&
  process.env.EXPO_PUBLIC_USE_NATIVE_MAP === "1";
const canUseMapbox = nativeMapAvailable && !!env.mapboxToken;

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
  recenterSignal,
  height = 160,
  fill = false,
}: MapProps & { height?: number; fill?: boolean }) {
  // `fill` => edge-to-edge (full-screen map tab): fill the parent, no rounding
  // or border. Default => a bordered, rounded, fixed-height card.
  return (
    <View
      className={
        fill
          ? "flex-1 bg-surfaceMuted"
          : "overflow-hidden rounded-lg border border-line bg-surfaceMuted"
      }
      style={fill ? undefined : { height }}
    >
      {RealMap ? (
        <RealMap
          places={places}
          onSelect={onSelect}
          recenterSignal={recenterSignal}
        />
      ) : (
        <SoftMap />
      )}
    </View>
  );
}
