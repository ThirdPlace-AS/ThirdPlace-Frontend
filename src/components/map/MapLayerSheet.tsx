import { Image } from "expo-image";
import { useState } from "react";
import { View, type ImageSourcePropType } from "react-native";

import { IconButton, Pressable, Text } from "@/components/ui";
import { Sheet } from "@/components/Sheet";
import { env } from "@/lib/env";

import {
  MAP_STYLES,
  MAP_TYPES,
  type MapStyleKey,
  type MapStylePeriod,
  type MapType,
} from "./mapStyles";

// Kartlag, laid out after the founder's reference (2026-11-07): a centred
// title and preview tiles in a three-column grid, the name under each and a
// pink ring on the one in use.
// - Karttype (founder, 2026-11-07): Standard, Satellitt, Terreng.
// - Kartstil: Auto (follow the time of day) and the four times of day; ⓘ says
//   what Auto does and credits the previews' map sources.
// Picking only changes the map behind the sheet; the sheet stays open so both
// choices can be made (✕, the scrim or back close it). The reference's capture
// section has no ThirdPlace counterpart and is left out.
//
// Previews: Standard, Terreng and the Kartstil tiles are crops of our own
// Studio styles (assets/map-styles, © Mapbox © OpenStreetMap). Satellitt's
// imagery is not stored in the app: its tile loads live from the Static Images
// API (as the meeting-map card does), without the logo, since the credit line
// names the sources: under ⓘ since 2026-11-11 (user: "remove the text at the
// bottom of the map layer modal"), the way the map's own ⓘ holds its credits. SoftMap (web, Expo Go) has no styles, so
// a choice only changes the native map.

const STYLE_PREVIEW: Record<MapStylePeriod | "auto", ImageSourcePropType> = {
  auto: require("../../../assets/map-styles/auto.webp"),
  dawn: require("../../../assets/map-styles/dawn.webp"),
  day: require("../../../assets/map-styles/day.webp"),
  dusk: require("../../../assets/map-styles/dusk.webp"),
  night: require("../../../assets/map-styles/night.webp"),
};

const TYPE_PREVIEW: Record<
  Exclude<MapType, "satellite">,
  ImageSourcePropType
> = {
  standard: require("../../../assets/map-styles/type-standard.webp"),
  terrain: require("../../../assets/map-styles/type-terrain.webp"),
};

// The stored Standard / Terreng crops show Holmenkollen, Oslo: 331 dp of map
// at zoom 15 (assets/map-styles/CREDITS.md). The satellite tile covers the
// same area at any tile width, so its zoom follows the width.
const SATELLITE_PREVIEW = { lon: 10.667, lat: 59.9652, zoom: 15, widthDp: 331 };

/** Credit for the map previews, as the map's own ⓘ lists its sources. */
export const MAP_PREVIEW_CREDIT = "Kart © Mapbox © OpenStreetMap © Maxar";

const COLUMNS = 3;
const GAP = 12;
const TILE_ASPECT = 1.65;

