// Pin glyphs for places by what the place is (user 2026-11-11: "the same
// types of city space and businesses should share the same marker icons, the
// icons must reflect the business or city space"; answers: close types share
// one icon, organisations follow the same rule). Until then a place showed its
// interest's glyph, so 35 parks showed 35 different icons (a bread slice for
// the baking interest's park). Experiences keep their activity's glyph, and
// the pin's colour stays the interest's category. Pure, keyed by the place's
// category; tests/placeGlyph.test.ts checks every fixture category is here.
import type { PinGlyphName } from "@/components/ui/PinGlyph";

type Family = { glyph: PinGlyphName; types: readonly string[] };

// One row per kind of place. A category belongs to one row; the same
// activity keeps the same glyph across businesses, city spaces and clubs.
const FAMILIES: readonly Family[] = [
  // Hospitality: close types share one icon.
  {
    glyph: "coffee",
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
  { glyph: "tea", types: ["Tesalong", "Teforening"] },
  { glyph: "bread-slice", types: ["Bakeri", "Bakelag"] },
  {
    glyph: "silverware-fork-knife",
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
  { glyph: "glass-mug-variant", types: ["Bryggeri", "Bryggerlag"] },
  { glyph: "glass-wine", types: ["Vinklubb"] },
  { glyph: "pot-steam", types: ["Kokkelag"] },
  { glyph: "carrot", types: ["Plantelag"] },
  { glyph: "barn", types: ["Andelslandbruk"] },
  {
    glyph: "shopping",
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
    types: ["Konsertscene", "Konsertsalong", "Klubb", "Utescene"],
  },
  { glyph: "saxophone", types: ["Jazzklubb"] },
  { glyph: "violin", types: ["Musikkforening"] },
  { glyph: "guitar-electric", types: ["Konsertforening"] },
  { glyph: "account-music", types: ["Kor", "Sangstudio"] },
  { glyph: "headphones", types: ["DJ-kollektiv"] },
  { glyph: "record-player", types: ["Samlerforening"] },
  { glyph: "drama-masks", types: ["Teatergruppe"] },
  { glyph: "microphone-variant", types: ["Standupgruppe"] },
  { glyph: "filmstrip", types: ["Filmklubb"] },
  { glyph: "podcast", types: ["Podkaststudio", "Podkastlag"] },
  // Tours and trips.
  {
    glyph: "map-marker-path",
    types: [
      "Arkitekturturer",
      "Guidede turer",
      "Hageomvisninger",
      "Matturer",
      "Byvandringslag",
    ],
  },
  { glyph: "sail-boat", types: ["Seilturer", "Seilforening"] },
  {
    glyph: "kayaking",
    types: ["Kajakkutleie", "Brettutleie", "Padleklubb", "Padlelag"],
  },
  // Sport, by the sport.
  { glyph: "carabiner", types: ["Buldresenter", "Klatrefelt", "Klatrelag"] },
  { glyph: "basketball", types: ["Baskethall", "Basketlag"] },
  { glyph: "soccer", types: ["Fotballhall", "Fotballag"] },
  { glyph: "soccer-field", types: ["Ballbane"] },
  { glyph: "racquetball", types: ["Padelhall", "Padelklubb"] },
  { glyph: "tennis", types: ["Tennishall", "Tennisbaner", "Tennisklubb"] },
  { glyph: "volleyball", types: ["Sandvolleyballhall", "Volleyballag"] },
  {
    glyph: "bowling",
    types: ["Bowlinghall", "Bowlingklubb", "Petanquebane"],
  },
  { glyph: "billiards", types: ["Biljardklubb"] },
  { glyph: "table-tennis", types: ["Bordtennisklubb"] },
  { glyph: "skate", types: ["Ishall", "Skøytebane", "Skøytelag"] },
  { glyph: "skateboard", types: ["Skatehall", "Skatepark", "Skateklubb"] },
  { glyph: "ski", types: ["Skiservice", "Skianlegg"] },
  { glyph: "ski-cross-country", types: ["Rulleskiløype", "Skilag"] },
  {
    glyph: "dumbbell",
    types: ["Treningssenter", "Treningspark", "Treningslag"],
  },
  { glyph: "karate", types: ["Kampsportsenter"] },
  { glyph: "yin-yang", types: ["Taijilag"] },
  { glyph: "swim", types: ["Svømmeskole", "Svømmeklubb"] },
  { glyph: "run", types: ["Løpelag"] },
  { glyph: "bike", types: ["Pumptrack", "Sykkelklubb"] },
  { glyph: "hiking", types: ["Turlag", "Vandrelag"] },
  { glyph: "fish", types: ["Fiskeforening"] },
  // Body and mind.
  { glyph: "yoga", types: ["Yogastudio", "Yogaforening"] },
  { glyph: "gymnastics", types: ["Pilatesstudio", "Pilateslag"] },
  { glyph: "dance-ballroom", types: ["Dansestudio", "Danseklubb"] },
  { glyph: "meditation", types: ["Meditasjonssenter", "Meditasjonsgruppe"] },
  { glyph: "hot-tub", types: ["Badstue", "Badehus", "Badstuelag"] },
  { glyph: "spa", types: ["Skjønnhetssalong", "Velværegruppe"] },
  // Making things.
  {
    glyph: "hammer-wrench",
    types: [
      "Felles verksted",
      "Verksted",
      "Makerspace",
      "Snekkerklubb",
      "Reparasjonsverksted",
    ],
  },
  { glyph: "palette", types: ["Galleri", "Kunstklubb"] },
  { glyph: "brush", types: ["Malerverksted", "Maleklubb"] },
  { glyph: "pencil", types: ["Tegnestudio", "Tegneklubb"] },
  { glyph: "camera", types: ["Fotolab", "Fotoklubb"] },
  { glyph: "ruler-square-compass", types: ["Designstudio", "Designforening"] },
  { glyph: "sofa", types: ["Interiørverksted", "Interiørklubb"] },
  { glyph: "hanger", types: ["Systue", "Byttelag"] },
  { glyph: "bowl", types: ["Keramikkgruppe"] },
  { glyph: "yarn", types: ["Strikkegruppe"] },
  { glyph: "laptop", types: ["Teknologiklubb"] },
  { glyph: "cactus", types: ["Planteklubb"] },
  // Words, games and ideas.
  { glyph: "fountain-pen-tip", types: ["Skrivested", "Skrivegruppe"] },
  { glyph: "book-open-page-variant", types: ["Leseforening"] },
  { glyph: "feather", types: ["Lyrikkforening"] },
  { glyph: "forum", types: ["Samtaleklubb"] },
  { glyph: "translate", types: ["Språkgruppe"] },
  { glyph: "chess-knight", types: ["Sjakklubb"] },
  { glyph: "dice-5", types: ["Spillforening"] },
  { glyph: "sword-cross", types: ["Rollespillforening"] },
  { glyph: "gamepad-variant", types: ["Gamingklubb"] },
  { glyph: "head-question", types: ["Quizklubb"] },
  { glyph: "hand-heart", types: ["Frivilliggruppe"] },
  { glyph: "telescope", types: ["Astronomiklubb"] },
  { glyph: "bank", types: ["Radiomuseum", "Museumsklubb"] },
  {
    glyph: "castle",
    types: ["Festning", "Kulturminne", "Historisk gate", "Historielag"],
  },
  { glyph: "office-building", types: ["Arkitekturforening"] },
  // City spaces and nature.
  { glyph: "tree", types: ["Park", "Bekk og park", "Skulpturpark"] },
  {
    glyph: "beach",
    types: ["Badeplass", "Badestrand", "Sjøbad", "Strand og park"],
  },
  { glyph: "waves", types: ["Vann", "Skogsvann", "Badeklubb"] },
  {
    glyph: "sprout",
    types: ["Nabolagshage", "Byparsell", "Parsellag"],
  },
  { glyph: "fountain", types: ["Torg"] },
  {
    glyph: "anchor",
    types: ["Båthavn", "Bryggeområde", "Bryggepromenade"],
  },
  {
    glyph: "pine-tree",
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
  { glyph: "island", types: ["Øy og friområde", "Odde"] },
  { glyph: "binoculars", types: ["Utsiktspunkt", "Fugleforening"] },
  { glyph: "mushroom", types: ["Soppforening"] },
  { glyph: "dog", types: ["Hundepark", "Hundeklubb"] },
];

const BY_TYPE: ReadonlyMap<string, PinGlyphName> = new Map(
  FAMILIES.flatMap((f) => f.types.map((t) => [t, f.glyph] as const)),
);

/** The pin glyph for a kind of place, or undefined for a category the table
 *  does not know (the caller falls back to the interest's glyph). */
export function placeKindGlyph(
  category: string | undefined,
): PinGlyphName | undefined {
  return category ? BY_TYPE.get(category) : undefined;
}

/** Every category in the table (for the coverage test). */
export const PLACE_KIND_TYPES: readonly string[] = FAMILIES.flatMap(
  (f) => f.types,
);
