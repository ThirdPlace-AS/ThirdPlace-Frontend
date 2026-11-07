import Constants, { ExecutionEnvironment } from "expo-constants";
import type { ComponentType } from "react";
import { Platform, Pressable, View } from "react-native";

import { env } from "@/lib/env";
import { elevation, palette } from "@/theme";

import type { MapStylePeriod } from "./mapStyles";
import type { AreaReader } from "./services/bounds";
import { clusterByGrid, projectToUnit } from "./services/softClustering";
import type { DiscoveryItem } from "./types/mapPresentation";
import { markerPaint } from "./pinStyle";
import { USER_PUCK } from "./userPuck";
import { markerIcon } from "./services/markerIcon";
import { Icon, Text } from "@/components/ui";

// Pins sit on the map, not the app surface: the light palette in every theme
// (as the native pins), category fills from pinStyle.
const PIN = palette.light as unknown as {
  ink: string;
  surface: string;
  onInk: string;
  ember: string;
};

type MapProps = {
  markers: DiscoveryItem[];
  // markerId of the current selection (highlights its pin).
  selectedMarkerId?: string | null;
  onSelectMarker?: (markerId: string) => void;
  // Bump to recenter the real map on `center` (SoftMap ignores it).
  recenterSignal?: number;
  // Zoom for that recenter (15 = fly to the user, 13 = an area).
  recenterZoom?: number;
  // Camera center (GPS fix / manual area / demo default). SoftMap ignores it.
  center?: [number, number];
  // The user's real GPS fix (null until granted). Both maps draw the same
  // puck (userPuck.ts); the native map also follows its own location updates.
  userCoord?: [number, number] | null;
  // Device facing heading in degrees (0 = north), or null: the puck's wedge.
  heading?: number | null;
  // Tap on empty map (not a marker) — collapses selection + dismisses keyboard.
  onMapPress?: () => void;
  // SoftMap only: tapping a multi-item cluster (whose members have no individual
  // target) asks the screen to expand the browse list so every item is reachable.
  onClusterPress?: () => void;
  // Coordinate of the selected marker to pan/center the camera onto (above the
  // detail sheet), Google-Maps style. SoftMap ignores it.
  focusCoord?: [number, number] | null;
  // Mapbox base-map style URL (Kartlag). SoftMap ignores it.
  styleURL?: string;
  // Kartstil light preset and Terreng overlays (Kartlag). SoftMap ignores them.
  lightPreset?: MapStylePeriod;
  terrain?: boolean;
  // Bottom offset of the Mapbox logo + ⓘ (above the browse peek).
  ornamentBottom?: number;
  // True while the native basemap is dark (Satellitt, dusk, night): clusters
  // and titles flip so they stay visible (pinStyle.ts). SoftMap follows the
  // theme.
  darkBasemap?: boolean;
  // The user moved the native map and it came to rest; the reader gives the
  // part of the map on screen. SoftMap has no camera, so neither is used.
  onUserMoved?: () => void;
  areaReaderRef?: { current: AreaReader | null };
  // Bands the screen covers (top controls, browse peek), in dp.
  obscured?: { top: number; bottom: number };
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
  const box = USER_PUCK.haloRadius * 2;
  const dot = (USER_PUCK.dotRadius + USER_PUCK.ringWidth) * 2;
  return (
    <View
      pointerEvents="none"
      className="absolute items-center justify-center"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: box,
        height: box,
        transform: [{ translateX: -box / 2 }, { translateY: -box / 2 }],
      }}
    >
      {/* Same look as the native puck: halo, white ring, ember dot. */}
      <View
        className="absolute"
        style={{
          width: box,
          height: box,
          borderRadius: box / 2,
          backgroundColor: USER_PUCK.halo,
          opacity: USER_PUCK.haloOpacity,
        }}
      />
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
              borderBottomColor: USER_PUCK.dot,
            }}
          />
        </View>
      ) : null}
      <View
        style={{
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: USER_PUCK.dot,
          borderWidth: USER_PUCK.ringWidth,
          borderColor: USER_PUCK.ring,
        }}
      />
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
/** True when the Mapbox basemap renders (native build + token). */
export const canUseMapbox = nativeMapAvailable && !!env.mapboxToken;

let RealMap: ComponentType<MapProps> | null = null;
if (canUseMapbox) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    RealMap = require("./MapboxMap").MapboxMap as ComponentType<MapProps>;
  } catch {
    RealMap = null;
  }
}

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
              accessibilityLabel={`${c.items.length} steder her. Åpne listen.`}
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
                <Text variant="caption" weight="bold" tone="onInk">
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
                selected ? "h-10 w-10" : "h-8 w-8"
              }`}
              // Same paint as the native pins (category fill, kind ring);
              // the selected pin gets the brand ring.
              style={{
                backgroundColor: markerPaint(item, PIN).fill,
                borderColor: selected ? PIN.ember : markerPaint(item, PIN).ring,
              }}
            >
              <Icon
                name={markerIcon(item)}
                size="sm"
                color={markerPaint(item, PIN).glyph}
              />
            </View>
            {/* Title label under the pin (un-clustered markers only). The pill
                keeps it legible regardless of the map background. */}
            <View
              pointerEvents="none"
              className="absolute items-center"
              style={{ top: selected ? 38 : 34, left: -40, width: 124 }}
            >
              <View
                style={elevation.e1}
                className="max-w-full rounded-md border border-line bg-surface px-1.5 py-0.5"
              >
                <Text numberOfLines={1} variant="caption" weight="semibold">
                  {item.title}
                </Text>
              </View>
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
  recenterZoom,
  center,
  userCoord,
  heading,
  onMapPress,
  onClusterPress,
  focusCoord,
  styleURL,
  lightPreset,
  terrain,
  ornamentBottom,
  darkBasemap = false,
  onUserMoved,
  areaReaderRef,
  obscured,
  height = 160,
  fill = false,
}: MapProps & { height?: number; fill?: boolean }) {
  return (
    <View
      className={
        fill
          ? "flex-1 bg-surfaceMuted"
          : "overflow-hidden rounded-xl border border-line bg-surfaceMuted"
      }
      style={fill ? undefined : { height }}
    >
      {RealMap ? (
        <RealMap
          markers={markers}
          selectedMarkerId={selectedMarkerId}
          onSelectMarker={onSelectMarker}
          recenterSignal={recenterSignal}
          recenterZoom={recenterZoom}
          center={center}
          userCoord={userCoord}
          heading={heading}
          onMapPress={onMapPress}
          focusCoord={focusCoord}
          styleURL={styleURL}
          lightPreset={lightPreset}
          terrain={terrain}
          ornamentBottom={ornamentBottom}
          darkBasemap={darkBasemap}
          onUserMoved={onUserMoved}
          areaReaderRef={areaReaderRef}
          obscured={obscured}
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