function satellitePreviewUri(tileWidth: number): string | null {
  const token = env.mapboxToken;
  if (!token || tileWidth <= 0) return null;
  const w = Math.round(tileWidth);
  const h = Math.round(tileWidth / TILE_ASPECT);
  const { lon, lat, widthDp } = SATELLITE_PREVIEW;
  const zoom =
    Math.round((SATELLITE_PREVIEW.zoom - Math.log2(widthDp / w)) * 100) / 100;
  // Imagery only (no labels): at tile size, road names would cover it.
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lon},${lat},${zoom},0/${w}x${h}@2x?attribution=false&logo=false&access_token=${token}`;
}

export function MapLayerSheet({
  visible,
  active,
  auto,
  mapType,
  onClose,
  onSelect,
  onEnableAuto,
  onSelectType,
}: {
  visible: boolean;
  active: MapStyleKey;
  auto: boolean;
  mapType: MapType;
  onClose: () => void;
  onSelect: (key: MapStyleKey) => void;
  onEnableAuto: () => void;
  onSelectType: (type: MapType) => void;
}) {
  const [width, setWidth] = useState(0);
  const [info, setInfo] = useState(false);
  // Closing folds the ⓘ text away, so the next opening starts clean.
  const close = () => {
    setInfo(false);
    onClose();
  };
  const tileWidth =
    width > 0 ? Math.floor((width - GAP * (COLUMNS - 1)) / COLUMNS) : 0;
  const satelliteUri = satellitePreviewUri(tileWidth);

  const typeTiles = MAP_TYPES.map((t) => ({
    key: t.key,
    label: t.label,
    image:
      t.key === "satellite"
        ? satelliteUri
          ? { uri: satelliteUri }
          : null
        : TYPE_PREVIEW[t.key],
    selected: t.key === mapType,
    onPress: () => onSelectType(t.key),
  }));

  const styleTiles = [
    {
      key: "auto",
      label: "Auto",
      image: STYLE_PREVIEW.auto,
      selected: auto,
      onPress: onEnableAuto,
    },
    ...MAP_STYLES.map((s) => ({
      key: s.key,
      label: s.label,
      image: STYLE_PREVIEW[s.period],
      selected: !auto && s.key === active,
      onPress: () => onSelect(s.key),
    })),
  ];

  return (
    <Sheet visible={visible} onClose={close} title="Kartlag" centerTitle>
      <View
        testID="kartlag-body"
        className="gap-5"
        onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
      >
        <View className="gap-3">
          <Text variant="title" accessibilityRole="header">
            Karttype
          </Text>
          <TileGrid label="Karttype" tiles={typeTiles} tileWidth={tileWidth} />
        </View>

        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Text variant="title" accessibilityRole="header">
              Kartstil
            </Text>
            <IconButton
              icon="information-circle-outline"
              label={info ? "Skjul forklaringen" : "Om kartstilene og kildene"}
              size="sm"
              variant="ghost"
              selected={info}
              onPress={() => setInfo((v) => !v)}
            />
          </View>
          {info ? (
            <View className="gap-1">
              <Text variant="caption" tone="muted">
                Auto bytter kartstil etter tiden på døgnet: daggry 05–08, dag
                08–17, skumring 17–20 og natt fra 20. Når telefonen er i mørk
                modus, viser Auto natt.
              </Text>
              {/* The previews' credit (user 2026-11-11: no text at the
                  bottom of the sheet), behind ⓘ as the map's own ⓘ holds
                  its credits. */}
              <Text variant="caption" tone="muted">
                {MAP_PREVIEW_CREDIT}
              </Text>
            </View>
          ) : null}
          <TileGrid label="Kartstil" tiles={styleTiles} tileWidth={tileWidth} />
        </View>
      </View>
    </Sheet>
  );
}

type Tile = {
  key: string;
  label: string;
  image: ImageSourcePropType | null;
  selected: boolean;
  onPress: () => void;
};

function TileGrid({
  label,
  tiles,
  tileWidth,
}: {
  label: string;
  tiles: Tile[];
  tileWidth: number;
}) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      className="flex-row flex-wrap"
      style={{ gap: GAP }}
    >
      {tileWidth > 0
        ? tiles.map((t) => (
            <StyleTile
              key={t.key}
              label={t.label}
              image={t.image}
              selected={t.selected}
              width={tileWidth}
              onPress={t.onPress}
            />
          ))
        : null}
    </View>
  );
}

function StyleTile({
  label,
  image,
  selected,
  width,
  onPress,
}: {
  label: string;
  image: ImageSourcePropType | null;
  selected: boolean;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      pressedScale={0.97}
      style={{ width }}
      contentClassName="gap-2"
    >
      <View
        className={`overflow-hidden rounded-md bg-surfaceMuted ${
          selected ? "border-ember" : "border-line"
        }`}
        // The ring sits inside the tile so the grid never shifts.
        style={{ borderWidth: selected ? 3 : 1, aspectRatio: TILE_ASPECT }}
      >
        {image ? (
          <Image
            source={image}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={{ width: "100%", height: "100%" }}
            accessible={false}
          />
        ) : null}
      </View>
      <Text
        variant="label"
        weight={selected ? "semibold" : "regular"}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
