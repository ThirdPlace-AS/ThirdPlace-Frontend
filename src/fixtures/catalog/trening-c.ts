// Seeds for the Trening interests, part C (Phase 19): Dans. Hand-written
// MOCK content: businesses, clubs and events are fictional; outdoor places
// use their public names with modest, general descriptions (facilities as
// OpenStreetMap shows them). See docs/fixtures/VOICE.md.
import type { InterestSeed } from "./types";

export const TRENING_C: InterestSeed[] = [
  {
    interest: "dans",
    bedrift: {
      name: "Studio Takt",
      category: "Dansestudio",
      coord: [10.7089, 59.9193],
      town: "Frogner",
      address: "Frognerveien 38A, 0263 Oslo",
      hours: "Man–tor 16–22 · Lør–søn 12–18",
      priceNok: 220,
      vibes: ["Energisk", "Sosial"],
      blurb:
        "Dansestudio på Frogner med drop-in-timer i swing, salsa og bachata.",
      about:
        "To saler med speil og tregulv, timer for nybegynnere hver kveld og sosialdans i helgene. Du trenger ikke partner, for vi bytter hele tiden.",
      tags: ["Drop-in", "Uten partner", "Nybegynnere"],
      accessibility: ["Heis", "Rullestol-WC"],
      types: ["Kulturelle aktiviteter", "Trening"],
      audiences: ["Alenereisende", "Par", "Førstegangsbesøkende"],
      durationMin: 75,
      photos: ["dans-2", "dans-6"],
      reviews: [
        [
          "Ingeborg L.",
          5,
          "1 uke siden",
          "Kom alene til en swingtime og danset med minst ti forskjellige. Ingen gjorde det rart å være ny.",
        ],
        [
          "Fredrik S.",
          4,
          "1 måned siden",
          "Flinke lærere og godt gulv. Salen blir varm når det er fullt, så ta med vann.",
        ],
        [
          "Yasmin A.",
          5,
          "2 måneder siden",
          "Begynte på salsa etter en tung periode. Tirsdagene her er det jeg gleder meg mest til.",
        ],
      ],
      chat: [
        [
          "Studio Takt",
          "Ekstra nybegynnertime i swing torsdag klokka sju. Velkommen!",
        ],
        ["Martine", "Må man ha danset før for å være med på sosialdansen?"],
        [
          "Studio Takt",
          "Nei, vi starter alltid med en kort gjennomgang for nye.",
        ],
      ],
      business: {
        name: "Studio Takt AS",
        verified: true,
        about: "Dansestudio på Frogner, drevet av tre dansere siden 2015.",
      },
    },
    organisasjon: {
      name: "Jevnaker Swingklubb",
      category: "Danseklubb",
      coord: [10.3869, 60.2409],
      town: "Jevnaker",
      address: "Storgata 7, 3520 Jevnaker",
      hours: "Ons 19–21",
      priceNok: 0,
      vibes: ["Sosial", "Koselig"],
      blurb: "Swingklubb på Jevnaker for alle som vil lære å danse swing.",
      about:
        "Klubben samler folk fra hele Hadeland til swing på onsdagene. Vi starter med en time for nye og danser fritt etterpå, til musikk fra trettitallet og nyere.",
      tags: ["Swing", "Uten partner", "Sosialdans"],
      accessibility: ["Trinnfri inngang"],
      types: ["Kulturelle aktiviteter"],
      photos: ["dans-1", "dans-5"],
      reviews: [
        [
          "Håkon E.",
          5,
          "1 måned siden",
          "Trodde ikke det fantes en swingklubb på Jevnaker. Nå er onsdag den beste dagen i uka.",
        ],
        [
          "Laila B.",
          4,
          "2 måneder siden",
          "Varm og inkluderende gjeng. Lokalet er litt lite når alle kommer på én gang.",
        ],
      ],
      chat: [
        [
          "Jevnaker Swingklubb",
          "Onsdag spiller vi bare musikk fra førtitallet. Kle deg gjerne deretter.",
        ],
        ["Rolf", "Er det greit å komme uten å ha danset før?"],
        [
          "Mathilde Aune",
          "Ja, den første timen er for nye. Du trenger ingen partner.",
        ],
      ],
      org: {
        form: "Klubb",
        about:
          "Swingklubb på Jevnaker for voksne fra hele Hadeland. Vi lærer bort grunntrinnene, danser sammen og drar på swingfester i Oslo-området.",
        activities: [
          "Nybegynnertime på onsdager",
          "Fri dans etter timen",
          "Swingfest i Sandvika",
        ],
        contactPersonId: "u33",
      },
    },
    byrom: {
      name: "Byscenen i Sandvika",
      category: "Utescene",
      coord: [10.524, 59.8892],
      town: "Sandvika",
      address: "Kyststien, 1337 Sandvika",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Livlig", "Sosial"],
      blurb: "Utescene i Byparken ved Sandvikselva, med benker rundt.",
      about:
        "En liten utescene i Byparken der det er konserter, dans og andre arrangementer. Det er benker, toalett og sykkelparkering i nærheten, og elva renner rett forbi.",
      tags: ["Gratis", "Ute", "Scene"],
      accessibility: ["Trinnfri inngang"],
      types: ["Kulturelle aktiviteter", "Festivaler"],
      photos: ["dans-4", "dans-3"],
      reviews: [
        [
          "Stine K.",
          5,
          "3 uker siden",
          "Hyggelig plass å sitte og se på folk som danser. Akkurat passe stort.",
        ],
        [
          "Mohammad R.",
          4,
          "2 måneder siden",
          "Fin scene midt i Sandvika. Lyden blir borte når det blåser mye fra fjorden.",
        ],
      ],
      chat: [
        ["Nils", "Noen som vet om det skjer noe på byscenen i helga?"],
        [
          "Aurora",
          "Swingklubben fra Jevnaker kommer på lørdag. Det pleier å bli fullt.",
        ],
      ],
      space: {
        facilities: ["Utescene", "Benker", "Toalett", "Sykkelparkering"],
        access: "Åpent for alle",
      },
    },
    opplevelse: {
      title: "Swing for nybegynnere",
      hostId: "u33",
      when: "Ons 19:00",
      repeat: "Ukentlig",
      venue: "organisasjon",
      capacity: 20,
      going: 12,
      priceNok: 150,
      about:
        "To timer med grunntrinnene i lindy hop. Vi bytter partner hele tiden, så du kan komme alene, og den siste halvtimen danser vi fritt til musikk.",
      category: "Sosialt",
      duration: "2 timer",
      durationMin: 120,
      included: ["Kaffe og kjeks i pausen"],
      vibes: ["Sosialt", "Lærerikt"],
      types: ["Kulturelle aktiviteter", "Trening"],
      audiences: ["Alenereisende", "Par", "Førstegangsbesøkende"],
      tags: ["Dans", "Swing", "Nybegynner"],
      photos: ["dans-1", "dans-5"],
      steps: [
        [
          "Grunntrinnet",
          "Mathilde viser trinnet sakte, og alle prøver uten partner først.",
          "dans-2",
        ],
        [
          "Partnerbytte",
          "Vi danser i ring og bytter partner etter hver sang.",
          "dans-1",
        ],
        [
          "En enkel tur",
          "Den første turen som får det til å se ut som dans.",
          "dans-5",
        ],
        [
          "Fri dans",
          "Lysene dempes, musikken skrus opp og alle danser med hvem de vil.",
          "dans-6",
        ],
      ],
      reviews: [
        [
          "Kristine",
          "Jevnaker",
          5,
          "2 uker siden",
          "Jeg har to venstreføtter og var livredd. Etter tre onsdager tør jeg å by opp.",
        ],
        [
          "Ivar",
          "Gran",
          5,
          "1 måned siden",
          "Kona og jeg trengte noe å gjøre sammen en hverdagskveld. Dette ble det.",
        ],
        [
          "Asbjørn",
          "Hønefoss",
          4,
          "2 måneder siden",
          "Morsomt og godt forklart. Litt lang kjøretur for meg, men verdt det de fleste ukene.",
        ],
      ],
      chat: [
        [
          "Mathilde Aune",
          "Velkommen! Ta med sko med glatt såle, joggesko blir fort klissete på gulvet.",
        ],
        ["Kristine", "Må vi ha med partner?"],
        ["Mathilde Aune", "Nei, vi bytter hele tiden. Kom som du er."],
      ],
    },
    arrangement: {
      title: "Swingfest i Byparken",
      hostId: "u33",
      when: "Lør 13:00",
      days: 1,
      venue: "byrom",
      organizer: "organisasjon",
      capacity: 150,
      going: 38,
      about:
        "Swingklubben fra Jevnaker tar med musikk og dansegulv til Byscenen i Sandvika. Det blir en kort danseskole for nye, fri dans hele ettermiddagen og et lite band mot slutten.",
      category: "Musikk",
      duration: "Hele dagen",
      durationMin: 300,
      included: ["Danseskole for nye", "Levende musikk"],
      vibes: ["Sosialt", "Koselig"],
      types: ["Kulturelle aktiviteter", "Festivaler"],
      audiences: ["Store grupper", "Par", "Førstegangsbesøkende"],
      tags: ["Dans", "Swing", "Utendørs"],
      photos: ["dans-3", "dans-4"],
      steps: [
        [
          "Lør 13:00 · Danseskole",
          "En halvtime med grunntrinnet for alle som vil prøve.",
          "dans-3",
        ],
        [
          "Lør 13:30 · Fri dans",
          "DJ-en spiller swing og jazz, og folk fra klubben byr opp de nye.",
          "dans-4",
        ],
        [
          "Lør 16:00 · Band på scenen",
          "Et lite band spiller resten av ettermiddagen.",
          "dans-6",
        ],
        [
          "Lør 17:30 · Siste dans",
          "Vi avslutter med en felles linjedans før vi rydder.",
          "dans-1",
        ],
      ],
      reviews: [
        [
          "Karoline",
          "Sandvika",
          5,
          "1 år siden",
          "Gikk forbi på tur og ble stående i to timer. Uka etter meldte jeg meg på kurs.",
        ],
        [
          "Geir",
          "Bekkestua",
          4,
          "1 år siden",
          "God stemning og fint band. Det var litt trangt på dansegulvet de siste timene.",
        ],
        [
          "Hira",
          "Jevnaker",
          5,
          "1 år siden",
          "Hele klubben tok bussen fra Jevnaker sammen. Årets beste dag.",
        ],
      ],
      chat: [
        [
          "Jevnaker Swingklubb",
          "Vi gleder oss til Sandvika! Bandet er klart, og danseskolen starter klokka ett.",
        ],
        ["Petra", "Kan man komme uten å kunne danse?"],
        [
          "Mathilde Aune",
          "Det er nettopp derfor vi har danseskole først. Bare kom.",
        ],
      ],
    },
    gruppe: {
      name: "Sosialdans på søndager",
      about:
        "Vi møtes på Studio Takt søndag ettermiddag og danser swing, salsa og det folk har lyst til. Ingen undervisning, bare dans.",
      rules: "Alle byr opp alle, og et nei takk er helt greit. Ta med innesko.",
      photos: ["dans-6", "dans-2"],
      memberCount: 52,
      home: "bedrift",
      alsoInterests: ["jazz"],
      access: "open",
      chat: [
        ["Elise", "Hvem kommer på søndag? Jeg tar med en venn som er helt ny."],
        ["Joakim", "Jeg er der fra fire. Vi viser henne grunntrinnet."],
        ["Elise", "Hun blir glad for det!"],
      ],
    },
  },
];
