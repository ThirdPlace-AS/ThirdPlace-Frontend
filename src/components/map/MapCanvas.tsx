import Constants, { ExecutionEnvironment } from "expo-constants";
import type { ComponentType } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { env } from "@/lib/env";
import { colors } from "@/theme";

import { clusterByGrid, projectToUnit } from "./services/softClustering";
import type { DiscoveryItem } from "./types/mapPresentation";

type MapProps = {
  markers: DiscoveryItem[];
  // markerId of the current selection (highlights its pin).
  selectedMarkerId?: string | null;
  onSelectMarker?: (markerId: string) => void;
  // Bump to recenter the real map on `center` (SoftMap ignores it).
  recenterSignal?: number;
  // Camera center (GPS fix / manual area / demo default). SoftMap ignores it.
  center?: [number, number];
  // The user's real GPS fix (null until granted). SoftMap draws a puck here;
  // the native map uses its own UserLocation and ignores this.
  userCoord?: [number, number] | null;
  // Device facing heading in degrees (0 = north), or null. SoftMap rotates the
  // puck arrow; the native map draws its own heading indicator.
  heading?: number | null;
  // Tap on empty map (not a marker) — collapses selection + dismisses keyboard.
  onMapPress?: () => void;
  // SoftMap only: tapping a multi-item cluster (whose members have no individual
  // target) asks the screen to expand the browse list so every item is reachable.
  onClusterPress?: () => void;
  // Coordinate of the selected marker to pan/center the camera onto (above the
  // detail sheet), Google-Maps style. SoftMap ignores it.
  focusCoord?: [number, number] | null;
  // Mapbox base-map style URL (layer switcher). SoftMap ignores it.
  styleURL?: string;
};

// User-location puck for the SoftMap fallback: an ember dot with a white ring
// at the projected GPS fix, plus a facing-direction arrow when heading is known.
// Only rendered when a real fix exists (never fabricated).
function SoftUserPuck({
  coord,
  heading,
}: {
  coord: [number, number];
  heading: number | null;
}) {
  const { x, y } = projectToUnit(coord);
  return (
    <View
      pointerEvents="none"
      className="absolute items-center justify-center"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: 28,
        height: 28,
        transform: [{ translateX: -14 }, { translateY: -14 }],
      }}
    >
      {heading != null ? (
        // Rotation layer centered on the dot: the arrow orbits to the heading.
        <View
          className="absolute inset-0 items-center"
          style={{ transform: [{ rotate: `${heading}deg` }] }}
        >
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 5,
              borderRightWidth: 5,
              borderBottomWidth: 8,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: colors.ember,
            }}
          />
        </View>
      ) : null}
      <View className="h-4 w-4 rounded-full border-2 border-surface bg-ember" />
    </View>
  );
}

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
function SoftMap({
  markers,
  selectedMarkerId,
  onSelectMarker,
  onMapPress,
  onClusterPress,
  userCoord,
  heading,
}: MapProps) {
  const clusters = clusterByGrid(markers);
  return (
    <View className="h-full w-full">
      {/* Background tap target — sits behind the pins so tapping empty map
          collapses the selection / dismisses the keyboard. Pins are rendered
          after it and capture their own taps. */}
      <Pressable
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        onPress={() => onMapPress?.()}
        className="absolute inset-0"
      />
      <View
        pointerEvents="none"
        className="absolute h-24 w-24 rounded-full bg-success/20"
        style={{ top: 16, left: 24 }}
      />
      <View
        pointerEvents="none"
        className="absolute h-20 w-20 rounded-full bg-ember/10"
        style={{ bottom: 12, right: 28 }}
      />

      {clusters.map((c) => {
        const left = `${c.x * 100}%` as const;
        const top = `${c.y * 100}%` as const;
        if (c.items.length > 1) {
          // 44×44 transparent hit box centered on the coord; the visible badge
          // sits inside it. Cluster members have no individual target, so a tap
          // expands the browse list (onClusterPress) instead of silently picking
          // only the first item.
          return (
            <Pressable
              key={c.key}
              accessibilityRole="button"
              accessibilityLabel={`${c.items.length} steder her — åpne liste`}
              onPress={() => onClusterPress?.()}
              hitSlop={8}
              className="absolute h-11 w-11 items-center justify-center"
              style={{
                left,
                top,
                transform: [{ translateX: -22 }, { translateY: -22 }],
              }}
            >
              <View className="h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-ink">
                <Text className="text-xs font-bold text-onInk">
                  {c.items.length}
                </Text>
              </View>
            </Pressable>
          );
        }
        const item = c.items[0]!;
        const selected = item.markerId === selectedMarkerId;
        // 44×44 transparent hit box centered on the coord so the touch rect
        // aligns with the visible dot (a transformed small box used to miss).
        return (
          <Pressable
            key={c.key}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            accessibilityState={{ selected }}
            onPress={() => onSelectMarker?.(item.markerId)}
            hitSlop={8}
            className="absolute h-11 w-11 items-center justify-center"
            style={{
              left,
              top,
              transform: [{ translateX: -22 }, { translateY: -22 }],
            }}
          >
            <View
              className={`items-center justify-center rounded-full border-2 ${
                selected ? "border-ember" : "border-surface"
              } ${softPinClass[item.category] ?? "bg-ink"} ${
                selected ? "h-7 w-7" : "h-5 w-5"
              }`}
            >
              <View className="h-2 w-2 rounded-full bg-onInk" />
            </View>
            {/* Title label under the pin (un-clustered markers only). The pill
                keeps it legible regardless of the map background. */}
            <View
              pointerEvents="none"
              className="absolute items-center"
              style={{ top: selected ? 32 : 28, left: -40, width: 124 }}
            >
              <Text
                numberOfLines={1}
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.18,
                  shadowRadius: 2,
                  shadowOffset: { width: 0, height: 1 },
                  elevation: 2,
                }}
                className="overflow-hidden rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink"
              >
                {item.title}
              </Text>
            </View>
          </Pressable>
        );
      })}

      {userCoord ? (
        <SoftUserPuck coord={userCoord} heading={heading ?? null} />
      ) : null}
    </View>
  );
}

export function MapCanvas({
  markers,
  selectedMarkerId,
  onSelectMarker,
  recenterSignal,
  center,
  userCoord,
  heading,
  onMapPress,
  onClusterPress,
  focusCoord,
  styleURL,
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
          center={center}
          onMapPress={onMapPress}
          focusCoord={focusCoord}
          styleURL={styleURL}
        />
      ) : (
        <SoftMap
          markers={markers}
          selectedMarkerId={selectedMarkerId}
          onSelectMarker={onSelectMarker}
          onMapPress={onMapPress}
          onClusterPress={onClusterPress}
          userCoord={userCoord}
          heading={heading}
        />
      )}
    </View>
  );
}
