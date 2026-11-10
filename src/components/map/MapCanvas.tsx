import Constants, { ExecutionEnvironment } from "expo-constants";
import { memo, useMemo, useState, type ComponentType } from "react";
import { Platform, Pressable, View } from "react-native";

import { env } from "@/lib/env";
import { useUserLocation } from "@/lib/userLocation";
import { elevation, palette } from "@/theme";

import type { MapStylePeriod } from "./mapStyles";
import {
  clusterByGrid,
  projectToUnit,
  softBoxFor,
  softTowns,
  type SoftBox,
} from "./services/softClustering";
import type { DiscoveryItem } from "./types/mapPresentation";
import type { FocusPadding } from "./services/pinCamera";
import type { CameraTarget } from "./hooks/useMapCamera";
import { markerPaint } from "./pinStyle";
import { USER_PUCK } from "./userPuck";
import { markerIcon } from "./services/markerIcon";
import { PinGlyph, Text } from "@/components/ui";

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
  // Where the real map flies next (Posisjon, a picked area), once per request
  // (hooks/useMapCamera.ts). SoftMap ignores it.
  cameraTarget?: CameraTarget | null;
  // Where the real map opens (read once; GPS fix / manual area / demo
  // default). SoftMap ignores it. The user's position and heading are not
  // props: both maps' location dots read them from src/lib/userLocation.ts
  // (speed pass 0346), so a GPS fix or a compass reading renders only the dot.
  center?: [number, number];
  // Tap on empty map (not a marker) — collapses selection + dismisses keyboard.
  onMapPress?: () => void;
  // SoftMap only: tapping a multi-item cluster (whose members have no individual
  // target) asks the screen to expand the browse list so every item is reachable.
  onClusterPress?: () => void;
  // Coordinate of the selected marker to pan/center the camera onto (above the
  // detail sheet), Google-Maps style. SoftMap ignores it.
  focusCoord?: [number, number] | null;
  // The pick came from the list or a link, not a pin: the native map zooms
  // in until the pin leaves its cluster. SoftMap ignores it.
  focusZoomIn?: boolean;
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
  // Room around a centred pin, below the top controls and above the detail
  // sheet's peek (services/pinCamera.ts). SoftMap ignores it.
  focusPadding?: FocusPadding;
};

// User-location puck for the SoftMap fallback: an ember dot with a white ring
// at the projected GPS fix, plus a facing-direction arrow when heading is known.
// Only rendered when a real fix exists (never fabricated).
function SoftUserPuck({
  coord,
  heading,
  box,
}: {
  coord: [number, number];
  heading: number | null;
  box: SoftBox;
}) {
  const { x, y } = projectToUnit(coord, box);
  const size = USER_PUCK.haloRadius * 2;
  const dot = (USER_PUCK.dotRadius + USER_PUCK.ringWidth) * 2;
  return (
    <View
      pointerEvents="none"
      className="absolute items-center justify-center"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: size,
        height: size,
        transform: [{ translateX: -size / 2 }, { translateY: -size / 2 }],
      }}
    >
      {/* Same look as the native puck: halo, white ring, ember dot. */}
      <View
        className="absolute"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
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
}: MapProps) {
  // The app's own fix only (the native map's engine position does not exist
  // here); the fallback frames it with the markers.
  const { coord: userCoord, heading } = useUserLocation();
  // County scale (Phase 19 S4b): frame the markers on screen (and the
  // person), cluster on a 44 dp grid, name the towns in view.
  const [size, setSize] = useState({ w: 0, h: 0 });
  const box = useMemo(
    () =>
      softBoxFor(
        [...markers.map((m) => m.coord), ...(userCoord ? [userCoord] : [])],
        size.w > 0 && size.h > 0 ? size.w / size.h : 1,
      ),
    [markers, userCoord, size.w, size.h],
  );
  const clusters = clusterByGrid(
    markers,
    size.w > 0 ? 44 / size.w : 0.04,
    box,
    size.h > 0 ? 44 / size.h : 0.04,
  );
  const towns = useMemo(
    () => softTowns(box, size.w, size.h),
    [box, size.w, size.h],
  );
  return (
    <View
      className="h-full w-full"
      onLayout={(e) =>
        setSize({
          w: e.nativeEvent.layout.width,
          h: e.nativeEvent.layout.height,
        })
      }
    >
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

      {towns.map((t) => (
        <View
          key={t.name}
          pointerEvents="none"
          className="absolute"
          style={{
            left: `${t.x * 100}%`,
            top: `${t.y * 100}%`,
            transform: [{ translateX: -40 }, { translateY: -8 }],
            width: 80,
          }}
        >
          <Text
            variant="micro"
            tone="muted"
            numberOfLines={1}
            className="text-center"
          >
            {t.name}
          </Text>
        </View>
      ))}

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
        const look = markerPaint(item, PIN);
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
                backgroundColor: look.fill,
                borderColor: selected ? PIN.ember : look.ring,
              }}
            >
              <PinGlyph name={markerIcon(item)} size={16} color={look.glyph} />
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
        <SoftUserPuck coord={userCoord} heading={heading ?? null} box={box} />
      ) : null}
    </View>
  );
}

// Memoised (speed pass 0345): the map screen re-renders for many reasons that
// do not concern the map (sheets, peek height, saved toggles), and each
// render used to rebuild every pin layer. Its props come stable from
// app/(tabs)/map.tsx.
export const MapCanvas = memo(function MapCanvas({
  markers,
  selectedMarkerId,
  onSelectMarker,
  cameraTarget,
  center,
  onMapPress,
  onClusterPress,
  focusCoord,
  focusZoomIn,
  styleURL,
  lightPreset,
  terrain,
  ornamentBottom,
  darkBasemap = false,
  focusPadding,
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
          cameraTarget={cameraTarget}
          center={center}
          onMapPress={onMapPress}
          focusCoord={focusCoord}
          focusZoomIn={focusZoomIn}
          styleURL={styleURL}
          lightPreset={lightPreset}
          terrain={terrain}
          ornamentBottom={ornamentBottom}
          darkBasemap={darkBasemap}
          focusPadding={focusPadding}
        />
      ) : (
        <SoftMap
          markers={markers}
          selectedMarkerId={selectedMarkerId}
          onSelectMarker={onSelectMarker}
          onMapPress={onMapPress}
          onClusterPress={onClusterPress}
        />
      )}
    </View>
  );
});
