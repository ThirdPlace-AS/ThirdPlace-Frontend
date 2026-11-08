// Inline photo gallery for detail views (place, business, group, listing):
// a rounded box that pages through the photos with dots (PhotoPager).
// Bundled fixture photos only (BLOCKED_CONTRACT_GAP: no media contract).
import { type ImageSourcePropType, View } from "react-native";

import { PhotoPager } from "./PhotoPager";

export function Gallery({
  photos,
  height = 200,
  label,
}: {
  photos: readonly ImageSourcePropType[];
  height?: number;
  /** Accessible name, e.g. the place name. */
  label: string;
}) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        photos.length > 1 ? `${label}, ${photos.length} bilder` : label
      }
      style={{ height }}
      className="overflow-hidden rounded-lg bg-surfaceMuted"
    >
      <PhotoPager photos={[...photos]} />
    </View>
  );
}
