// Seeds for the Trening interests, part E (Phase 19): Svømming,
// Styrketrening. Hand-written MOCK content: businesses, clubs and events are
// fictional; outdoor places use their public names with modest, general
// descriptions (facilities as OpenStreetMap shows them). See
// docs/fixtures/VOICE.md.
import type { InterestSeed } from "./types";

export const TRENING_E: InterestSeed[] = [
  {
    interest: "svomming",
    bedrift: {
      name: "Bassengkanten",
      category: "Svømmeskole",
      coord: [10.6355, 59.9128],
      town: "Lysaker",
      address: "Lysaker torg 25, 1366 Lysaker",
      hours: "Man–fre 06–21 · Lør 08–16",
      priceNok: 300,
      vibes: ["Rolig", "Energisk"],
      blurb: "Svømmeskole for voksne med et lite basseng og små grupper.",
      about:
        "Et 20-metersbasseng i kjelleren på Lysaker torg, med varmt vann, garderober og instruktører som bare underviser voksne. Gruppene er små, så du får rettet på teknikken underveis.",
      tags: ["Voksne", "Små grupper", "Crawl"],
      accessibility: ["Heis", "Rullestol-WC"],
      types: ["Trening", "Vannsport"],
      audiences: ["Alenereisende", "Førstegangsbesøkende"],
      durationMin: 60,
      photos: ["svomming-1", "svomming-5"],
      reviews: [
        [
          "Elisabeth M.",
          5,
          "1 uke siden",
          "Jeg har vært redd for å ha ansiktet i vannet hele livet. Etter seks uker crawler jeg 25 meter.",
        ],
        [
          "Arild H.",
          4,
          "1 måned siden",
          "Flinke instruktører og fint basseng. Garderobene er trange når to grupper bytter.",
        ],
        [
          "Maja K.",
          5,
          "2 måneder siden",
          "Morgentimene før jobb har blitt det beste i uka mi.",
        ],
      ],
      chat: [
        [
          "Bassengkanten",
          "Nytt crawlkurs for voksne starter mandag. Badehette får du hos oss.",
        ],
        ["Arild", "Kan jeg komme på en morgentime uten å gå på kurs?"],
        [
          "Bassengkanten",
          "Ja, morgenbanene er åpne for alle. Si fra i resepsjonen når du kommer.",
        ],
      ],
      business: {
        name: "Bassengkanten AS",
        verified: true,
        about:
          "Svømmeskole for voksne på Lysaker, drevet av to tidligere konkurransesvømmere siden 2016.",
      },
    },
    organisasjon: {
      name: "Voksensvømmerne på Kolsås",
      category: "Svømmeklubb",
      coord: [10.505, 59.917],
      town: "Kolsås",
      address: "Rødskiferveien, 1352 Kolsås",
      hours: "Man og tor 19–21",
      priceNok: 0,
      vibes: ["Sosial", "Energisk"],
      blurb: "Svømmeklubb for voksne som vil trene sammen, uansett fart.",
      about:
        "Vi trener i basseng to kvelder i uka, delt i baner etter fart, og tar turer i sjøen når det er varmt nok. Mange begynte på kurs i voksen alder og ble med videre.",
      tags: ["Voksne", "Baner etter fart", "Sjøsvømming"],
      accessibility: ["Trinnfri inngang"],
      types: ["Trening", "Vannsport"],
      photos: ["svomming-2", "svomming-5"],
      reviews: [
        [
          "Tonje S.",
          5,
          "1 måned siden",
          "Jeg er den tregeste i bane én og har det helt fint. Samira passer på at alle får en plan.",
        ],
        [
          "Bjørnar L.",
          4,
          "2 måneder siden",
          "Gode økter, men det kan bli trangt i de raske banene.",
        ],
      ],
      chat: [
        [
          "Voksensvømmerne på Kolsås",
          "Torsdag blir det teknikkøkt med fokus på pust. Alle baner.",
        ],
        ["Tonje", "Hvilken bane bør jeg begynne i?"],
        ["Samira Hussein", "Start i bane én, så flytter du når du vil."],
      ],
      org: {
        form: "Klubb",
        about:
          "Svømmeklubb på Kolsås for voksne på alle nivåer. Vi trener i basseng, svømmer i sjøen når den er varm og har en svømmedag for nye.",
        activities: [
          "Bassengtrening mandag og torsdag",
          "Teknikkøkter for nye",
          "Sjøsvømming når vannet er varmt",
        ],
        contactPersonId: "u39",
      },
    },
    byrom: {
      name: "Høvikodden badestrand",
      category: "Badeplass",
      coord: [10.5535, 59.889],
      town: "Sandvika",
      address: "Kyststien, 1311 Høvikodden",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Rolig", "Sosial"],
      blurb:
        "Badestrand ytterst på Høvikodden, like ved Henie Onstad kunstsenter.",
      about:
        "En liten strand ved kyststien på Høvikodden, med toaletter, benker og en grillplass. Kunstparken rundt Henie Onstad ligger rett ved, og mange kombinerer en tur i parken med et bad.",
      tags: ["Gratis", "Ute", "Bading"],
      accessibility: ["Trinnfri inngang"],
      types: ["Vannsport", "Friluftsliv"],
      photos: ["svomming-4", "svomming-3"],
      reviews: [
        [
          "Helga B.",
          5,
          "3 uker siden",
          "Rolig strand med fin utsikt. Vi svømmer langs land og tar kaffe i parken etterpå.",
        ],
        [
          "Andreas F.",
          4,
          "2 måneder siden",
          "Fint sted, men parkeringen koster og fylles fort. Kom med buss eller sykkel.",
        ],
      ],
      chat: [
        [
          "Helga",
          "Noen som skal ta en svømmetur fra Høvikodden i morgen tidlig?",
        ],
        ["Andreas", "Jeg er der klokka sju."],
      ],
      space: {
        facilities: [
          "Badeplass",
          "Benker",
          "Toalett",
          "Grillplass",
          "Turvei",
          "Parkering",
        ],
        access: "Åpent for alle",
      },
    },
    opplevelse: {
      title: "Crawl for voksne",
      hostId: "u39",
      when: "Man 19:00",
      repeat: "Ukentlig",
      venue: "bedrift",
      capacity: 6,
      going: 4,
      priceNok: 350,
      about:
        "En time i bassenget der du lærer å puste rolig, ligge riktig i vannet og ta de første crawltakene. Vi jobber i små grupper, og alle får tid med instruktøren.",
      category: "Sport & trening",
      duration: "1 time",
      durationMin: 60,
      languages: ["Norsk", "Engelsk"],
      included: ["Badehette", "Lån av svømmebriller", "Garderobe"],
      vibes: ["Lærerikt", "Rolig"],
      types: ["Trening", "Vannsport"],
      audiences: ["Alenereisende", "Førstegangsbesøkende"],
      tags: ["Svømming", "Crawl", "Nybegynner"],
      photos: ["svomming-5", "svomming-1"],
      steps: [
        [
          "Pust og flyt",
          "Vi starter på grunt vann og øver på å puste ut under vann.",
          "svomming-1",
        ],
        [
          "Bein og armer",
          "Beinspark med brett, så armtak ett om gangen.",
          "svomming-5",
        ],
        [
          "Hele crawlen",
          "Vi setter det sammen over korte strekninger.",
          "svomming-2",
        ],
        [
          "Rolig avslutning",
          "Et par rolige lengder og tips til neste gang.",
          "svomming-1",
        ],
      ],
      reviews: [
        [
          "Gro",
          "Lysaker",
          5,
          "1 uke siden",
          "Samira fikk meg til å slutte å holde pusten. Det endret alt.",
        ],
        [
          "Ståle",
          "Fornebu",
          5,
          "1 måned siden",
          "Små grupper betyr at du faktisk får hjelp. Verdt pengene.",
        ],
        [
          "Mira",
          "Stabekk",
          4,
          "2 måneder siden",
          "Lærerikt, men en time går veldig fort. Jeg skulle gjerne hatt dobbel time.",
        ],
      ],
      chat: [
        [
          "Samira Hussein",
          "Velkommen! Ta med badetøy og håndkle. Briller og hette får dere her.",
        ],
        ["Gro", "Hva om jeg ikke klarer å svømme en hel lengde?"],
        ["Samira Hussein", "Det trenger du ikke. Vi begynner på grunt vann."],
      ],
    },
    arrangement: {
      title: "Svømmedagen på Lysaker",
      hostId: "u39",
      when: "Søn 10:00",
      days: 1,
      venue: "bedrift",
      organizer: "organisasjon",
      capacity: 30,
      going: 16,
      priceNok: 150,
      about:
        "En dag i bassenget på Lysaker for voksne som vil bli bedre i vannet. Klubben har teknikkøkter etter nivå om formiddagen og en rolig fellessvømming etter lunsj.",
      category: "Sport & trening",
      duration: "Hele dagen",
      durationMin: 300,
      included: ["Teknikkøkt", "Lunsj", "Badehette"],
      vibes: ["Lærerikt", "Sosialt"],
      types: ["Trening", "Vannsport"],
      audiences: ["Førstegangsbesøkende", "Alenereisende", "Store grupper"],
      tags: ["Svømming", "Teknikk"],
      photos: ["svomming-2", "svomming-1"],
      steps: [
        [
          "Søn 10:00 · Velkommen",
          "Kaffe i resepsjonen og inndeling i grupper etter hvor du er.",
          "svomming-1",
        ],
        [
          "Søn 10:30 · Teknikkøkt",
          "Små grupper med en instruktør hver.",
          "svomming-5",
        ],
        [
          "Søn 12:30 · Lunsj",
          "Vi spiser sammen og snakker om det vi lærte.",
          "svomming-2",
        ],
        [
          "Søn 13:30 · Fellessvømming",
          "En rolig økt der alle svømmer i sitt eget tempo.",
          "svomming-2",
        ],
      ],
      reviews: [
        [
          "Karin",
          "Kolsås",
          5,
          "1 år siden",
          "Jeg lærte mer på én dag enn på et halvt år alene. Hyggelig gjeng.",
        ],
        [
          "Espen",
          "Lysaker",
          4,
          "1 år siden",
          "Godt opplegg. Gruppa mi var litt stor, så det ble mye venting ved kanten.",
        ],
        [
          "Benedikte",
          "Bekkestua",
          5,
          "1 år siden",
          "Fin dag for oss som ikke har svømt siden skolen.",
        ],
      ],
      chat: [
        [
          "Voksensvømmerne på Kolsås",
          "Gruppene settes opp på stedet etter hvor dere er. Ingen trenger å kunne crawle.",
        ],
        ["Espen", "Får vi låne svømmebriller?"],
        [
          "Samira Hussein",
          "Ja, vi har med en kasse med briller i alle størrelser.",
        ],
      ],
    },
    gruppe: {
      name: "Morgensvømmerne på Høvikodden",
      about:
        "Vi svømmer langs land fra Høvikodden tidlig om morgenen så lenge vannet er behagelig, og tar en kort dukkert resten av året. Kaffe i parken etterpå.",
      rules:
        "Si fra i chatten kvelden før hvis du blir med. Den som kommer først setter på kaffen.",
      photos: ["svomming-3", "svomming-4"],
      memberCount: 33,
      home: "byrom",
      alsoInterests: ["bading"],
      access: "open",
      chat: [
        ["Helga", "I morgen klokka sju? Rolig tur bort til odden og tilbake."],
        ["Ola", "Jeg er med. Tar med termos."],
        ["Helga", "Fint, jeg tar med kopper."],
      ],
    },
  },
  {
    interest: "styrketrening",
    bedrift: {
      name: "Jernhuset",
      category: "Treningssenter",
      coord: [10.838, 59.72],
      town: "Ski",
      address: "Gågata i Ski 6, 1400 Ski",
      hours: "Hver dag 05–23",
      priceNok: 400,
      vibes: ["Energisk", "Rolig"],
      blurb:
        "Treningssenter i Ski med frivekter, stativer og instruktører på gulvet.",
      about:
        "Et lite treningssenter med fem knebøystativer, frivekter og et eget rom for kettlebells. Instruktørene går rundt på gulvet om kveldene og viser deg teknikk hvis du vil.",
      tags: ["Frivekter", "Instruktør på gulvet", "Kettlebells"],
      accessibility: ["Trinnfri inngang", "Rullestol-WC"],
      types: ["Trening"],
      audiences: ["Alenereisende", "Førstegangsbesøkende", "Lokalkjente"],
      durationMin: 60,
      photos: ["styrketrening-1", "styrketrening-5"],
      reviews: [
        [
          "Trude A.",
          5,
          "2 uker siden",
          "Endelig et treningssenter der ingen ser rart på deg ved vektstanga. Instruktørene er gull.",
        ],
        [
          "Glenn H.",
          4,
          "1 måned siden",
          "Godt utstyr og rolig stemning. Litt kø ved stativene mellom fem og sju.",
        ],
        [
          "Rebecca N.",
          5,
          "2 måneder siden",
          "Jeg begynte på nybegynnerkurset og har trent her tre ganger i uka siden.",
        ],
      ],
      chat: [
        [
          "Jernhuset",
          "Nytt kurs for nybegynnere på tirsdager. Spør på gulvet om du lurer på noe.",
        ],
        ["Glenn", "Har dere vektløftersko til utlån?"],
        ["Jernhuset", "Vi har noen par i resepsjonen. Spør der."],
      ],
      business: {
        name: "Jernhuset Ski AS",
        verified: true,
        about:
          "Treningssenter i Ski sentrum, drevet av to styrkeløftere siden 2019.",
      },
    },
    organisasjon: {
      name: "Styrkelaget i Enebakk",
      category: "Treningslag",
      coord: [11.145, 59.758],
      town: "Enebakk",
      address: "Lillestrømveien, 1912 Enebakk",
      hours: "Man og ons 18–20",
      priceNok: 0,
      vibes: ["Sosial", "Energisk"],
      blurb: "Treningslag i Enebakk for voksne som vil bli sterkere sammen.",
      about:
        "Vi trener styrke i en gammel gymsal i Enebakk to kvelder i uka, med vekter, kettlebells og egen kroppsvekt. Ingen konkurrerer, men alle skriver ned løftene sine og heier på hverandre.",
      tags: ["Kettlebells", "Egen kroppsvekt", "Voksne"],
      accessibility: ["Trinnfri inngang"],
      types: ["Trening"],
      photos: ["styrketrening-3", "styrketrening-2"],
      reviews: [
        [
          "Merete A.",
          5,
          "1 måned siden",
          "Jeg var 58 og hadde aldri løftet en vekt. Nå tar jeg markløft med et smil.",
        ],
        [
          "Stein Arne K.",
          4,
          "2 måneder siden",
          "Fin gjeng og godt opplegg. Utstyret er enkelt, men det holder lenge.",
        ],
      ],
      chat: [
        [
          "Styrkelaget i Enebakk",
          "Onsdag tester vi knebøy. Bare de som vil, resten trener som vanlig.",
        ],
        ["Merete", "Kan jeg ta med en venninne som er helt ny?"],
        ["Hege Sundby", "Selvsagt. Vi viser henne de første øvelsene."],
      ],
      org: {
        form: "Lag",
        about:
          "Treningslag i Enebakk for voksne som vil bli sterkere. Vi trener sammen, lærer hverandre teknikk og arrangerer en styrkedag for nye.",
        activities: [
          "Trening mandag og onsdag",
          "Teknikkveld for nye",
          "Styrkedag i Ski",
        ],
        contactPersonId: "u40",
      },
    },
    byrom: {
      name: "Tufteparken Risenga",
      category: "Treningspark",
      coord: [10.4436, 59.8232],
      town: "Asker",
      address: "Myrabakken, 1386 Asker",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Energisk", "Sosial"],
      blurb: "Utendørs treningspark på Risenga, ved siden av kunstisbanen.",
      about:
        "En treningspark ute på Risenga, med kunstisbanen og en cricketbane like ved. Det går gang- og sykkelveier rundt, og mange tar en økt her før eller etter en løpetur.",
      tags: ["Gratis", "Ute", "Egen kroppsvekt"],
      accessibility: ["Trinnfri inngang"],
      types: ["Trening", "Friluftsliv"],
      photos: ["styrketrening-6", "styrketrening-4"],
      reviews: [
        [
          "Sondre B.",
          5,
          "1 uke siden",
          "Gratis og alltid åpen. Jeg tar en økt her tre morgener i uka.",
        ],
        [
          "Hedvig M.",
          4,
          "1 måned siden",
          "Fint område, og godt å trene ute. Mindre hyggelig i regnvær, naturlig nok.",
        ],
      ],
      chat: [
        ["Sondre", "Noen som vil ta en økt på Risenga i morgen klokka sju?"],
        ["Iben", "Jeg er med. Vi kan ta en runde rundt etterpå."],
      ],
      space: {
        facilities: ["Turvei", "Ballbane"],
        access: "Åpent for alle",
        season: "Hele året",
      },
    },
    opplevelse: {
      title: "Styrketrening for nybegynnere",
      hostId: "u40",
      when: "Tir 18:00",
      repeat: "Ukentlig",
      venue: "bedrift",
      capacity: 8,
      going: 6,
      priceNok: 250,
      about:
        "En time der du lærer tre grunnøvelser, knebøy, markløft og press, med lette vekter og god tid. Hege viser hvordan du lager en enkel plan du kan følge på egen hånd.",
      category: "Sport & trening",
      duration: "1 time",
      durationMin: 60,
      languages: ["Norsk", "Engelsk"],
      included: ["Tilgang til senteret samme dag", "Treningsplan"],
      vibes: ["Lærerikt", "Rolig"],
      types: ["Trening"],
      audiences: ["Alenereisende", "Førstegangsbesøkende"],
      tags: ["Styrke", "Nybegynner"],
      photos: ["styrketrening-2", "styrketrening-5"],
      steps: [
        [
          "Oppvarming",
          "Rolig bevegelse og noen lette øvelser uten vekt.",
          "styrketrening-3",
        ],
        [
          "Knebøy",
          "Hege viser teknikken, og du prøver med stang uten vekt først.",
          "styrketrening-2",
        ],
        [
          "Markløft og press",
          "Samme rolige tempo, med lette vekter.",
          "styrketrening-5",
        ],
        [
          "Din egen plan",
          "Du får en enkel plan for de neste ukene.",
          "styrketrening-1",
        ],
      ],
      reviews: [
        [
          "Monika",
          "Ski",
          5,
          "2 uker siden",
          "Hege tar seg tid til alle. Jeg gikk derfra med en plan og en helt ny følelse av å høre hjemme der.",
        ],
        [
          "Atle",
          "Langhus",
          5,
          "1 måned siden",
          "Akkurat det jeg trengte. Ingen mas, bare god forklaring.",
        ],
        [
          "Tina",
          "Kråkstad",
          4,
          "2 måneder siden",
          "Lærerikt, men jeg skulle ønske det var to timer. Det er mye å huske.",
        ],
      ],
      chat: [
        ["Hege Sundby", "Velkommen! Ta med innesko og noe å drikke."],
        [
          "Monika",
          "Jeg har aldri vært på et treningssenter. Er det dumt å komme?",
        ],
        [
          "Hege Sundby",
          "Overhodet ikke. Mange av de beste her startet akkurat sånn.",
        ],
      ],
    },
    arrangement: {
      title: "Styrkedagen i Ski",
      hostId: "u40",
      when: "Lør 10:00",
      days: 1,
      venue: "bedrift",
      organizer: "organisasjon",
      capacity: 30,
      going: 18,
      priceNok: 100,
      about:
        "En lørdag på Jernhuset der Styrkelaget viser hvordan de trener. Du får prøve knebøy, markløft og kettlebells i små grupper, og etter lunsj kan du teste et løft med heiagjeng.",
      category: "Sport & trening",
      duration: "Hele dagen",
      durationMin: 300,
      included: ["Lån av utstyr", "Lunsj"],
      vibes: ["Sosialt", "Hands-on"],
      energy: "Høyt",
      types: ["Trening"],
      audiences: ["Førstegangsbesøkende", "Alenereisende", "Store grupper"],
      tags: ["Styrke", "Åpen dag"],
      photos: ["styrketrening-3", "styrketrening-1"],
      steps: [
        [
          "Lør 10:00 · Velkommen",
          "Kaffe og en kort prat om hva dagen skal handle om.",
          "styrketrening-1",
        ],
        [
          "Lør 10:30 · Grupper på gulvet",
          "Små grupper prøver knebøy, markløft og kettlebells.",
          "styrketrening-3",
        ],
        [
          "Lør 12:30 · Lunsj",
          "Vi spiser sammen og bytter erfaringer.",
          "styrketrening-5",
        ],
        [
          "Lør 13:30 · Løft med heiagjeng",
          "Den som vil, tester et løft mens resten heier.",
          "styrketrening-2",
        ],
      ],
      reviews: [
        [
          "Gunn",
          "Enebakk",
          5,
          "1 år siden",
          "Jeg ble med for å se på og endte med å løfte 60 kilo i markløft. Stemningen var helt fantastisk.",
        ],
        [
          "Sverre",
          "Ski",
          4,
          "1 år siden",
          "Godt organisert, men for mange på gulvet samtidig før lunsj.",
        ],
        [
          "Fatma",
          "Kolbotn",
          5,
          "1 år siden",
          "Fint å se at det ikke bare er unge gutter som løfter. Kommer tilbake i år.",
        ],
      ],
      chat: [
        [
          "Styrkelaget i Enebakk",
          "Vi har med instruktører ved hver stasjon. Ta med treningstøy og innesko.",
        ],
        ["Sverre", "Er det greit å bare komme og se på?"],
        ["Hege Sundby", "Så klart. Mange prøver litt når de først er der."],
      ],
    },
    gruppe: {
      name: "Utetrening på Risenga",
      about:
        "Vi trener ute i treningsparken på Risenga tre morgener i uka, med egen kroppsvekt og et par kettlebells vi tar med. Tidene avtales i chatten.",
      rules:
        "Alle trener i sitt eget tempo. Den som kommer først, setter opp musikk på lav lyd.",
      photos: ["styrketrening-4", "styrketrening-6"],
      memberCount: 36,
      home: "byrom",
      alsoInterests: ["loping"],
      access: "open",
      chat: [
        ["Iben", "Fredag klokka sju? Jeg tar med to kettlebells."],
        ["Sondre", "Jeg er med."],
        ["Iben", "Bra, vi sees ved treningsparken."],
      ],
    },
  },
];
