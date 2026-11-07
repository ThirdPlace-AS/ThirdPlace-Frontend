import { Image } from "expo-image";
import { useState } from "react";
import { View, type ImageSourcePropType } from "react-native";

import { IconButton, Pressable, Text } from "@/components/ui";
import { Sheet } from "@/components/Sheet";

import { MAP_STYLES, type MapStyleKey, type MapStylePeriod } from "./mapStyles";

// Kartlag, laid out after the founder's reference (2026-11-07): a centred
// title, a "Kartstil" section with every base map as a preview tile in a
// three-column grid, the name under each, and a pink ring on the one in use.
// Auto (follow the time of day) comes first; ⓘ says what it does. The
// reference's second section (a capture overlay) has no ThirdPlace
// counterpart and is left out.
//
// The previews are crops of our own Studio styles (assets/map-styles,
// © Mapbox © OpenStreetMap). Picking a style turns Auto off; picking Auto
// turns it back on. SoftMap (web, Expo Go) has no styles, so a choice only
// changes the native map.

const PREVIEW: Record<MapStylePeriod | "auto", ImageSourcePropType> = {
  auto: require("../../../assets/map-styles/auto.webp"),
  dawn: require("../../../assets/map-styles/dawn.webp"),
  day: require("../../../assets/map-styles/day.webp"),
  dusk: require("../../../assets/map-styles/dusk.webp"),
  night: require("../../../assets/map-styles/night.webp"),
};

const COLUMNS = 3;
const GAP = 12;

export function MapLayerSheet({
  visible,
  active,
  auto,
  onClose,
  onSelect,
  onEnableAuto,
}: {
  visible: boolean;
  active: MapStyleKey;
  auto: boolean;
  onClose: () => void;
  onSelect: (key: MapStyleKey) => void;
  onEnableAuto: () => void;
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

  const tiles = [
    {
      key: "auto",
      label: "Auto",
      image: PREVIEW.auto,
      selected: auto,
      onPress: () => {
        onEnableAuto();
        close();
      },
    },
    ...MAP_STYLES.map((s) => ({
      key: s.key,
      label: s.label,
      image: PREVIEW[s.period],
      selected: !auto && s.key === active,
      onPress: () => {
        onSelect(s.key);
        close();
      },
    })),
  ];

  return (
    <Sheet visible={visible} onClose={close} title="Kartlag" centerTitle>
      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <Text variant="title" accessibilityRole="header">
            Kartstil
          </Text>
          <IconButton
            icon="information-circle-outline"
            label={info ? "Skjul forklaringen" : "Om Auto"}
            size="sm"
            variant="ghost"
            selected={info}
            onPress={() => setInfo((v) => !v)}
          />
        </View>
        {info ? (
          <Text variant="caption" tone="muted">
            Auto bytter kartstil etter tiden på døgnet: daggry 05–08, dag 08–17,
            skumring 17–20 og natt fra 20.
          </Text>
        ) : null}
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Kartstil"
          className="flex-row flex-wrap"
          style={{ gap: GAP }}
          onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
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
      </View>
    </Sheet>
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
  image: ImageSourcePropType;
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
      haptic="selection"
      pressedScale={0.97}
      style={{ width }}
      contentClassName="gap-2"
    >
      <View
        className={`overflow-hidden rounded-md ${
          selected ? "border-ember" : "border-line"
        }`}
        // The ring sits inside the tile so the grid never shifts.
        style={{ borderWidth: selected ? 3 : 1, aspectRatio: 1.65 }}
      >
        <Image
          source={image}
          contentFit="cover"
          style={{ width: "100%", height: "100%" }}
          accessible={false}
        />
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
