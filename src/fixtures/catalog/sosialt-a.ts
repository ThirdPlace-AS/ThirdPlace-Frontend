// Seeds for the Sosialt og spill interests, part one (Phase 19): Brettspill,
// Sjakk, Diskusjon. Hand-written MOCK content: businesses, clubs and events
// are fictional; outdoor places use their public names with modest, general
// descriptions. Brettspill's Opplevelse is the legacy e5. See
// docs/fixtures/VOICE.md.
import type { InterestSeed } from "./types";

export const SOSIALT_A: InterestSeed[] = [
  {
    interest: "brettspill",
    bedrift: {
      name: "Terningen Spillkafé",
      category: "Spillkafé",
      coord: [10.884, 59.9607],
      town: "Grorud",
      address: "Romsåsveien 6, 0962 Oslo",
      hours: "Tir–fre 15–23 · Lør 12–23 · Søn 12–20",
      priceNok: 60,
      vibes: ["Sosial", "Koselig"],
      blurb:
        "Kafé med vegger fulle av brettspill og folk som hjelper deg å velge.",
      about:
        "Spillkafé ved T-banen på Grorud. Du betaler en liten spilleavgift, finner et bord og låner det du vil fra hyllene. De ansatte forklarer reglene hvis dere står fast.",
      tags: ["Spillbibliotek", "Kafé", "Regelhjelp"],
      accessibility: ["Trinnfri inngang", "Rullestol-WC"],
      types: ["Kulturelle aktiviteter"],
      audiences: ["Store grupper", "Par", "Førstegangsbesøkende"],
      durationMin: 180,
      photos: ["brettspill-1", "brettspill-4"],
      reviews: [
        [
          "Sanna K.",
          5,
          "1 uke siden",
          "Vi var fire som aldri hadde spilt noe tyngre enn Ludo. Han bak disken fant et spill til oss og ble stående og forklare i ti minutter.",
        ],
        [
          "Haris M.",
          4,
          "3 uker siden",
          "Stort utvalg og god kaffe. Litt bråkete på lørdagskveldene, så ta en ukedag hvis du vil prate.",
        ],
        [
          "Ellinor T.",
          5,
          "2 måneder siden",
          "Spilleavgiften er verdt det. Vi satt der i fem timer, og ingen maste på oss.",
        ],
      ],
      chat: [
        [
          "Terningen Spillkafé",
          "Ti nye spill i hyllene denne uka. Spør i disken hvis dere vil ha et tips.",
        ],
        ["Andreas", "Er det ledig bord for seks i kveld rundt sju?"],
        [
          "Terningen Spillkafé",
          "Det er ledig nå. Bare kom innom, så holder vi av langbordet.",
        ],
      ],
      business: {
        name: "Terningen Spillkafé AS",
        verified: true,
        about:
          "Spillkafé på Grorud, åpnet av to venner som var lei av å spille på kjøkkenbordet.",
      },
    },
    organisasjon: {
      name: "Spillforeningen på Kolbotn",
      category: "Spillforening",
      coord: [10.7985, 59.8118],
      town: "Kolbotn",
      address: "Kolbotnveien 22, 1410 Kolbotn",
      hours: "Fre 18–23",
      priceNok: 0,
      vibes: ["Sosial", "Koselig"],
      blurb: "Fredagsspill i et stort lokale, for alle som liker brettspill.",
      about:
        "Vi spiller brettspill hver fredag i et lokale med lange bord og god plass. Foreningen har en egen spillsamling, og de som har spilt lenge, lærer gjerne bort.",
      tags: ["Fredagsspill", "Nybegynnere", "Egen spillsamling"],
      accessibility: ["Trinnfri inngang", "Rullestol-WC"],
      types: ["Kulturelle aktiviteter"],
      photos: ["brettspill-2", "brettspill-3"],
      reviews: [
        [
          "Kjersti A.",
          5,
          "2 uker siden",
          "Kom alene første gang og ble plassert ved et bord med tre hyggelige folk. Har vært der hver fredag siden.",
        ],
        [
          "Fredrik H.",
          4,
          "1 måned siden",
          "God stemning. Det kan ta litt tid å komme i gang med et spill når det kommer mange på en gang.",
        ],
      ],
      chat: [
        [
          "Spillforeningen på Kolbotn",
          "Fredag setter vi fram et bord bare for nye. Mats tar imot fra klokka seks.",
        ],
        ["Ingvild", "Kan man ta med egne spill?"],
        [
          "Mats Eriksen",
          "Selvfølgelig. Ta med det du har, så finner vi noen å spille med.",
        ],
      ],
      org: {
        form: "Forening",
        about:
          "Spillforening på Kolbotn for voksne som liker brettspill. Vi møtes hver fredag og deler en felles spillsamling.",
        activities: [
          "Spillkvelder hver fredag",
          "Eget bord for nye spillere",
          "Spilldagene på Kolbotn, to dager med spill",
        ],
        contactPersonId: "u17",
      },
    },
    byrom: {
      name: "Torshovparken",
      category: "Park",
      coord: [10.771, 59.9354],
      town: "Torshov",
      address: "Torshovparken, 0480 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Rolig", "Sosial"],
      blurb: "Stor park på Torshov med benker, piknikbord og lekeplasser.",
      about:
        "Park med plener, benker og piknikbord mellom bygårdene på Torshov. Piknikbordene er fine å samles rundt med et kortspill på varme dager.",
      tags: ["Gratis", "Ute", "Piknikbord"],
      accessibility: ["Trinnfri inngang"],
      types: ["Friluftsliv"],
      photos: ["brettspill-6", "brettspill-7"],
      reviews: [
        [
          "Sverre L.",
          5,
          "3 uker siden",
          "Vi tok med et par kortspill og ble sittende ved piknikbordene hele ettermiddagen.",
        ],
        [
          "Mona E.",
          4,
          "2 måneder siden",
          "Fin park, men bordene blir fort tatt på solskinnsdager.",
        ],
      ],
      chat: [
        [
          "Ida",
          "Noen som vil spille kort i parken på søndag hvis det blir oppholdsvær?",
        ],
        ["Kasper", "Jeg kan. Tar med et lett spill som tar tjue minutter."],
      ],
      space: {
        facilities: ["Benker", "Lekeplass", "Ballbane"],
        access: "Åpent for alle",
        season: "Hele året",
      },
    },
    arrangement: {
      title: "Spilldagene på Kolbotn",
      hostId: "u17",
      when: "Lør 11:00",
      days: 2,
      venue: "organisasjon",
      organizer: "organisasjon",
      capacity: 80,
      going: 31,
      priceNok: 100,
      about:
        "To dager med brettspill i foreningens lokale. Hele spillsamlingen står framme, det er egne bord for nye, og på søndagen holder vi en liten turnering i et lett spill.",
      category: "Sosialt",
      duration: "Hele dagen",
      durationMin: 420,
      included: ["Lån av alle spill", "Kaffe og vafler"],
      vibes: ["Sosialt", "Koselig"],
      types: ["Festivaler", "Kulturelle aktiviteter"],
      audiences: ["Store grupper", "Førstegangsbesøkende", "Lokalkjente"],
      tags: ["Brettspill", "Festival"],
      photos: ["brettspill-2", "brettspill-1"],
      steps: [
        [
          "Lør 11:00 · Dørene åpner",
          "Spillsamlingen står framme, og det er egne bord for dem som vil lære noe nytt.",
          "brettspill-3",
        ],
        [
          "Lør 15:00 · Spill med en forklarer",
          "Folk fra foreningen setter seg ned og lærer bort et spill fra start til slutt.",
          "brettspill-1",
        ],
        [
          "Søn 12:00 · Turnering i et lett spill",
          "En kort turnering der alle kan melde seg på, også de som aldri har spilt før.",
          "brettspill-5",
        ],
        [
          "Søn 17:00 · Avslutning",
          "Vi rydder sammen og stemmer over helgens favorittspill.",
          "brettspill-4",
        ],
      ],
      reviews: [
        [
          "Line",
          "Kolbotn",
          5,
          "1 år siden",
          "Lørdagen gikk med til ett langt strategispill og mye latter. Turneringen på søndagen ble mer spennende enn jeg hadde trodd.",
        ],
        [
          "Geir",
          "Oppegård",
          4,
          "1 år siden",
          "Godt organisert og hyggelige folk. Det ble fullt rundt middagstid, så kom tidlig.",
        ],
        [
          "Amina",
          "Ski",
          5,
          "1 år siden",
          "Jeg dro dit alene og spilte med fremmede hele dagen. Gleder meg allerede til neste gang.",
        ],
      ],
      chat: [
        [
          "Spillforeningen på Kolbotn",
          "Programmet er klart. Si fra her hvis du vil hjelpe til med å forklare spill.",
        ],
        ["Thea", "Blir det mat der, eller bør vi ta med?"],
        [
          "Mats Eriksen",
          "Vi har kaffe og vafler. Ta med matpakke hvis du blir hele dagen.",
        ],
      ],
    },
    gruppe: {
      name: "Spillkveld på Grorud",
      about:
        "For deg som vil ha faste folk å spille med. Vi møtes på Terningen et par kvelder i måneden og avtaler spill i chatten.",
      rules:
        "Si fra i chatten hvis du kommer, så vi vet hvor mange bord vi trenger. Nye er velkomne, og vi forklarer reglene.",
      photos: ["brettspill-4", "brettspill-1"],
      memberCount: 52,
      home: "bedrift",
      access: "open",
      chat: [
        ["Hassan", "Noen som vil prøve et samarbeidsspill på torsdag?"],
        ["Marit", "Ja! Jeg har aldri prøvd et der alle spiller mot spillet."],
        ["Hassan", "Perfekt. Vi tar et lett et først."],
      ],
    },
  },
  {
    interest: "sjakk",
    bedrift: {
      name: "Kafé Rokade",
      category: "Kafé",
      coord: [10.9175, 59.997],
      town: "Hagan",
      address: "Hellinga 8, 1481 Hagan",
      hours: "Man–fre 08–18 · Lør 10–16",
      priceNok: 45,
      vibes: ["Rolig", "Koselig"],
      blurb: "Nabolagskafé med et sjakkbrett på hvert bord.",
      about:
        "Liten kafé på Hagan der det står et sjakkbrett på hvert bord. Du kan spille mot den du kom med, eller spørre om noen ved nabobordet vil ta et parti.",
      tags: ["Sjakkbrett på bordene", "Kaffe", "Rolig"],
      accessibility: ["Trinnfri inngang"],
      types: ["Kulturelle aktiviteter"],
      audiences: ["Alenereisende", "Par", "Lokalkjente"],
      durationMin: 90,
      photos: ["sjakk-6", "sjakk-3"],
      reviews: [
        [
          "Kåre B.",
          5,
          "1 uke siden",
          "Spilte mot en pensjonert lærer ved nabobordet og tapte tre ganger. Beste formiddagen på lenge.",
        ],
        [
          "Linnea S.",
          4,
          "1 måned siden",
          "Koselig sted og god kaffe. Det er få bord, så det kan være fullt på lørdager.",
        ],
        [
          "Rashid A.",
          5,
          "2 måneder siden",
          "Rolig nok til å tenke, men ingen blir sure om du prater litt mellom trekkene.",
        ],
      ],
      chat: [
        [
          "Kafé Rokade",
          "Vi har fått inn to sjakkur. Spør i disken hvis du vil spille på tid.",
        ],
        [
          "Petter",
          "Er det noen som pleier å spille her på lørdagsformiddagen?",
        ],
        ["Gro", "Jeg er der som regel fra ti. Bare hils!"],
      ],
      business: {
        name: "Kafé Rokade",
        verified: false,
        about: "Kafé på Hagan, drevet av et par som møttes i en sjakklubb.",
      },
    },
    organisasjon: {
      name: "Slemmestad Sjakkvenner",
      category: "Sjakklubb",
      coord: [10.4959, 59.7817],
      town: "Slemmestad",
      address: "Vaterlandsveien 21, 3470 Slemmestad",
      hours: "Tor 18–22",
      priceNok: 0,
      vibes: ["Rolig", "Sosial"],
      blurb:
        "Sjakklubb for voksne, fra helt nye til de som har spilt i årevis.",
      about:
        "Vi spiller sjakk hver torsdag kveld. Noen spiller lange partier, andre lynsjakk, og det er alltid noen som vil gå gjennom et parti med deg etterpå.",
      tags: ["Torsdagssjakk", "Nybegynnere", "Lynsjakk"],
      accessibility: ["Trinnfri inngang", "Rullestol-WC"],
      types: ["Kulturelle aktiviteter"],
      photos: ["sjakk-4", "sjakk-1"],
      reviews: [
        [
          "Øyvind N.",
          5,
          "3 uker siden",
          "Jeg hadde ikke spilt siden ungdomsskolen. Tobias gikk gjennom åpningene med meg uten å gjøre det til en forelesning.",
        ],
        [
          "Helene K.",
          4,
          "2 måneder siden",
          "Hyggelig klubb, men det blir stille og konsentrert. Ikke stedet for å prate mye.",
        ],
      ],
      chat: [
        [
          "Slemmestad Sjakkvenner",
          "Torsdag ser vi på sluttspill med tårn. Ta gjerne med et parti du vil gå gjennom.",
        ],
        ["Jon", "Hvor lenge varer kveldene vanligvis?"],
        [
          "Tobias Strand",
          "Fra seks til rundt ti, men du kan komme og gå som du vil.",
        ],
      ],
      org: {
        form: "Klubb",
        about:
          "Sjakklubb i Slemmestad for voksne på alle nivåer. Vi spiller, ser på partier sammen og holder en sjakkhelg i blant.",
        activities: [
          "Klubbkveld hver torsdag",
          "Kveld for nye spillere",
          "Sjakkhelg med turnering",
        ],
        contactPersonId: "u20",
      },
    },
    byrom: {
      name: "Birkelunden",
      category: "Park",
      coord: [10.76, 59.9262],
      town: "Grünerløkka",
      address: "Birkelunden, 0553 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Sosial", "Rolig"],
      blurb: "Parken midt på Grünerløkka, med benker under trærne.",
      about:
        "Liten park omgitt av bygårder og kafeer på Grünerløkka. Benkene under trærne er et godt sted for et parti sjakk når været er fint.",
      tags: ["Gratis", "Ute", "Sentralt"],
      accessibility: ["Trinnfri inngang"],
      types: ["Friluftsliv"],
      photos: ["sjakk-7", "sjakk-5"],
      reviews: [
        [
          "Tomas V.",
          5,
          "2 uker siden",
          "Satt på en benk med et reisesjakk og fikk to utfordrere før kaffen var kald.",
        ],
        [
          "Rita H.",
          4,
          "1 måned siden",
          "Fin park, men det kan bli mye folk og bråk på varme kvelder.",
        ],
      ],
      chat: [
        ["Erlend", "Noen som vil spille sjakk i Birkelunden lørdag formiddag?"],
        ["Sofia", "Hvis det ikke regner, er jeg med. Har med brett."],
      ],
      space: {
        facilities: ["Benker", "Sykkelparkering"],
        access: "Åpent for alle",
        season: "Hele året",
      },
    },
    opplevelse: {
      title: "Sjakk for nye",
      hostId: "u20",
      when: "Tor 18:00",
      repeat: "Ukentlig",
      venue: "organisasjon",
      capacity: 12,
      going: 7,
      priceNok: 0,
      about:
        "En rolig kveld for deg som kan reglene, men ikke mye mer. Vi spiller korte partier, går gjennom dem sammen og ser på hvordan man åpner et parti.",
      category: "Sosialt",
      duration: "2 timer",
      durationMin: 120,
      languages: ["Norsk", "Engelsk"],
      included: ["Lån av brett og klokke", "Kaffe"],
      vibes: ["Lærerikt", "Rolig"],
      types: ["Kulturelle aktiviteter"],
      audiences: ["Alenereisende", "Førstegangsbesøkende"],
      tags: ["Sjakk", "Nybegynner"],
      photos: ["sjakk-1", "sjakk-3"],
      steps: [
        [
          "Velkommen",
          "Vi deler folk i par etter hvor mye de har spilt.",
          "sjakk-4",
        ],
        [
          "Korte partier",
          "Du spiller to korte partier mot en annen ny spiller.",
          "sjakk-1",
        ],
        [
          "Vi ser på partiene",
          "Tobias går gjennom et par av partiene på et stort brett og viser hva som kunne vært gjort annerledes.",
          "sjakk-3",
        ],
        [
          "Kaffe og prat",
          "Mange blir sittende og spille et parti til.",
          "sjakk-6",
        ],
      ],
      reviews: [
        [
          "Ragnhild",
          "Asker",
          5,
          "2 uker siden",
          "Endelig et sted der ingen sukker når du gjør et dårlig trekk. Jeg har vært der fire torsdager nå.",
        ],
        [
          "Daniel",
          "Heggedal",
          4,
          "1 måned siden",
          "Lærerikt og hyggelig. Litt for kort tid til gjennomgangen, men det sier vel mest om at det var interessant.",
        ],
        [
          "Mira",
          "Slemmestad",
          5,
          "2 måneder siden",
          "Tobias forklarer enkelt og tålmodig. Jeg skjønte endelig hvorfor jeg alltid mister dronningen.",
        ],
      ],
      chat: [
        [
          "Tobias Strand",
          "Velkommen til torsdagens kveld for nye! Ta med det du kan, så tar vi resten sammen.",
        ],
        ["Mira", "Må vi kunne notere partiene?"],
        [
          "Tobias Strand",
          "Nei, det lærer vi deg hvis du vil. Det holder å vite hvordan brikkene går.",
        ],
      ],
    },
    arrangement: {
      title: "Sjakkhelgen i Slemmestad",
      hostId: "u20",
      when: "Lør 10:00",
      days: 2,
      venue: "organisasjon",
      organizer: "organisasjon",
      capacity: 40,
      going: 22,
      priceNok: 150,
      about:
        "En helg med sjakk i klubblokalet. Lørdag er det turnering i hurtigsjakk for alle nivåer, og søndag spiller vi lynsjakk og går gjennom helgens beste partier sammen.",
      category: "Sosialt",
      duration: "Hele dagen",
      durationMin: 420,
      included: ["Kaffe og lunsj begge dager", "Lån av brett og klokke"],
      vibes: ["Sosialt", "Lærerikt"],
      types: ["Festivaler", "Kulturelle aktiviteter"],
      audiences: ["Alenereisende", "Lokalkjente"],
      tags: ["Sjakk", "Turnering"],
      photos: ["sjakk-4", "sjakk-2"],
      steps: [
        [
          "Lør 10:00 · Innsjekk",
          "Vi deler inn i grupper etter erfaring, så ingen møter en mester i første runde.",
          "sjakk-4",
        ],
        [
          "Lør 12:00 · Hurtigsjakk",
          "Fem runder med partier på femten minutter.",
          "sjakk-1",
        ],
        [
          "Søn 11:00 · Lynsjakk",
          "Raske partier hele formiddagen, for dem som vil.",
          "sjakk-5",
        ],
        [
          "Søn 15:00 · Gjennomgang",
          "Vi ser på de beste partiene på storskjerm og avslutter med kaffe.",
          "sjakk-3",
        ],
      ],
      reviews: [
        [
          "Knut",
          "Asker",
          5,
          "1 år siden",
          "Jeg vant ett parti av fem og hadde det kjempegøy. Gruppene var godt satt sammen, så alle fikk jevne partier.",
        ],
        [
          "Selma",
          "Røyken",
          4,
          "1 år siden",
          "Fint arrangert, men lunsjen kom sent på lørdagen, og vi ble sultne mellom rundene.",
        ],
        [
          "Arne",
          "Slemmestad",
          5,
          "1 år siden",
          "Gjennomgangen på søndagen var det beste. Lærte mer der enn på et helt år alene.",
        ],
      ],
      chat: [
        [
          "Slemmestad Sjakkvenner",
          "Påmeldingen er åpen. Skriv her hvis du trenger skyss fra Asker stasjon.",
        ],
        ["Knut", "Jeg kjører fra Asker lørdag morgen og har plass til to."],
        [
          "Tobias Strand",
          "Takk, Knut! Da kan de som trenger skyss, sende deg en melding.",
        ],
      ],
    },
    gruppe: {
      name: "Sjakk og kaffe i Nittedal",
      about:
        "For deg som vil spille sjakk uten klubbstemning. Vi møtes på Kafé Rokade på lørdager og spiller så mange partier vi orker.",
      rules:
        "Si fra i chatten hvis du kommer. Alle nivåer er velkomne, og vi spiller for moro skyld.",
      photos: ["sjakk-6", "sjakk-2"],
      memberCount: 27,
      home: "bedrift",
      access: "open",
      chat: [
        ["Gro", "Jeg er på Rokade fra ti på lørdag. Noen som blir med?"],
        ["Petter", "Kommer rundt elleve. Ta med klokka di!"],
        ["Gro", "Gjør det. Fem minutter hver?"],
      ],
    },
  },
  {
    interest: "diskusjon",
    bedrift: {
      name: "Ordskiftet",
      category: "Bar",
      coord: [10.7537, 59.9383],
      town: "Sagene",
      address: "Kristiansands gate 7, 0463 Oslo",
      hours: "Tir–tor 16–00 · Fre–lør 16–02",
      priceNok: 110,
      vibes: ["Sosial", "Livlig"],
      blurb: "Nabolagsbar med debattkveld hver tirsdag.",
      about:
        "Bar på Sagene med lange bord og plass til å høre hverandre. På tirsdager skriver vi et tema på tavla, og den som vil, får ordet.",
      tags: ["Debattkveld", "Bar", "Lange bord"],
      accessibility: ["Trinnfri inngang"],
      types: ["Natteliv", "Kulturelle aktiviteter"],
      audiences: ["Alenereisende", "Store grupper", "Lokalkjente"],
      durationMin: 120,
      photos: ["diskusjon-3", "diskusjon-2"],
      reviews: [
        [
          "Even S.",
          5,
          "1 uke siden",
          "Kom for en øl og ble sittende til midnatt og diskutere om byen trenger flere biler. Uenige, men vi skiltes som venner.",
        ],
        [
          "Natalia P.",
          4,
          "3 uker siden",
          "Gode tema og hyggelig betjening. Det kan bli trangt når mange vil ha ordet samtidig.",
        ],
        [
          "Joakim R.",
          4,
          "2 måneder siden",
          "Fin bar også de dagene det ikke er debatt. Litt dyrt øl.",
        ],
      ],
      chat: [
        [
          "Ordskiftet",
          "Tirsdagens tema: Bør mobilen ut av klasserommet? Vi starter halv åtte.",
        ],
        [
          "Hilde",
          "Godt tema. Jeg tar med en kollega som er helt uenig med meg.",
        ],
        [
          "Ordskiftet",
          "Da blir det en god kveld. Vi holder av et bord til dere.",
        ],
      ],
      business: {
        name: "Ordskiftet AS",
        verified: true,
        about:
          "Bar på Sagene, startet av to venner som savnet et sted å diskutere uten skjerm.",
      },
    },
    organisasjon: {
      name: "Samtaleklubben på Grønland",
      category: "Samtaleklubb",
      coord: [10.766, 59.912],
      town: "Grønland",
      address: "Grønlandsleiret 30, 0190 Oslo",
      hours: "Ons 18–21",
      priceNok: 0,
      vibes: ["Rolig", "Sosial"],
      blurb: "En klubb for gode samtaler om store og små spørsmål.",
      about:
        "Vi møtes på onsdager og snakker om ett spørsmål om gangen, fra arbeid og byliv til hva som gjør en god nabo. Målet er å forstå hverandre, ikke å vinne.",
      tags: ["Samtaler", "Nye ansikter", "Kaffe"],
      accessibility: ["Trinnfri inngang", "Heis"],
      types: ["Kulturelle aktiviteter"],
      photos: ["diskusjon-4", "diskusjon-5"],
      reviews: [
        [
          "Margrethe L.",
          5,
          "2 uker siden",
          "Jeg gruet meg til å si noe i en gruppe fremmede, men ingen avbryter, og alle får snakke ferdig.",
        ],
        [
          "Yonas T.",
          4,
          "1 måned siden",
          "Gode samtaler. Noen tema blir litt for store for én kveld, men det gjør at man vil komme igjen.",
        ],
      ],
      chat: [
        [
          "Samtaleklubben på Grønland",
          "Onsdagens spørsmål: Hva skal til for at du blir kjent med naboene dine?",
        ],
        [
          "Kristin",
          "Godt spørsmål. Jeg har bodd i samme oppgang i fem år og vet navnet på to.",
        ],
        [
          "Åse Kvam",
          "Da har du noe å bidra med på onsdag! Vi starter klokka seks.",
        ],
      ],
      org: {
        form: "Forening",
        about:
          "Samtaleforening på Grønland for alle som liker å snakke om ting som betyr noe. Vi har én regel: lytt før du svarer.",
        activities: [
          "Samtalekveld hver onsdag",
          "Kvelder med inviterte innledere",
          "Samtaledagen på Grønland",
        ],
        contactPersonId: "u3",
      },
    },
    byrom: {
      name: "Eidsvolls plass",
      category: "Park",
      coord: [10.7389, 59.9133],
      town: "Sentrum",
      address: "Eidsvolls plass, 0162 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Livlig", "Sosial"],
      blurb: "Parken foran Stortinget, ved Karl Johans gate.",
      about:
        "Parken foran Stortinget, ved Karl Johans gate. Her møtes folk, og det er ofte noen som holder appell eller deler ut løpesedler.",
      tags: ["Gratis", "Ute", "Sentralt"],
      accessibility: ["Trinnfri inngang"],
      types: ["Landemerker", "Historie"],
      photos: ["diskusjon-7", "diskusjon-6"],
      reviews: [
        [
          "Petra O.",
          5,
          "3 uker siden",
          "Godt sted å sette seg med en kaffe og se på livet foran Stortinget.",
        ],
        [
          "Bjørn A.",
          4,
          "2 måneder siden",
          "Fin park midt i byen. Det er mye folk og mye som skjer, så ikke kom hit for å få ro.",
        ],
      ],
      chat: [
        [
          "Lise",
          "Noen fra samtaleklubben tar en tur hit etter onsdagsmøtet, hvis været holder.",
        ],
        ["Morten", "Vi kan ta med kaffe og sette oss på en benk."],
      ],
      space: {
        facilities: ["Benker", "Sykkelparkering"],
        access: "Åpent for alle",
        season: "Hele året",
      },
    },
    opplevelse: {
      title: "Debattkveld på Ordskiftet",
      hostId: "u3",
      when: "Tir 19:30",
      repeat: "Ukentlig",
      venue: "bedrift",
      capacity: 30,
      going: 18,
      priceNok: 0,
      about:
        "En kveld for deg som vil øve på å si meningen din, og på å lytte til folk som mener noe annet. Åse leder, holder tiden og passer på at alle som vil, får ordet.",
      category: "Sosialt",
      duration: "2 timer",
      durationMin: 120,
      languages: ["Norsk"],
      included: ["Ordstyrer hele kvelden", "Kaffe eller te"],
      vibes: ["Sosialt", "Lærerikt"],
      types: ["Kulturelle aktiviteter", "Natteliv"],
      audiences: ["Alenereisende", "Lokalkjente"],
      tags: ["Debatt", "Samtale"],
      photos: ["diskusjon-3", "diskusjon-1"],
      steps: [
        [
          "Kvelden starter",
          "Åse presenterer temaet og to korte innlegg, ett for og ett mot.",
          "diskusjon-1",
        ],
        [
          "Ordet er fritt",
          "Alle som vil, får to minutter. Åse holder tiden og en liste over hvem som står for tur.",
          "diskusjon-3",
        ],
        [
          "Bytt side",
          "Du argumenterer for det motsatte av det du mener. Det er vanskeligere og morsommere enn det høres ut.",
          "diskusjon-2",
        ],
        [
          "Prat ved bordene",
          "Mange blir sittende og fortsetter samtalen over en kopp eller et glass.",
          "diskusjon-4",
        ],
      ],
      reviews: [
        [
          "Sindre",
          "Sagene",
          5,
          "1 uke siden",
          "Jeg måtte argumentere for bompenger, som jeg ikke tåler. Lærte mer om meg selv enn om bompenger.",
        ],
        [
          "Laila",
          "Bjølsen",
          4,
          "3 uker siden",
          "Godt ledet og trygg stemning. Noen snakket mye mer enn andre, men Åse tok tak i det.",
        ],
        [
          "Viktor",
          "Torshov",
          5,
          "1 måned siden",
          "Den beste tirsdagsvanen jeg har hatt. Jeg kom alene og gikk hjem med tre nye bekjente.",
        ],
      ],
      chat: [
        [
          "Åse Kvam",
          "Tirsdag snakker vi om mobilen i klasserommet. Ta med en mening, eller kom og finn en!",
        ],
        ["Laila", "Må man si noe, eller kan man bare høre på?"],
        ["Åse Kvam", "Du bestemmer selv. Mange hører bare på første gang."],
      ],
    },
    arrangement: {
      title: "Samtaledagen på Grønland",
      hostId: "u3",
      when: "Lør 12:00",
      days: 1,
      venue: "organisasjon",
      organizer: "organisasjon",
      capacity: 60,
      going: 26,
      priceNok: 0,
      about:
        "En dag med samtaler i små grupper om hvordan vi bor og lever sammen i byen. Det blir korte innledninger, samtalegrupper og en felles oppsummering.",
      category: "Sosialt",
      duration: "Hele dagen",
      durationMin: 300,
      included: ["Kaffe og lunsj", "Plass i en samtalegruppe"],
      vibes: ["Sosialt", "Lærerikt"],
      types: ["Kulturelle aktiviteter"],
      audiences: ["Alenereisende", "Store grupper", "Lokalkjente"],
      tags: ["Samtale", "Debatt"],
      photos: ["diskusjon-1", "diskusjon-5"],
      steps: [
        [
          "12:00 · Velkommen",
          "Kaffe, navnelapper og en kort innledning om dagens spørsmål.",
          "diskusjon-5",
        ],
        [
          "12:30 · Samtalegrupper",
          "Vi deler oss i grupper på seks, hver med en samtaleleder.",
          "diskusjon-4",
        ],
        ["14:00 · Lunsj", "Felles lunsj der gruppene blandes.", "diskusjon-2"],
        [
          "15:00 · Panelsamtale",
          "Tre naboer med ulik bakgrunn snakker om det gruppene har kommet fram til.",
          "diskusjon-1",
        ],
      ],
      reviews: [
        [
          "Hanne",
          "Gamle Oslo",
          5,
          "1 år siden",
          "Jeg satt i gruppe med en drosjesjåfør, en student og en pensjonert prest. Den beste samtalen jeg har hatt på lenge.",
        ],
        [
          "Omar",
          "Tøyen",
          4,
          "1 år siden",
          "Fin dag. Panelet på slutten ble litt langt, men gruppene var verdt hele turen.",
        ],
        [
          "Ingrid",
          "Kampen",
          5,
          "1 år siden",
          "Godt organisert, og ingen prøvde å selge meg noe. Bare folk som ville snakke sammen.",
        ],
      ],
      chat: [
        [
          "Samtaleklubben på Grønland",
          "Vi trenger noen flere samtaleledere. Si fra her hvis du vil hjelpe til.",
        ],
        ["Hanne", "Jeg kan ta en gruppe. Var med i fjor."],
        [
          "Åse Kvam",
          "Tusen takk, Hanne. Jeg sender deg spørsmålene på torsdag.",
        ],
      ],
    },
    gruppe: {
      name: "Kaffe og uenighet",
      about:
        "For deg som liker å diskutere, men ikke på nett. Vi møtes på Ordskiftet et par ganger i måneden og snakker om det som opptar oss.",
      rules:
        "Vær uenig med meningen, ikke med personen. Si fra i chatten hvis du kommer.",
      photos: ["diskusjon-2", "diskusjon-4"],
      memberCount: 64,
      home: "bedrift",
      access: "open",
      chat: [
        [
          "Jonatan",
          "Noen som vil ta en kaffe på Ordskiftet torsdag og snakke om firedagersuke?",
        ],
        [
          "Ragnhild",
          "Ja! Jeg er for, men vil gjerne bli overbevist om det motsatte.",
        ],
        ["Jonatan", "Da tar jeg motsatt side. Sju?"],
      ],
    },
  },
];
