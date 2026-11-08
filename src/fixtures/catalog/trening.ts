// Seeds for the Trening interests (Phase 19). Hand-written MOCK content:
// businesses, clubs and festivals are fictional; outdoor places use their
// public names with modest, general descriptions. See docs/fixtures/VOICE.md.
import type { InterestSeed } from "./types";

export const TRENING: InterestSeed[] = [
  {
    interest: "klatring",
    bedrift: {
      name: "Bratt Buldresenter",
      category: "Buldresenter",
      coord: [11.0438, 59.9575],
      town: "Lillestrøm",
      address: "Storgata 21, 2000 Lillestrøm",
      hours: "Man–fre 10–23 · Lør–søn 10–20",
      priceNok: 170,
      vibes: ["Energisk", "Sosial"],
      blurb: "Buldring under ett tak, med vegger for alle nivåer.",
      about:
        "Stor buldrehall med nye problemer hver uke, et eget hjørne for nybegynnere og en kafé der folk blir sittende etter økta.",
      tags: ["Drop-in", "Leie av sko", "Kafé"],
      accessibility: ["Trinnfri inngang", "Rullestol-WC"],
      types: ["Trening"],
      audiences: ["Alenereisende", "Store grupper", "Førstegangsbesøkende"],
      durationMin: 120,
      photos: ["klatring-1", "klatring-3"],
      reviews: [
        [
          "Ingrid S.",
          5,
          "2 uker siden",
          "Kom alene en tirsdag og fikk tips av folk på matta. Veggene for nybegynnere er lette nok til å komme i gang.",
        ],
        [
          "Tobias L.",
          4,
          "1 måned siden",
          "Bra variasjon og hyggelige folk i resepsjonen. Det blir trangt etter klokka seks, så kom tidlig hvis du vil ha plass.",
        ],
        [
          "Live J.",
          5,
          "3 uker siden",
          "Kaffen er bedre enn den trenger å være. Problemene skrus om ofte, så det blir aldri kjedelig.",
        ],
      ],
      chat: [
        [
          "Bratt Buldresenter",
          "Nye problemer på den gule veggen fra i dag. Si fra hvis noe er for snilt gradert.",
        ],
        ["Sindre", "Den blå i hjørnet er rå. Tok meg fem forsøk."],
        ["Tiril", "Noen som skal dit i kveld rundt sju?"],
      ],
      business: {
        name: "Bratt Buldring AS",
        verified: true,
        about: "Buldrehall på Lillestrøm, drevet av fire klatrere siden 2019.",
      },
    },
    organisasjon: {
      name: "Hengetak Klatrelag",
      category: "Klatrelag",
      coord: [10.4371, 59.8318],
      town: "Asker",
      address: "Kirkeveien 12, 1384 Asker",
      hours: "Tir og tor 18–22",
      priceNok: 0,
      vibes: ["Sosial", "Energisk"],
      blurb: "Klatrelag for alle som vil ut på fjellet.",
      about:
        "Klatrere i alle aldre som trener inne om vinteren og drar ut så snart fjellet er tørt. Nye folk får følge med noen som har klatret lenge.",
      tags: ["Nybegynnere", "Tau og sikring", "Turer"],
      accessibility: ["Trinnfri inngang"],
      types: ["Trening", "Friluftsliv"],
      photos: ["klatring-7", "klatring-5"],
      reviews: [
        [
          "Magnus H.",
          5,
          "1 måned siden",
          "Jeg hadde aldri sikret noen før. Etter tre kvelder var jeg klar for å bli med ut.",
        ],
        [
          "Selma A.",
          4,
          "2 måneder siden",
          "Fine folk og god stemning, men det tar litt tid å bli kjent med alle.",
        ],
      ],
      chat: [
        [
          "Hengetak Klatrelag",
          "Treningen torsdag flyttes til klokka sju denne uka.",
        ],
        ["Even", "Blir det tur til Kolsås i helga hvis det holder seg tørt?"],
        ["Nina Dahl", "Jeg er med. Kan ta med to i bilen fra Sandvika."],
      ],
      org: {
        form: "Lag",
        about:
          "Klatrelag i Asker for folk i alle aldre. Vi trener sammen, drar på turer og tar godt imot nye.",
        activities: [
          "Innetrening to kvelder i uka",
          "Turer til Kolsås og andre felt",
          "Kvelder for nye klatrere",
        ],
        contactPersonId: "u6",
      },
    },
    byrom: {
      name: "Kolsås klatrefelt",
      category: "Klatrefelt",
      coord: [10.4985, 59.9262],
      town: "Kolsås",
      address: "Kolsåstoppen, 1352 Kolsås",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Rolig", "Energisk"],
      blurb: "Bergvegger i skogen under Kolsåstoppen.",
      about:
        "Bergvegger i skogen med ruter for både nye og erfarne. På fine dager er det mange her med tau og buldrematter.",
      tags: ["Gratis", "Ute", "Hundevennlig"],
      accessibility: ["Ledsager for synshemmede"],
      types: ["Friluftsliv", "Trening"],
      photos: ["klatring-6", "klatring-5"],
      reviews: [
        [
          "Kristian E.",
          5,
          "1 uke siden",
          "Rolig på morgenen og fullt etter lunsj. Fin variasjon på kort avstand.",
        ],
        [
          "Amalie T.",
          4,
          "3 uker siden",
          "Flotte vegger, men stien opp er bratt og glatt når det har regnet.",
        ],
      ],
      chat: [
        ["Oskar", "Noen som har vært der i dag? Lurer på om veggen er tørr."],
        ["Frida", "Tørt på sørsiden ved lunsj."],
      ],
      space: {
        facilities: ["Turvei", "Parkering"],
        access: "Åpent for alle",
        season: "Sommer",
      },
    },
    opplevelse: {
      title: "Buldring for nye",
      hostId: "u6",
      when: "Tir 16:30",
      repeat: "Ukentlig",
      venue: "bedrift",
      capacity: 10,
      going: 7,
      priceNok: 190,
      about:
        "En rolig første ettermiddag på buldreveggen. Vi viser hvordan en økt foregår, hvordan du leser et problem og hvordan du tar pauser underveis.",
      category: "Sport & trening",
      duration: "2 timer",
      durationMin: 120,
      languages: ["Norsk", "Engelsk"],
      included: ["Leie av sko", "Kalk"],
      vibes: ["Lærerikt", "Sosialt"],
      types: ["Trening"],
      audiences: ["Alenereisende", "Førstegangsbesøkende"],
      tags: ["Klatring", "Nybegynner"],
      photos: ["klatring-4", "klatring-2"],
      steps: [
        [
          "Vi møtes i resepsjonen",
          "Du får sko i riktig størrelse og en kort runde i hallen.",
          "klatring-1",
        ],
        [
          "Oppvarming på matta",
          "Litt bevegelse og noen enkle ruter helt nede ved bakken.",
          "klatring-4",
        ],
        [
          "De første problemene",
          "Vi prøver de grønne problemene sammen og heier på hverandre.",
          "klatring-2",
        ],
        [
          "Kaffe etterpå",
          "Mange blir sittende i kafeen og prater om neste gang.",
          "klatring-9",
        ],
      ],
      reviews: [
        [
          "Hedda",
          "Lillestrøm",
          5,
          "1 uke siden",
          "Nina forklarer uten å gjøre det komplisert. Jeg kom meg opp tre problemer den første kvelden.",
        ],
        [
          "Yusuf",
          "Strømmen",
          5,
          "1 måned siden",
          "Perfekt hvis du ikke kjenner noen som klatrer. Vi var sju stykker, og alle var nye.",
        ],
        [
          "Marte",
          "Lørenskog",
          4,
          "2 måneder siden",
          "Lærerikt og hyggelig. Hadde gjerne hatt mer tid på veggen, men det var fordi vi pratet så mye.",
        ],
      ],
      chat: [
        [
          "Nina Dahl",
          "Hei alle! Ta på tøy du kan bevege deg i, sko får dere på stedet.",
        ],
        ["Hedda", "Kan man komme rett fra jobb uten å spise først?"],
        ["Nina Dahl", "Ta med noe lett å spise. Det er en kafé i hallen også."],
      ],
    },
    arrangement: {
      title: "Hengetak-dagene",
      hostId: "u6",
      when: "Lør 10:00",
      days: 2,
      venue: "byrom",
      organizer: "organisasjon",
      capacity: 120,
      going: 34,
      about:
        "To dager med klatring under Kolsåstoppen. Laget setter opp tau for nye, holder korte innføringer og har buldring i skogen på søndagen.",
      category: "Sport & trening",
      duration: "Hele dagen",
      durationMin: 420,
      included: ["Lån av sele og hjelm", "Kaffe begge dager"],
      vibes: ["Sosialt", "Hands-on"],
      types: ["Friluftsliv", "Trening"],
      audiences: ["Store grupper", "Førstegangsbesøkende", "Lokalkjente"],
      tags: ["Klatring", "Festival"],
      photos: ["klatring-8", "klatring-7"],
      steps: [
        [
          "Lør 10:00 · Åpning",
          "Laget tar imot nede ved stien og deler folk inn etter erfaring.",
          "klatring-8",
        ],
        [
          "Lør 12:00 · Tau for nye",
          "Ruter med tau ferdig satt opp, med folk fra laget ved hver vegg.",
          "klatring-7",
        ],
        [
          "Lør 17:00 · Kaffe og prat",
          "Vi samles ved stien og snakker om dagen.",
          "klatring-5",
        ],
        [
          "Søn 10:00 · Buldring i skogen",
          "Buldrematter fram til blokkene og en rolig avslutning utover dagen.",
          "klatring-6",
        ],
      ],
      reviews: [
        [
          "Sigrid",
          "Bekkestua",
          5,
          "1 år siden",
          "Var der i fjor med to venninner som aldri hadde klatret. Begge har kjøpt sko siden.",
        ],
        [
          "Lars",
          "Sandvika",
          4,
          "1 år siden",
          "God stemning og folk som tok seg tid. Det ble mye venting ved de enkleste rutene på lørdagen.",
        ],
        [
          "Aisha",
          "Asker",
          5,
          "1 år siden",
          "Søndagen med buldring i skogen var det beste. Kommer igjen i år.",
        ],
      ],
      chat: [
        [
          "Hengetak Klatrelag",
          "Programmet er klart! Si fra her hvis dere trenger sele i liten størrelse.",
        ],
        ["Even", "Blir det samkjøring fra Asker stasjon?"],
        [
          "Nina Dahl",
          "Jeg kjører fra Asker kvart over ni lørdag og har to ledige plasser.",
        ],
      ],
    },
    gruppe: {
      name: "Buldrevenner på Romerike",
      about:
        "For deg som vil ha noen å buldre med. Vi avtaler kvelder i chatten og møtes som regel på Bratt.",
      rules:
        "Si fra i chatten hvis du kommer. Alle nivåer er velkomne, og vi venter på hverandre.",
      photos: ["klatring-9", "klatring-3"],
      memberCount: 46,
      home: "bedrift",
      access: "open",
      chat: [
        ["Vilde", "Noen som vil buldre torsdag etter jobb?"],
        ["Sander", "Jeg er med, kommer rundt halv seks."],
        ["Vilde", "Topp, vi ses ved den gule veggen."],
      ],
    },
  },
];
