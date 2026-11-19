// 3D category art manifest (docs/design/ASSET_SPEC_3D.md).
//
// CATEGORY_ART maps the Norwegian category labels used in the app to an art
// key. `artFiles` lists delivered renders: add `key: require("./<key>@3x.webp")`
// when a file arrives and CategoryArt shows it instead of the hand-built SVG.
// Nothing is listed yet — every key currently renders its SVG.
import type { ImageSourcePropType } from "react-native";

export type ArtKey =
  | "cafe"
  | "bar"
  | "restaurant"
  | "outdoors"
  | "culture"
  | "workshop"
  | "tasting"
  | "music"
  | "hiking"
  | "art"
  | "sport"
  | "social"
  | "place"
  | "experience"
  | "group"
  | "location";

export const CATEGORY_ART: Record<string, ArtKey> = {
  // Places (Add → Sted, map categories)
  Kafé: "cafe",
  Bokcafé: "cafe",
  Bar: "bar",
  Vinbar: "tasting",
  Restaurant: "restaurant",
  Utendørs: "outdoors",
  Kultur: "culture",
  Verksted: "workshop",
  // Experiences (Add → Opplevelse)
  "Kurs & smaking": "tasting",
  Musikk: "music",
  "Tur & friluft": "hiking",
  "Kunst & kultur": "art",
  "Sport & trening": "sport",
  Sosialt: "social",
  // Kinds
  Sted: "place",
  Opplevelse: "experience",
  Gruppe: "group",
};

export const artFiles: Partial<Record<ArtKey, ImageSourcePropType>> = {};
