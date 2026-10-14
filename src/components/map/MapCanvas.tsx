import Constants, { ExecutionEnvironment } from "expo-constants";
import type { ComponentType } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { env } from "@/lib/env";

import { clusterByGrid } from "./services/softClustering";
import type { DiscoveryItem } from "./types/mapPresentation";

type MapProps = {
  markers: DiscoveryItem[];
  // markerId of the current selection (highlights its pin).
  selectedMarkerId?: string | null;
  onSelectMarker?: (markerId: string) => void;
  // Bump to recenter the real map on the MOCK demo location (SoftMap ignores it).
  recenterSignal?: number;
};

// Native availability and token presence are SEPARATE concerns (see the long note
// retained from the original): the native @rnmapbox module is only present in a
// native build with EXPO_PUBLIC_USE_NATIVE_MAP=1; the pk token only decides
// whether tiles render. Missing token still falls back to SoftMap, never crashes.
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

// Category → dot color (tailwind classes so NativeWind can resolve them).
const softPinClass: Record<string, string> = {
  Kafé: "bg-warning",
  Bokcafé: "bg-success",
  Vinbar: "bg-ember",
  Verksted: "bg-ink",
  Opplevelse: "bg-ember",
};

// Pastel placeholder shown when the real map is unavailable. It plots MOCK marker
// dots + grid-bucketed cluster badges so the discovery surface is explorable in
// Expo Go / web. NOT authoritative geodata.
function SoftMap({ markers, selectedMarkerId, onSelectMarker }: MapProps) {
  const clusters = clusterByGrid(markers);
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

      {clusters.map((c) => {
        const left = `${c.x * 100}%` as const;
        const top = `${c.y * 100}%` as const;
        if (c.items.length > 1) {
          return (
            <Pressable
              key={c.key}
              accessibilityRole="button"
              accessibilityLabel={`${c.items.length} steder her`}
              onPress={() => onSelectMarker?.(c.items[0]!.markerId)}
              className="absolute h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-ink"
              style={{
                left,
                top,
                transform: [{ translateX: -16 }, { translateY: -16 }],
              }}
            >
              <Text className="text-xs font-bold text-onInk">
                {c.items.length}
              </Text>
            </Pressable>
          );
        }
        const item = c.items[0]!;
        const selected = item.markerId === selectedMarkerId;
        return (
          <Pressable
            key={c.key}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            accessibilityState={{ selected }}
            onPress={() => onSelectMarker?.(item.markerId)}
            className={`absolute items-center justify-center rounded-full border-2 ${
              selected ? "border-ember" : "border-surface"
            } ${softPinClass[item.category] ?? "bg-ink"} ${
              selected ? "h-7 w-7" : "h-5 w-5"
            }`}
            style={{
              left,
              top,
              transform: [{ translateX: -14 }, { translateY: -14 }],
            }}
          >
            <View className="h-2 w-2 rounded-full bg-onInk" />
          </Pressable>
        );
      })}

      <View
        className="absolute bottom-1 self-center"
        pointerEvents="none"
        style={{ left: 0, right: 0 }}
      >
        <Text className="text-center text-[10px] text-muted">
          Kartvisning (dev-build)
        </Text>
      </View>
    </View>
  );
}

export function MapCanvas({
  markers,
  selectedMarkerId,
  onSelectMarker,
  recenterSignal,
  height = 160,
  fill = false,
}: MapProps & { height?: number; fill?: boolean }) {
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
          markers={markers}
          selectedMarkerId={selectedMarkerId}
          onSelectMarker={onSelectMarker}
          recenterSignal={recenterSignal}
        />
      ) : (
        <SoftMap
          markers={markers}
          selectedMarkerId={selectedMarkerId}
          onSelectMarker={onSelectMarker}
        />
      )}
    </View>
  );
}
