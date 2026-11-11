// Pin glyphs for places by what the place is (user 2026-11-11: "the same
// types of city space and businesses should share the same marker icons, the
// icons must reflect the business or city space"; answers: close types share
// one icon, organisations follow the same rule). Until then a place showed its
// interest's glyph, so 35 parks showed 35 different icons (a bread slice for
// the baking interest's park). Each row also names the pin's colour group
// (pinGroup.ts, user 2026-11-11: "the colors need to change too"), so the
// same kind of place has the same icon and colour. Experiences keep their
// activity's glyph and group. Pure, keyed by the place's category;
// tests/placeGlyph.test.ts checks every fixture category is here.
import type { PinGlyphName } from "@/components/ui/PinGlyph";

import type { PinGroup } from "./pinGroup";

type Family = {
  glyph: PinGlyphName;
  /** The pin's colour group (pinGroup.ts). */
  group: PinGroup;
  types: readonly string[];
};

// One row per kind of place. A category belongs to one row; the same
// activity keeps the same glyph across businesses, city spaces and clubs.
const FAMILIES: readonly Family[] = [
  // Hospitality: close types share one icon.
  {
    glyph: "coffee",
    group: "eat",
    types: [
      "Kafé",
      "Bokcafé",
      "Bokkafé",
      "Hundekafé",
      "Spillkafé",
      "Vegansk kafé",
      "Butikk og kafé",
      "Utleie og kafé",
      "Kaffeklubb",
    ],
  },
  { glyph: "tea", group: "eat", types: ["Tesalong", "Teforening"] },
  { glyph: "bread-slice", group: "eat", types: ["Bakeri", "Bakelag"] },
  {
    glyph: "silverware-fork-knife",
    group: "eat",
    types: [
      "Restaurant",
      "Pizzeria",
      "Sjømatrestaurant",
      "Vietnamesisk restaurant",
      "Gårdsrestaurant",
      "Vegansk restaurant",
      "Ølrestaurant",
      "Vinbistro",
      "Matklubb",
    ],
  },
  {
    glyph: "glass-cocktail",
    group: "night",
    types: [
      "Bar",
      "Pub",
      "Vinbar",
      "Jazzbar",
      "Gamingbar",
      "Kinobar",
      "Komikkbar",
      "Teaterbar",
      "Pingpongbar",
      "Biljardbar",
    ],
  },
  {
    glyph: "glass-mug-variant",
    group: "night",
    types: ["Bryggeri", "Bryggerlag"],
  },
  { glyph: "glass-wine", group: "night", types: ["Vinklubb"] },
  { glyph: "pot-steam", group: "eat", types: ["Kokkelag"] },
  { glyph: "carrot", group: "eat", types: ["Plantelag"] },
  { glyph: "barn", group: "eat", types: ["Andelslandbruk"] },
  {
    glyph: "shopping",
    group: "social",
    types: [
      "Antikvariat",
      "Bruktbutikk",
      "Fiskebutikk",
      "Garnbutikk",
      "Gårdsbutikk",
      "Løpebutikk",
      "Naturbutikk",
      "Plantebutikk",
      "Platebutikk",
      "Påfyllingsbutikk",
      "Skibutikk",
      "Spillbutikk",
      "Teleskopbutikk",
      "Handlegate",
    ],
  },
  // Music and stage.
  {
    glyph: "music",
    group: "night",
    types: ["Konsertscene", "Konsertsalong", "Klubb", "Utescene"],
  },
  { glyph: "saxophone", group: "night", types: ["Jazzklubb"] },
  { glyph: "violin", group: "culture", types: ["Musikkforening"] },
  { glyph: "guitar-electric", group: "night", types: ["Konsertforening"] },
  { glyph: "account-music", group: "culture", types: ["Kor", "Sangstudio"] },
  { glyph: "headphones", group: "night", types: ["DJ-kollektiv"] },
  { glyph: "record-player", group: "night", types: ["Samlerforening"] },
  { glyph: "drama-masks", group: "culture", types: ["Teatergruppe"] },
  { glyph: "microphone-variant", group: "night", types: ["Standupgruppe"] },
  { glyph: "filmstrip", group: "culture", types: ["Filmklubb"] },
  {
    glyph: "podcast",
    group: "culture",
    types: ["Podkaststudio", "Podkastlag"],
  },
  // Tours and trips.
  {
    glyph: "map-marker-path",
    group: "culture",
    types: [
      "Arkitekturturer",
      "Guidede turer",
      "Hageomvisninger",
      "Matturer",
      "Byvandringslag",
    ],
  },
  { glyph: "sail-boat", group: "water", types: ["Seilturer", "Seilforening"] },
  {
    glyph: "kayaking",
    group: "water",
    types: ["Kajakkutleie", "Brettutleie", "Padleklubb", "Padlelag"],
  },
  // Sport, by the sport.
  {
    glyph: "carabiner",
    group: "sport",
    types: ["Buldresenter", "Klatrefelt", "Klatrelag"],
  },
  { glyph: "basketball", group: "sport", types: ["Baskethall", "Basketlag"] },
  { glyph: "soccer", group: "sport", types: ["Fotballhall", "Fotballag"] },
  { glyph: "soccer-field", group: "sport", types: ["Ballbane"] },
  { glyph: "racquetball", group: "sport", types: ["Padelhall", "Padelklubb"] },
  {
    glyph: "tennis",
    group: "sport",
    types: ["Tennishall", "Tennisbaner", "Tennisklubb"],
  },
  {
    glyph: "volleyball",
    group: "sport",
    types: ["Sandvolleyballhall", "Volleyballag"],
  },
  {
    glyph: "bowling",
    group: "social",
    types: ["Bowlinghall", "Bowlingklubb", "Petanquebane"],
  },
  { glyph: "billiards", group: "social", types: ["Biljardklubb"] },
  { glyph: "table-tennis", group: "sport", types: ["Bordtennisklubb"] },
  {
    glyph: "skate",
    group: "sport",
    types: ["Ishall", "Skøytebane", "Skøytelag"],
  },
  {
    glyph: "skateboard",
    group: "sport",
    types: ["Skatehall", "Skatepark", "Skateklubb"],
  },
  { glyph: "ski", group: "sport", types: ["Skiservice", "Skianlegg"] },
  {
    glyph: "ski-cross-country",
    group: "sport",
    types: ["Rulleskiløype", "Skilag"],
  },
  {
    glyph: "dumbbell",
    group: "sport",
    types: ["Treningssenter", "Treningspark", "Treningslag"],
  },
  { glyph: "karate", group: "sport", types: ["Kampsportsenter"] },
  { glyph: "yin-yang", group: "sport", types: ["Taijilag"] },
  { glyph: "swim", group: "water", types: ["Svømmeskole", "Svømmeklubb"] },
  { glyph: "run", group: "sport", types: ["Løpelag"] },
  { glyph: "bike", group: "sport", types: ["Pumptrack", "Sykkelklubb"] },
  { glyph: "hiking", group: "nature", types: ["Turlag", "Vandrelag"] },
  { glyph: "fish", group: "water", types: ["Fiskeforening"] },
  // Body and mind.
  { glyph: "yoga", group: "wellness", types: ["Yogastudio", "Yogaforening"] },
  {
    glyph: "gymnastics",
    group: "wellness",
    types: ["Pilatesstudio", "Pilateslag"],
  },
  {
    glyph: "dance-ballroom",
    group: "sport",
    types: ["Dansestudio", "Danseklubb"],
  },
  {
    glyph: "meditation",
    group: "wellness",
    types: ["Meditasjonssenter", "Meditasjonsgruppe"],
  },
  {
    glyph: "hot-tub",
    group: "wellness",
    types: ["Badstue", "Badehus", "Badstuelag"],
  },
  {
    glyph: "spa",
    group: "wellness",
    types: ["Skjønnhetssalong", "Velværegruppe"],
  },
  // Making things.
  {
    glyph: "hammer-wrench",
    group: "culture",
    types: [
      "Felles verksted",
      "Verksted",
      "Makerspace",
      "Snekkerklubb",
      "Reparasjonsverksted",
    ],
  },
  { glyph: "palette", group: "culture", types: ["Galleri", "Kunstklubb"] },
  { glyph: "brush", group: "culture", types: ["Malerverksted", "Maleklubb"] },
  { glyph: "pencil", group: "culture", types: ["Tegnestudio", "Tegneklubb"] },
  { glyph: "camera", group: "culture", types: ["Fotolab", "Fotoklubb"] },
  {
    glyph: "ruler-square-compass",
    group: "culture",
    types: ["Designstudio", "Designforening"],
  },
  {
    glyph: "sofa",
    group: "culture",
    types: ["Interiørverksted", "Interiørklubb"],
  },
  { glyph: "hanger", group: "culture", types: ["Systue", "Byttelag"] },
  { glyph: "bowl", group: "culture", types: ["Keramikkgruppe"] },
  { glyph: "yarn", group: "culture", types: ["Strikkegruppe"] },
  { glyph: "laptop", group: "culture", types: ["Teknologiklubb"] },
  { glyph: "cactus", group: "culture", types: ["Planteklubb"] },
  // Words, games and ideas.
  {
    glyph: "fountain-pen-tip",
    group: "culture",
    types: ["Skrivested", "Skrivegruppe"],
  },
  {
    glyph: "book-open-page-variant",
    group: "culture",
    types: ["Leseforening"],
  },
  { glyph: "feather", group: "culture", types: ["Lyrikkforening"] },
  { glyph: "forum", group: "social", types: ["Samtaleklubb"] },
  { glyph: "translate", group: "social", types: ["Språkgruppe"] },
  { glyph: "chess-knight", group: "social", types: ["Sjakklubb"] },
  { glyph: "dice-5", group: "social", types: ["Spillforening"] },
  { glyph: "sword-cross", group: "social", types: ["Rollespillforening"] },
  { glyph: "gamepad-variant", group: "social", types: ["Gamingklubb"] },
  { glyph: "head-question", group: "social", types: ["Quizklubb"] },
  { glyph: "hand-heart", group: "social", types: ["Frivilliggruppe"] },
  { glyph: "telescope", group: "nature", types: ["Astronomiklubb"] },
  { glyph: "bank", group: "culture", types: ["Radiomuseum", "Museumsklubb"] },
  {
    glyph: "castle",
    group: "culture",
    types: ["Festning", "Kulturminne", "Historisk gate", "Historielag"],
  },
  { glyph: "office-building", group: "culture", types: ["Arkitekturforening"] },
  // City spaces and nature.
  {
    glyph: "tree",
    group: "nature",
    types: ["Park", "Bekk og park", "Skulpturpark"],
  },
  {
    glyph: "beach",
    group: "water",
    types: ["Badeplass", "Badestrand", "Sjøbad", "Strand og park"],
  },
  { glyph: "waves", group: "water", types: ["Vann", "Skogsvann", "Badeklubb"] },
  {
    glyph: "sprout",
    group: "nature",
    types: ["Nabolagshage", "Byparsell", "Parsellag"],
  },
  { glyph: "fountain", group: "social", types: ["Torg"] },
  {
    glyph: "anchor",
    group: "water",
    types: ["Båthavn", "Bryggeområde", "Bryggepromenade"],
  },
  {
    glyph: "pine-tree",
    group: "nature",
    types: [
      "Turområde",
      "Skog og turområde",
      "Vann og skog",
      "Vann og turområde",
      "Elv og turvei",
      "Vann og naturreservat",
      "Friområde",
    ],
  },
  { glyph: "island", group: "nature", types: ["Øy og friområde", "Odde"] },
  {
    glyph: "binoculars",
    group: "nature",
    types: ["Utsiktspunkt", "Fugleforening"],
  },
  { glyph: "mushroom", group: "nature", types: ["Soppforening"] },
  { glyph: "dog", group: "nature", types: ["Hundepark", "Hundeklubb"] },
];

const BY_TYPE: ReadonlyMap<string, Family> = new Map(
  FAMILIES.flatMap((f) => f.types.map((t) => [t, f] as const)),
);

/** The pin glyph for a kind of place, or undefined for a category the table
 *  does not know (the caller falls back to the interest's glyph). */
export function placeKindGlyph(
  category: string | undefined,
): PinGlyphName | undefined {
  return category ? BY_TYPE.get(category)?.glyph : undefined;
}

/** The pin's colour group for a kind of place, or undefined for a category
 *  the table does not know (the caller falls back to the interest's). */
export function placeKindGroup(
  category: string | undefined,
): PinGroup | undefined {
  return category ? BY_TYPE.get(category)?.group : undefined;
}

/** Every category in the table (for the coverage test). */
export const PLACE_KIND_TYPES: readonly string[] = FAMILIES.flatMap(
  (f) => f.types,
);
